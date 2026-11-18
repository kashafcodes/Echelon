// ══════════════════════════════════════════
//  LokArt AI Assistant — Command Executor
//  Maps intents → real API/context actions
// ══════════════════════════════════════════

import { apiFetch } from "../services/api.js";
import { INTENTS } from "./intentEngine.js";

// ── Helpers ───────────────────────────────
function ensureCustomer(user) {
  if (!user) throw new Error("not_logged_in");
}
function ensureVendor(user) {
  if (!user) throw new Error("not_logged_in");
  if (user.role !== "vendor" && user.role !== "admin") throw new Error("not_vendor");
}

// ── Executor ──────────────────────────────
export async function executeCommand({
  intent,
  entities = {},
  conversationState = {},
  user,
  cartContext,
  confirmed = false,
}) {
  try {
    switch (intent) {
      // ── GREET / HELP ─────────────────────
      case INTENTS.GREET:
        return { type: "GREET", user };

      case INTENTS.HELP:
        return { type: "HELP", role: user?.role || "guest" };

      // ── SEARCH ───────────────────────────
      case INTENTS.SEARCH_PRODUCTS: {
        const params = new URLSearchParams();
        if (entities.query) params.set("search", entities.query);
        if (entities.category) params.set("category", entities.category);
        if (entities.sort) params.set("sort", entities.sort);
        params.set("limit", "6");
        params.set("page", "1");

        const data = await apiFetch(`/products?${params}`);
        const products = data?.products || [];
        return { type: "SEARCH_RESULTS", products, query: entities.query || entities.category || "" };
      }

      // ── CART ─────────────────────────────
      case INTENTS.VIEW_CART: {
        const { cart, cartTotal, cartCount } = cartContext;
        return { type: "CART_VIEW", cart, cartTotal, cartCount };
      }

      case INTENTS.ADD_TO_CART: {
        ensureCustomer(user);
        // Product comes from conversationState.lastResults[0] or specific index
        const idx = typeof entities.number === "number" ? entities.number - 1 : 0;
        const products = conversationState.lastResults || [];
        const product = products[idx] || conversationState.pendingProduct;
        if (!product) return { type: "NEED_PRODUCT" };
        cartContext.addToCart(product, entities.number && entities.number > 0 && products.length === 0 ? entities.number : 1);
        return { type: "ADDED_TO_CART", product };
      }

      case INTENTS.REMOVE_FROM_CART: {
        ensureCustomer(user);
        const { cart } = cartContext;
        const q = (entities.query || "").toLowerCase();
        const item = cart.find((c) => c.name.toLowerCase().includes(q)) || cart[0];
        if (!item) return { type: "CART_VIEW", cart: [], cartTotal: 0, cartCount: 0 };
        cartContext.removeFromCart(item._id);
        return { type: "REMOVED_FROM_CART", product: item };
      }

      case INTENTS.CLEAR_CART: {
        ensureCustomer(user);
        if (!confirmed) return { type: "CONFIRM_CLEAR_CART" };
        cartContext.clearCart();
        return { type: "CART_CLEARED" };
      }

      case INTENTS.UPDATE_QUANTITY: {
        ensureCustomer(user);
        const { cart } = cartContext;
        const q = (entities.query || "").toLowerCase();
        const qty = entities.number;
        if (!qty) return { type: "ERROR", message: "Please specify a quantity." };
        const item = cart.find((c) => c.name.toLowerCase().includes(q)) || cart[0];
        if (!item) return { type: "CART_VIEW", cart: [], cartTotal: 0, cartCount: 0 };
        cartContext.updateCartQty(item._id, qty);
        return { type: "QUANTITY_UPDATED", product: item, quantity: qty };
      }

      // ── WISHLIST ──────────────────────────
      case INTENTS.VIEW_WISHLIST: {
        const { wishlist } = cartContext;
        return { type: "WISHLIST_VIEW", wishlist };
      }

      case INTENTS.ADD_TO_WISHLIST: {
        ensureCustomer(user);
        const products = conversationState.lastResults || [];
        const idx = typeof entities.number === "number" ? entities.number - 1 : 0;
        const product = products[idx] || conversationState.pendingProduct;
        if (!product) return { type: "NEED_PRODUCT" };
        cartContext.toggleWishlist(product);
        return { type: "ADDED_TO_WISHLIST", product };
      }

      case INTENTS.REMOVE_FROM_WISHLIST: {
        ensureCustomer(user);
        const { wishlist } = cartContext;
        const q = (entities.query || "").toLowerCase();
        const item = wishlist.find((w) => w.name.toLowerCase().includes(q)) || wishlist[0];
        if (item) cartContext.toggleWishlist(item);
        return { type: "REMOVED_FROM_WISHLIST", product: item };
      }

      // ── ORDERS ───────────────────────────
      case INTENTS.VIEW_ORDERS: {
        ensureCustomer(user);
        const data = await apiFetch("/orders/my");
        const orders = data?.orders || data || [];
        return { type: "ORDERS_VIEW", orders };
      }

      case INTENTS.CHECK_ORDER_STATUS: {
        ensureCustomer(user);
        const orderId = entities.orderId || conversationState.lastOrderId;
        if (orderId) {
          const data = await apiFetch(`/orders/${orderId}`);
          const order = data?.order || data;
          return { type: "ORDER_STATUS", order };
        }
        // list orders so user can pick
        const data2 = await apiFetch("/orders/my");
        const orders2 = data2?.orders || data2 || [];
        return { type: "ORDERS_VIEW", orders: orders2, promptPick: true };
      }

      case INTENTS.CANCEL_ORDER: {
        ensureCustomer(user);
        const orderId = entities.orderId || conversationState.lastOrderId;
        if (!orderId) {
          const data = await apiFetch("/orders/my");
          const orders = data?.orders || data || [];
          return { type: "ORDERS_VIEW", orders, promptCancel: true };
        }
        if (!confirmed) return { type: "CONFIRM_CANCEL_ORDER", orderId };
        const res = await apiFetch(`/orders/${orderId}/cancel`, { method: "PATCH" });
        if (res?.ok || res?.message?.includes("cancel")) return { type: "ORDER_CANCELLED" };
        throw new Error(res?.message || "Failed to cancel order");
      }

      case INTENTS.START_CHECKOUT: {
        ensureCustomer(user);
        const { cartCount } = cartContext;
        if (!cartCount) return { type: "CART_VIEW", cart: [], cartTotal: 0, cartCount: 0 };
        window.location.hash = "#checkout";
        return { type: "CHECKOUT_STARTED" };
      }

      // ── VENDOR ───────────────────────────
      case INTENTS.VENDOR_VIEW_ORDERS: {
        ensureVendor(user);
        const data = await apiFetch("/orders/vendor/orders");
        const orders = data?.orders || data || [];
        return { type: "VENDOR_ORDERS_VIEW", orders };
      }

      case INTENTS.VENDOR_VIEW_PRODUCTS: {
        ensureVendor(user);
        const data = await apiFetch("/vendor/products");
        const products = data?.products || data || [];
        return { type: "VENDOR_PRODUCTS_VIEW", products };
      }

      case INTENTS.VENDOR_VIEW_EARNINGS: {
        ensureVendor(user);
        const data = await apiFetch("/commission/vendor/overview");
        return { type: "VENDOR_EARNINGS", data: data?.data || data };
      }

      case INTENTS.VENDOR_LOW_STOCK: {
        ensureVendor(user);
        const data = await apiFetch("/vendor/products");
        const products = (data?.products || data || []).filter(
          (p) => !p.quantity || p.quantity <= 5
        );
        return { type: "VENDOR_LOW_STOCK", products };
      }

      // ── CONFIRM / DENY ───────────────────
      case INTENTS.CONFIRM:
        return { type: "CONFIRM_SIGNAL" };

      case INTENTS.DENY:
        return { type: "DENY_SIGNAL" };

      default:
        return { type: "UNKNOWN" };
    }
  } catch (err) {
    if (err.message === "not_logged_in") return { type: "NOT_LOGGED_IN" };
    if (err.message === "not_vendor") return { type: "NOT_VENDOR" };
    return { type: "ERROR", message: err.message || "An error occurred" };
  }
}
