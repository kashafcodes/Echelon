// ══════════════════════════════════════════
//  LokArt AI Assistant — Conversation Manager
//  Stateful multi-turn conversation engine
// ══════════════════════════════════════════

import { classifyIntent, INTENTS } from "./intentEngine.js";
import { enhanceIntentWithOllama } from "./ollamaService.js";
import { executeCommand } from "./commandExecutor.js";
import { getResponse, LANGS } from "./i18n.js";

// ── State shape ───────────────────────────
export function createInitialState() {
  return {
    lastResults: [],         // last search results (products)
    pendingProduct: null,    // product to act on
    pendingAction: null,     // { intent, entities } waiting for confirmation
    lastOrderId: null,       // last mentioned order ID
    step: null,              // multi-step flow step name
    formData: {},            // accumulated multi-step form data
  };
}

// ── Format result into chat messages ─────
function buildMessages(result, lang = LANGS.EN) {
  const msgs = [];

  const push = (text, type = "text", data = null) =>
    msgs.push({ role: "assistant", text, type, data });

  switch (result.type) {
    case "GREET":
      push(getResponse("greet", lang, result.user?.name));
      break;

    case "HELP":
      push(
        result.role === "vendor"
          ? getResponse("help_vendor", lang)
          : getResponse("help_customer", lang)
      );
      break;

    case "SEARCH_RESULTS":
      if (result.products.length === 0) {
        push(getResponse("search_results", lang, 0, result.query));
      } else {
        push(getResponse("search_results", lang, result.products.length, result.query));
        push("", "product_list", result.products);
      }
      break;

    case "CART_VIEW":
      if (!result.cartCount) {
        push(getResponse("cart_empty", lang));
      } else {
        push(getResponse("cart_summary", lang, result.cartCount, result.cartTotal));
        push("", "cart_items", result.cart);
      }
      break;

    case "ADDED_TO_CART":
      push(getResponse("added_to_cart", lang, result.product?.name));
      break;

    case "REMOVED_FROM_CART":
      push(getResponse("removed_from_cart", lang, result.product?.name));
      break;

    case "CONFIRM_CLEAR_CART":
      push(`${getResponse("cart_summary", lang, 0, 0)} Are you sure you want to clear your entire cart? Reply "yes" to confirm.`);
      push("🗑️ Clear all cart items? Reply **yes** or **no**.", "confirm_prompt", { action: "CLEAR_CART" });
      break;

    case "CART_CLEARED":
      push(getResponse("cart_cleared", lang));
      break;

    case "QUANTITY_UPDATED":
      push(getResponse("quantity_updated", lang, result.product?.name, result.quantity));
      break;

    case "NEED_PRODUCT":
      push(getResponse("need_product", lang));
      break;

    case "WISHLIST_VIEW":
      if (!result.wishlist?.length) {
        push(getResponse("wishlist_empty", lang));
      } else {
        push(getResponse("wishlist_summary", lang, result.wishlist.length));
        push("", "product_list", result.wishlist);
      }
      break;

    case "ADDED_TO_WISHLIST":
      push(getResponse("added_to_wishlist", lang, result.product?.name));
      break;

    case "REMOVED_FROM_WISHLIST":
      push(getResponse("removed_from_wishlist", lang, result.product?.name));
      break;

    case "ORDERS_VIEW": {
      if (!result.orders?.length) {
        push(getResponse("orders_empty", lang));
      } else {
        push(getResponse("orders_summary", lang, result.orders.length));
        push("", "order_list", result.orders);
        if (result.promptPick) push("Which order would you like to check the status for? Reply with the order number.");
        if (result.promptCancel) push("Which order would you like to cancel? Reply with the order number.");
      }
      break;
    }

    case "ORDER_STATUS":
      if (result.order) {
        push(getResponse("order_status", lang, result.order._id || "", result.order.status || "unknown"));
      } else {
        push("Order not found.");
      }
      break;

    case "CONFIRM_CANCEL_ORDER":
      push(getResponse("cancel_confirm", lang, result.orderId));
      break;

    case "ORDER_CANCELLED":
      push(getResponse("order_cancelled", lang));
      break;

    case "CHECKOUT_STARTED":
      push(getResponse("checkout_redirect", lang));
      break;

    case "VENDOR_ORDERS_VIEW":
      if (!result.orders?.length) {
        push(getResponse("vendor_orders_empty", lang));
      } else {
        push(getResponse("vendor_orders_summary", lang, result.orders.length));
        push("", "order_list", result.orders);
      }
      break;

    case "VENDOR_PRODUCTS_VIEW":
      if (!result.products?.length) {
        push(getResponse("vendor_products_empty", lang));
      } else {
        push(getResponse("vendor_products_summary", lang, result.products.length));
        push("", "product_list", result.products);
      }
      break;

    case "VENDOR_EARNINGS":
      push(getResponse("vendor_earnings_summary", lang, result.data || {}));
      break;

    case "VENDOR_LOW_STOCK":
      push(getResponse("vendor_low_stock", lang, result.products?.length || 0));
      if (result.products?.length > 0) push("", "product_list", result.products);
      break;

    case "NOT_LOGGED_IN":
      push(getResponse("login_required", lang));
      break;

    case "NOT_VENDOR":
      push(getResponse("not_allowed", lang));
      break;

    case "CONFIRM_SIGNAL":
      push(getResponse("no_pending_action", lang));
      break;

    case "DENY_SIGNAL":
      push("Okay, action cancelled.");
      break;

    case "ERROR":
      push(getResponse("error", lang, result.message || "unknown error"));
      break;

    case "UNKNOWN":
    default:
      push(getResponse("unknown", lang));
      break;
  }

  return msgs;
}

