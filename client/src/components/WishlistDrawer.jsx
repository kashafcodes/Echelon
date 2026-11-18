import { useCart } from "../context/CartContext.jsx";

export default function WishlistDrawer({ open, onClose }) {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-sm flex-col bg-ivory shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Your Saved Crafts"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 text-vermilion fill-current" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="font-serif text-lg font-bold text-charcoal">
              Saved Crafts
              {wishlist.length > 0 && (
                <span className="ml-2 rounded-full bg-vermilion/15 px-2 py-0.5 text-xs font-bold text-vermilion">
                  {wishlist.length}
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal/50 hover:bg-sand hover:text-charcoal transition-colors"
            aria-label="Close wishlist"
          >
            <svg className="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 pt-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand/60">
                <svg className="h-10 w-10 stroke-current stroke-1.5 fill-none text-charcoal/25" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-base font-bold text-charcoal">No saved crafts yet</p>
                <p className="mt-1 text-xs text-charcoal/55 max-w-[220px] mx-auto">
                  Tap the ♡ on any product to save it here for later.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-full bg-teal px-5 py-2 text-xs font-bold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
              >
                Explore Crafts
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {wishlist.map((item) => (
                <li
                  key={item._id}
                  className="flex gap-3 rounded-xl border border-charcoal/8 bg-white p-3 shadow-xs hover:shadow-sm transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-7 w-7 text-charcoal/20 stroke-current stroke-1 fill-none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="text-xs font-bold text-charcoal line-clamp-2 leading-snug">{item.name}</p>
                      {item.artisanName && (
                        <p className="mt-0.5 text-[10px] text-charcoal/50 uppercase tracking-wider font-semibold truncate">
                          by {item.artisanName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif text-sm font-bold text-teal">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Add to Cart */}
                        <button
                          type="button"
                          onClick={() => addToCart(item, 1)}
                          className="flex items-center gap-1 rounded-full bg-teal px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
                        >
                          <svg className="h-3 w-3 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Add
                        </button>
                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-charcoal/15 text-vermilion/60 hover:border-vermilion hover:text-vermilion hover:bg-vermilion/8 transition-colors"
                          title="Remove from saved"
                          aria-label="Remove from saved crafts"
                        >
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only when items exist */}
        {wishlist.length > 0 && (
          <div className="border-t border-charcoal/10 px-4 py-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                wishlist.forEach((item) => addToCart(item, 1));
                onClose();
              }}
              className="w-full rounded-full bg-vermilion py-3 text-xs font-bold uppercase tracking-widest text-ivory hover:bg-charcoal transition-colors shadow-sm"
            >
              Add All to Cart ({wishlist.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
