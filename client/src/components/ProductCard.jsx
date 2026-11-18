import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product, onSelect }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80"];

  const primaryImage = images[0];
  const isOutOfStock = product.quantity === 0 || product.stockStatus === "Out of Stock";
  const isFavorited = isWishlisted(product._id);

  const artisanName = product.artisanName || product.vendor?.businessName || product.artisan || "Local Artisan";
  const origin = product.origin || product.vendor?.district || "Parsa, Terai";

  const handleSelect = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      window.location.hash = `#product?id=${product._id}`;
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded border border-charcoal/15 bg-sand/30 hover:bg-sand/70 transition-all duration-200 hover:shadow-md hover:border-charcoal/30 overflow-hidden w-full">
      {/* Top Image Container */}
      <div 
        onClick={handleSelect}
        className="relative aspect-square w-full overflow-hidden bg-sand cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Pill */}
        <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 rounded bg-ivory/95 backdrop-blur-xs px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-teal shadow-2xs border border-charcoal/10 max-w-[70%] truncate">
          {product.category}
        </span>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full backdrop-blur-xs transition-colors shadow-2xs cursor-pointer ${
            isFavorited
              ? "bg-vermilion text-ivory"
              : "bg-ivory/90 text-charcoal hover:text-vermilion"
          }`}
          aria-label="Save to Wishlist"
          title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Stock Badge Overlay if low or out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-2xs flex items-center justify-center p-2 text-center">
            <span className="rounded bg-ivory px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
        {!isOutOfStock && product.quantity <= 5 && (
          <span className="absolute bottom-2 left-2 rounded bg-terai/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-ivory">
            Only {product.quantity} left
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4 justify-between gap-2 sm:gap-3">
        <div>
          {/* Artisan & Location */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-charcoal/70 mb-1 gap-1">
            <span className="truncate max-w-[55%] sm:max-w-[140px] font-medium" title={artisanName}>
              By {artisanName}
            </span>
            <span className="truncate max-w-[45%] sm:max-w-[100px] text-charcoal/50 text-right">
              {origin}
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={handleSelect}
            className="font-serif text-xs sm:text-base font-semibold text-charcoal hover:text-vermilion transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row - Responsive Stacking on Mobile */}
        <div className="pt-2 sm:pt-3 border-t border-charcoal/10 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          {/* Price */}
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-charcoal/50 block">
              Price (NPR)
            </span>
            <span className="font-serif text-sm sm:text-lg font-bold text-vermilion truncate block">
              Rs. {product.price?.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSelect}
              className="flex-1 sm:flex-none border border-charcoal/20 bg-ivory hover:bg-sand px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-charcoal transition-colors rounded text-center cursor-pointer whitespace-nowrap"
              title="View product details"
            >
              Details
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="flex-1 sm:flex-none bg-vermilion hover:bg-charcoal disabled:opacity-40 text-ivory px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors rounded text-center cursor-pointer shadow-2xs whitespace-nowrap"
              title={isOutOfStock ? "Out of stock" : "Add to cart"}
            >
              + Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
