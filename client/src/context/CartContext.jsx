import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "lokart_cart";
const WISHLIST_STORAGE_KEY = "lokart_wishlist";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (_) {}
  }, [wishlist]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const addToCart = (product, qty = 1) => {
    if (!product || product.quantity === 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.quantity || 99);
        showNotification(`Updated quantity for ${product.name}`);
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      showNotification(`Added ${product.name} to cart`);
      return [
        ...prevCart,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || "",
          category: product.category,
          artisanName: product.artisanName || product.vendor?.businessName || "Local Artisan",
          origin: product.origin || "",
          maxStock: product.quantity,
          quantity: Math.min(qty, product.quantity || 1),
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.min(qty, item.maxStock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    if (!product?._id) return;
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        showNotification(`Removed from wishlist`);
        return prev.filter((item) => item._id !== product._id);
      }
      showNotification(`Added ${product.name} to wishlist`);
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || "",
          category: product.category,
          artisanName: product.artisanName || product.vendor?.businessName || "Local Artisan",
          origin: product.origin || "",
        },
      ];
    });
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isWishlisted,
        notification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
