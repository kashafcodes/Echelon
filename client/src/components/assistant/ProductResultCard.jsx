// ══════════════════════════════════════════
//  LokArt AI Assistant — Product Result Card
//  Mini product card shown inside chat
// ══════════════════════════════════════════

export default function ProductResultCard({ product, onAddToCart, onAddToWishlist, index }) {
  const img = product.images?.[0] || product.image || "";
  const name = product.name || "Unnamed Product";
  const price = product.price ?? 0;
  const artisan = product.artisanName || product.vendor?.businessName || "Local Artisan";
  const inStock = !product.quantity || product.quantity > 0;

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-sand p-2.5 hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-sand flex-shrink-0">
        {img ? (
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal leading-tight truncate">{name}</p>
        <p className="text-xs text-charcoal/50 truncate">{artisan}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-vermilion font-serif">Rs. {price.toLocaleString()}</span>
          {!inStock && <span className="text-xs text-charcoal/40">Out of stock</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {inStock && (
          <button
            onClick={() => onAddToCart?.(product)}
            className="text-xs bg-vermilion text-white rounded-lg px-2.5 py-1 hover:bg-vermilion/85 transition-colors font-medium"
            title="Add to cart"
          >
            + Cart
          </button>
        )}
        <button
          onClick={() => onAddToWishlist?.(product)}
          className="text-xs bg-sand text-charcoal rounded-lg px-2.5 py-1 hover:bg-terai/20 transition-colors"
          title="Save to wishlist"
        >
          ♡ Save
        </button>
      </div>
    </div>
  );
}
