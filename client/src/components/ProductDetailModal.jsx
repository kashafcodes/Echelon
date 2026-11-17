import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"];

  const isOutOfStock = product.quantity === 0 || product.stockStatus === "Out of Stock";
  const isFavorited = isWishlisted(product._id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-ivory rounded shadow-2xl border border-charcoal/20 overflow-hidden z-10 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-charcoal hover:bg-vermilion hover:text-ivory border border-charcoal/20 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left: Gallery */}
          <div className="p-6 bg-sand/30 flex flex-col justify-between border-b md:border-b-0 md:border-r border-charcoal/15">
            <div>
              <div className="aspect-square w-full rounded overflow-hidden border border-charcoal/15 bg-sand relative group">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xs border transition-colors ${
                    isFavorited
                      ? "bg-vermilion text-ivory border-vermilion"
                      : "bg-ivory/80 text-charcoal hover:text-vermilion border-charcoal/20"
                  }`}
                  aria-label="Wishlist"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-16 w-16 shrink-0 rounded overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-vermilion shadow-sm"
                          : "border-charcoal/20 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Maker Verification Badge */}
            <div className="mt-6 rounded border border-teal/30 bg-teal/5 p-3 flex items-center gap-3">
              <span className="text-xl text-teal">✓</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal block">
                  Authentic Terai Craft
                </span>
                <p className="text-xs text-charcoal/80">
                  Crafted by {product.artisanName || product.vendor?.businessName || "Registered Artisan"} in {product.origin || "Parsa, Nepal"}.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-sand px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
                  {product.category}
                </span>
                <span
                  className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isOutOfStock
                      ? "bg-vermilion/15 text-vermilion"
                      : product.quantity <= 5
                        ? "bg-terai/20 text-terai"
                        : "bg-teal/15 text-teal"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : product.quantity <= 5 ? `Low Stock (${product.quantity} left)` : "In Stock"}
                </span>
              </div>

              {/* Title & Origin */}
              <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-charcoal leading-tight">
                {product.name}
              </h2>
              <p className="mt-1 text-xs text-charcoal/70">
                Origin: <strong className="text-charcoal">{product.origin || "Parsa, Terai, Nepal"}</strong>
              </p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-vermilion">
                  Rs. {product.price?.toLocaleString()}
                </span>
                <span className="text-xs text-charcoal/60 uppercase">NPR • Inclusive of all taxes</span>
              </div>

              {/* Description */}
              <div className="mt-4 border-t border-charcoal/10 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
                  Artisan Notes
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-charcoal/85 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specs & Crafting Details */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-sand/30 p-3 rounded border border-charcoal/10">
                {product.craftingMethod && (
                  <div>
                    <span className="text-[10px] text-charcoal/60 uppercase block">Crafting Method</span>
                    <span className="font-medium text-charcoal">{product.craftingMethod}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-[10px] text-charcoal/60 uppercase block">Dimensions</span>
                    <span className="font-medium text-charcoal">{product.dimensions}</span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="text-[10px] text-charcoal/60 uppercase block">Weight</span>
                    <span className="font-medium text-charcoal">{product.weight}g</span>
                  </div>
                )}
                {product.customizationAvailable !== undefined && (
                  <div>
                    <span className="text-[10px] text-charcoal/60 uppercase block">Custom Order</span>
                    <span className="font-medium text-charcoal">
                      {product.customizationAvailable ? "Available on request" : "Standard piece"}
                    </span>
                  </div>
                )}
              </div>

              {/* Materials Pills */}
              {product.materials && product.materials.length > 0 && (
                <div className="mt-4">
                  <span className="text-[10px] text-charcoal/60 uppercase block font-bold mb-1">
                    Materials Used
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.materials.map((m, i) => (
                      <span
                        key={i}
                        className="rounded border border-charcoal/15 bg-ivory px-2 py-0.5 text-[11px] text-charcoal"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-charcoal/15 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-charcoal/30 bg-sand/30">
                  <button
                    type="button"
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-sm font-bold text-charcoal hover:bg-sand disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-bold text-charcoal min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock || quantity >= (product.quantity || 99)}
                    onClick={() => setQuantity((q) => Math.min(product.quantity || 99, q + 1))}
                    className="px-3 py-2 text-sm font-bold text-charcoal hover:bg-sand disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors ${
                    isOutOfStock
                      ? "bg-charcoal/30 cursor-not-allowed"
                      : added
                        ? "bg-teal"
                        : "bg-vermilion hover:bg-charcoal"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart" : "Add to Craft Cart"}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-charcoal/70 pt-1">
                <span>🚚 Cash on Delivery available across Nepal</span>
                <span>🔒 Direct Artisan Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
