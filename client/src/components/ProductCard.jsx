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
    <div className="group relative flex flex-col justify-between rounded border border-charcoal/15 bg-sand/30 hover:bg-sand/70 transition-all duration-200 hover:shadow-md hover:border-charcoal/30 overflow-hidden">
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
        <span className="absolute top-2.5 left-2.5 rounded bg-ivory/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal shadow-2xs border border-charcoal/10">
          {product.category}
        </span>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xs transition-colors shadow-2xs ${
            isFavorited
              ? "bg-vermilion text-ivory"
              : "bg-ivory/90 text-charcoal hover:text-vermilion"
          }`}
          aria-label="Save to Wishlist"
          title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Stock Badge Overlay if low or out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="rounded bg-ivory px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
        {!isOutOfStock && product.quantity <= 5 && (
          <span className="absolute bottom-2 left-2 rounded bg-terai/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ivory">
            Only {product.quantity} left
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          {/* Artisan & Location */}
          <div className="flex items-center justify-between text-[11px] text-charcoal/70 mb-1">
            <span className="truncate max-w-[140px] font-medium" title={artisanName}>
              By {artisanName}
            </span>
            <span className="truncate max-w-[100px] text-charcoal/50 text-right">
              {origin}
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={handleSelect}
            className="font-serif text-base font-semibold text-charcoal hover:text-vermilion transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-charcoal/50 block">
              Price (NPR)
            </span>
            <span className="font-serif text-lg font-bold text-vermilion">
              Rs. {product.price?.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelect}
              className="border border-charcoal/20 bg-ivory hover:bg-sand px-2.5 py-1.5 text-xs font-medium text-charcoal transition-colors"
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
              className="bg-vermilion hover:bg-charcoal disabled:opacity-40 text-ivory px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
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