// ── Main process function ─────────────────
export async function processMessage({
  text,
  conversationState,
  user,
  cartContext,
  lang = LANGS.EN,
  messageHistory = [],
}) {
  let state = { ...conversationState };

  // ── Handle pending confirmation ───────
  if (state.pendingAction) {
    const lowerText = text.toLowerCase().trim();
    const isYes = ["yes", "yeah", "yep", "ok", "okay", "sure", "confirm", "do it", "go ahead", "हो", "हाँ", "ठीक"].some((w) => lowerText.includes(w));
    const isNo = ["no", "nope", "cancel", "stop", "abort", "नहीं", "नो"].some((w) => lowerText.includes(w));

    if (isYes) {
      const { intent, entities, orderId } = state.pendingAction;
      state.pendingAction = null;
      const result = await executeCommand({
        intent,
        entities: { ...entities, orderId: orderId || entities.orderId },
        conversationState: state,
        user,
        cartContext,
        confirmed: true,
      });
      const msgs = buildMessages(result, lang);
      return { messages: msgs, newState: state };
    }

    if (isNo) {
      state.pendingAction = null;
      return {
        messages: [{ role: "assistant", text: "Okay, action cancelled. What else can I help you with?", type: "text" }],
        newState: state,
      };
    }
  }

  // ── Classify intent ───────────────────
  let classification = classifyIntent(text);

  // Try Ollama enhancement (non-blocking — if fast enough)
  try {
    const ollamaResult = await enhanceIntentWithOllama(text, messageHistory);
    if (ollamaResult && ollamaResult.confidence > classification.confidence) {
      classification = { ...classification, ...ollamaResult };
    }
  } catch (_) {
    // Ollama unavailable — use rule-based classification
  }

  const { intent, entities } = classification;

  // ── Execute command ───────────────────
  const result = await executeCommand({
    intent,
    entities,
    conversationState: state,
    user,
    cartContext,
    confirmed: false,
  });

  // ── Handle state updates ──────────────
  if (result.type === "SEARCH_RESULTS") {
    state.lastResults = result.products || [];
  }
  if (result.type === "ADDED_TO_CART" && result.product) {
    state.pendingProduct = null;
  }
  if (result.type === "CONFIRM_CANCEL_ORDER") {
    state.pendingAction = { intent: INTENTS.CANCEL_ORDER, entities, orderId: result.orderId };
  }
  if (result.type === "CONFIRM_CLEAR_CART") {
    state.pendingAction = { intent: INTENTS.CLEAR_CART, entities };
  }
  if (result.type === "ORDERS_VIEW" && result.orders?.length > 0) {
    state.lastOrderId = result.orders[0]?._id;
  }
  if (result.type === "ORDER_STATUS" && result.order?._id) {
    state.lastOrderId = result.order._id;
  }

  // ── Build response messages ───────────
  const msgs = buildMessages(result, lang);

  return { messages: msgs, newState: state };
}
