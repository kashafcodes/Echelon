import { useCart } from "../context/CartContext.jsx";

export default function CartDrawer() {
  const { cart, cartCount, cartTotal, cartOpen, setCartOpen, removeFromCart, updateCartQty, clearCart } =
    useCart();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={() => setCartOpen(false)} />

      {/* Slide-in Drawer */}
      <div className="w-full max-w-md bg-ivory flex flex-col h-full shadow-2xl border-l border-charcoal/20">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-charcoal/15 p-5 bg-sand/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <h2 className="font-serif text-xl font-bold text-charcoal">Your Craft Cart</h2>
            <span className="rounded-full bg-vermilion px-2 py-0.5 text-xs font-bold text-ivory">
              {cartCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="text-charcoal/60 hover:text-vermilion p-1 text-xl font-bold transition-colors"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sand text-3xl">
                🏺
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-charcoal">
                Your cart is empty
              </h3>
              <p className="mt-1 text-xs text-charcoal/70 max-w-xs mx-auto">
                Discover authentic paintings, bamboo crafts, and handmade jewelry from Terai artisans.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  window.location.hash = "#products";
                }}
                className="mt-6 inline-block bg-vermilion px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
              >
                Browse Creations
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 border border-charcoal/15 bg-sand/30 p-3 rounded shadow-2xs relative"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80"}
                    alt={item.name}
                    className="h-20 w-20 object-cover rounded border border-charcoal/15 shrink-0 bg-sand"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-teal uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-charcoal truncate mt-0.5">
                      {item.name}
                    </h4>
                    <p className="text-xs text-charcoal/70">By {item.artisanName}</p>
                    <p className="font-bold text-sm text-vermilion mt-1">
                      Rs. {item.price.toLocaleString()}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-charcoal/20 bg-ivory">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item._id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-bold text-charcoal hover:bg-sand"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item._id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-bold text-charcoal hover:bg-sand"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="text-[11px] text-charcoal/50 hover:text-vermilion transition-colors ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="border-t border-charcoal/15 p-5 bg-sand/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-charcoal/80">
              <span>Delivery Support</span>
              <span className="text-teal font-semibold">Cash On Delivery (COD)</span>
            </div>
            <div className="flex items-center justify-between border-t border-charcoal/10 pt-2">
              <span className="font-serif text-base font-bold text-charcoal">Subtotal</span>
              <span className="font-serif text-xl font-bold text-vermilion">
                Rs. {cartTotal.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                window.location.hash = "#checkout";
              }}
              className="w-full bg-vermilion py-3 text-center text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors shadow-sm"
            >
              Proceed to Checkout (COD)
            </button>
            <p className="text-[11px] text-center text-charcoal/60 leading-tight">
              100% authentic Terai craftsmanship. Payment collected at your doorstep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
