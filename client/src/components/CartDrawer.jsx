import { useCart } from "../context/CartContext.jsx";

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    cartTotal,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQty,
    clearCart,
  } = useCart();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop click to close on desktop / tablet */}
      <div
        className="flex-1 hidden sm:block"
        onClick={() => setCartOpen(false)}
        aria-label="Close backdrop"
      />

      {/* Slide-in Drawer Container */}
      <div className="w-full sm:max-w-md bg-ivory flex flex-col h-[100dvh] shadow-2xl border-l border-charcoal/20 relative z-10 select-none overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-charcoal/15 px-4 py-3.5 sm:px-5 sm:py-4 bg-sand/50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl" aria-hidden="true">
              🛍️
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal truncate">
              Your Craft Cart
            </h2>
            <span className="rounded-full bg-vermilion px-2 py-0.5 text-xs font-bold text-ivory shrink-0">
              {cartCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] uppercase tracking-wider font-semibold text-charcoal/50 hover:text-vermilion px-1.5 py-1 rounded transition-colors"
                title="Clear all cart items"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="flex items-center justify-center h-8 w-8 rounded-full text-charcoal/70 hover:text-vermilion hover:bg-sand/70 active:scale-95 transition-all"
              aria-label="Close cart"
            >
              <svg
                className="h-5 w-5 fill-none stroke-current stroke-2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 space-y-3 overscroll-contain">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4 pb-28 sm:pb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sand text-3xl shadow-2xs">
                🏺
              </div>
              <h3 className="mt-4 font-serif text-lg sm:text-xl font-bold text-charcoal">
                Your cart is empty
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-charcoal/70 max-w-xs leading-relaxed">
                Discover authentic Madhubani paintings, Mithila pottery, bamboo crafts, and handmade jewelry from Terai artisans.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  window.location.hash = "#products";
                }}
                className="mt-6 inline-flex items-center gap-2 bg-vermilion px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal active:scale-95 transition-all rounded shadow-sm"
              >
                <span>Browse Creations</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3 sm:gap-4 border border-charcoal/15 bg-sand/30 hover:bg-sand/50 p-2.5 sm:p-3 rounded-lg shadow-2xs transition-colors items-center"
                >
                  {/* Thumbnail */}
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80"
                    }
                    alt={item.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md border border-charcoal/15 shrink-0 bg-sand"
                    loading="lazy"
                  />

                  {/* Info & Quantity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-teal uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h4
                          onClick={() => {
                            setCartOpen(false);
                            window.location.hash = `#product?id=${item._id}`;
                          }}
                          className="font-serif text-xs sm:text-sm font-semibold text-charcoal truncate mt-0.5 hover:text-vermilion cursor-pointer"
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-charcoal/70 truncate">
                          By {item.artisanName}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="p-1 text-charcoal/40 hover:text-vermilion active:scale-90 transition-all rounded shrink-0"
                        title="Remove item"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg
                          className="h-4 w-4 fill-none stroke-current stroke-2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Price and Counter Row */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-charcoal/10">
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-vermilion">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-charcoal/50 block">
                            Rs. {item.price.toLocaleString()} each
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper with Touch-Friendly Targets */}
                      <div className="flex items-center border border-charcoal/20 rounded bg-ivory shadow-2xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item._id, item.quantity - 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center font-bold text-sm text-charcoal hover:bg-sand active:bg-sand/70 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="h-7 min-w-[28px] sm:h-8 sm:min-w-[32px] flex items-center justify-center text-xs font-bold text-charcoal px-1 border-x border-charcoal/15">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item._id, item.quantity + 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center font-bold text-sm text-charcoal hover:bg-sand active:bg-sand/70 transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Drawer Footer with Mobile Bottom Nav Safe Area Padding */}
        {cart.length > 0 && (
          <div className="border-t border-charcoal/15 p-4 sm:p-5 bg-sand/60 space-y-3 pb-24 sm:pb-5 shrink-0 shadow-lg">
            {/* Delivery Reassurance */}
            <div className="flex items-center justify-between text-xs text-charcoal/80">
              <span className="flex items-center gap-1">
                <span>🚚</span>
                <span>Delivery Support</span>
              </span>
              <span className="text-teal font-bold bg-teal/10 px-2 py-0.5 rounded text-[11px]">
                Cash On Delivery (COD)
              </span>
            </div>

            {/* Subtotal Row */}
            <div className="flex items-center justify-between border-t border-charcoal/10 pt-2">
              <span className="font-serif text-sm sm:text-base font-bold text-charcoal">
                Subtotal
              </span>
              <span className="font-serif text-lg sm:text-xl font-bold text-vermilion">
                Rs. {cartTotal.toLocaleString()}
              </span>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                window.location.hash = "#checkout";
              }}
              className="w-full bg-vermilion py-3 sm:py-3.5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal active:scale-[0.99] transition-all rounded shadow-md cursor-pointer"
            >
              Proceed to Checkout (COD)
            </button>

            <p className="text-[10px] sm:text-[11px] text-center text-charcoal/60 leading-tight">
              100% authentic Terai craftsmanship. Payment collected at doorstep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
