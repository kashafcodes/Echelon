import { useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { productApi, vendorPublicApi } from "../services/api.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import ProductCard from "../components/ProductCard.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProductIdFromHash() {
  const hash = window.location.hash; // e.g. "#product?id=abc123"
  if (!hash.startsWith("#product")) return null;
  const qIdx = hash.indexOf("?");
  if (qIdx === -1) return null;
  const params = new URLSearchParams(hash.slice(qIdx + 1));
  return params.get("id") || null;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 bg-sand rounded w-48 mb-8" />

      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
        {/* Gallery */}
        <div>
          <div className="h-[480px] bg-sand rounded mb-3" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 bg-sand rounded" />
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-5 bg-sand rounded w-24" />
          <div className="h-9 bg-sand rounded w-3/4" />
          <div className="h-7 bg-sand rounded w-32" />
          <div className="h-4 bg-sand rounded w-40" />
          <div className="h-20 bg-sand rounded w-full" />
          <div className="h-10 bg-sand rounded w-full mt-4" />
          <div className="flex gap-3 mt-2">
            <div className="h-11 bg-sand rounded flex-1" />
            <div className="h-11 bg-sand rounded flex-1" />
          </div>
        </div>
      </div>

      {/* Story section */}
      <div className="border-t border-charcoal/10 py-10 space-y-4">
        <div className="h-7 bg-sand rounded w-56 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-sand rounded w-full" />
        ))}
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-ivory/80 hover:text-ivory text-3xl font-light leading-none"
        aria-label="Close lightbox"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
      />
    </div>
  );
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────

function StockBadge({ status }) {
  const map = {
    "In Stock":    "bg-teal/10 text-teal border-teal/20",
    "Low Stock":   "bg-terai/10 text-terai border-terai/20",
    "Out of Stock":"bg-vermilion/10 text-vermilion border-vermilion/20",
  };
  const cls = map[status] || "bg-sand text-charcoal border-charcoal/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

// ─── Spec Table ───────────────────────────────────────────────────────────────

function SpecRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <tr className="border-b border-charcoal/8 last:border-0">
      <td className="py-2.5 pr-6 text-sm font-semibold text-charcoal/60 whitespace-nowrap w-40">{label}</td>
      <td className="py-2.5 text-sm text-charcoal">{value}</td>
    </tr>
  );
}

// ─── Expandable Text ──────────────────────────────────────────────────────────

function ExpandableText({ text, maxChars = 200, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const needsExpand = text.length > maxChars;
  const displayed = !expanded && needsExpand ? text.slice(0, maxChars) + "…" : text;
  return (
    <span className={className}>
      {displayed}
      {needsExpand && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="ml-1 text-teal text-sm font-medium hover:underline focus:outline-none"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </span>
  );
}

// ─── Quantity Selector ────────────────────────────────────────────────────────

function QuantitySelector({ qty, setQty, max, disabled }) {
  return (
    <div className="flex items-center gap-0 border border-charcoal/20 rounded w-fit">
      <button
        type="button"
        disabled={disabled || qty <= 1}
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="px-3 py-2 text-lg font-bold text-charcoal hover:bg-sand disabled:opacity-40 transition-colors rounded-l select-none"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="px-5 py-2 text-sm font-semibold text-charcoal border-x border-charcoal/20 min-w-[3rem] text-center select-none">
        {qty}
      </span>
      <button
        type="button"
        disabled={disabled || qty >= max}
        onClick={() => setQty((q) => Math.min(max, q + 1))}
        className="px-3 py-2 text-lg font-bold text-charcoal hover:bg-sand disabled:opacity-40 transition-colors rounded-r select-none"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

// ─── Success Toast Banner ─────────────────────────────────────────────────────

function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 bg-teal text-ivory text-sm font-medium px-4 py-2.5 rounded shadow-md mt-3 animate-fade-in">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const { user, openLogin } = useAuth();

  // Product state
  const [productId, setProductId] = useState(() => getProductIdFromHash());
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Gallery
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Related products
  const [vendorProducts, setVendorProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Quantity & cart
  const [qty, setQty] = useState(1);
  const [cartBanner, setCartBanner] = useState("");
  const bannerTimer = useRef(null);

  // Artisan description expand
  const [artisanExpanded, setArtisanExpanded] = useState(false);

  // ── Watch hash changes (re-fetch when product id changes) ──────────────────
  useEffect(() => {
    function handleHash() {
      const id = getProductIdFromHash();
      if (id) {
        setProductId(id);
        setActiveImg(0);
        setQty(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // ── Scroll to top on mount ─────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  // ── Fetch product ──────────────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);
    setVendorProducts([]);
    setSimilarProducts([]);
    try {
      const res = await productApi.getProductById(productId);
      if (!res?.product) { setNotFound(true); return; }
      const p = res.product;
      setProduct(p);
      setActiveImg(0);
      setQty(1);

      // Fetch vendor products
      const vendorId = p.vendor?.id || p.vendorId;
      if (vendorId) {
        vendorPublicApi
          .getProductsByVendor(vendorId, { excludeId: p._id, limit: 6 })
          .then((r) => setVendorProducts(r?.products || []))
          .catch(() => {});
      }

      // Fetch similar category products
      productApi
        .getProducts({ category: p.category, limit: 10, page: 1 })
        .then((r) => {
          const all = r?.products || [];
          const vendorIdSet = new Set(
            (p.vendor?.id ? [p.vendor.id] : []).concat(vendorId ? [vendorId] : [])
          );
          const filtered = all
            .filter(
              (x) =>
                x._id !== p._id &&
                !vendorIdSet.has(x.vendor?.id) &&
                !vendorIdSet.has(x.vendorId)
            )
            .slice(0, 4);
          setSimilarProducts(filtered);
        })
        .catch(() => {});
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  // ── Cart helpers ───────────────────────────────────────────────────────────
  const showCartBanner = (msg) => {
    setCartBanner(msg);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setCartBanner(""), 2500);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    showCartBanner(`Added ${qty > 1 ? `${qty}× ` : ""}${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      openLogin();
      // After login, user can manually navigate; we don't auto-navigate to avoid confusion
      return;
    }
    addToCart(product, qty);
    window.location.hash = "#checkout";
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const images =
    product?.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"];

  const isOutOfStock =
    product?.stockStatus === "Out of Stock" || product?.quantity === 0;

  const artisanName =
    product?.artisanName ||
    product?.vendor?.businessName ||
    "Local Artisan";

  const vendorId = product?.vendor?.id || product?.vendorId;

  const weightDisplay = product?.weight
    ? product.weight >= 1000
      ? `${(product.weight / 1000).toFixed(2)} kg`
      : `${product.weight} g`
    : null;

  // Story section: has any story content?
  const hasStory =
    product?.description ||
    (product?.materials && product.materials.length > 0) ||
    product?.craftingMethod ||
    product?.dimensions ||
    product?.weight ||
    product?.origin ||
    product?.customizationAvailable ||
    (product?.tags && product.tags.length > 0);

  // ── Render guards ──────────────────────────────────────────────────────────
  if (!productId) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-24 px-4">
            <p className="font-serif text-2xl text-charcoal/60 mb-4">No product selected.</p>
            <a href="#products" className="text-teal hover:underline text-sm">← Browse all products</a>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">

          {/* ── Loading ── */}
          {loading && <LoadingSkeleton />}

          {/* ── 404 ── */}
          {!loading && notFound && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="text-7xl mb-6">🏺</span>
              <h2 className="font-serif text-3xl text-charcoal mb-3">Product Not Found</h2>
              <p className="text-charcoal/60 mb-8 max-w-sm">
                This craft may have sold out or been removed by the artisan.
              </p>
              <a
                href="#products"
                className="bg-vermilion text-ivory px-6 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-charcoal transition-colors rounded"
              >
                Browse All Products
              </a>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="text-5xl mb-6">⚠️</span>
              <h2 className="font-serif text-2xl text-charcoal mb-2">Something went wrong</h2>
              <p className="text-charcoal/60 mb-8 text-sm">{error}</p>
              <button
                onClick={fetchProduct}
                className="bg-teal text-ivory px-6 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-charcoal transition-colors rounded"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Main Content ── */}
          {!loading && !notFound && !error && product && (
            <>
              {/* ───────────── 1. Breadcrumb ───────────── */}
              <nav className="flex items-center gap-2 text-sm text-charcoal/60 mb-7">
                <a href="#products" className="hover:text-teal transition-colors flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                  </svg>
                  Back to Products
                </a>
                <span className="text-charcoal/30">/</span>
                <a
                  href={`#products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-teal transition-colors"
                >
                  {product.category}
                </a>
                <span className="text-charcoal/30">/</span>
                <span className="text-charcoal truncate max-w-[200px]">{product.name}</span>
              </nav>

              {/* ───────────── 2. Product Hero ───────────── */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">

                {/* LEFT — Image Gallery */}
                <div>
                  {/* Main Image */}
                  <div
                    className="relative bg-sand rounded overflow-hidden cursor-zoom-in mb-3 flex items-center justify-center"
                    style={{ height: "480px" }}
                    onClick={() => setLightboxOpen(true)}
                    title="Click to zoom"
                  >
                    <img
                      src={images[activeImg]}
                      alt={product.name}
                      className="w-full h-full object-contain transition-all duration-300"
                    />
                    <span className="absolute bottom-3 right-3 bg-charcoal/50 text-ivory text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                      🔍 Zoom
                    </span>
                  </div>

                  {/* Thumbnails (only if more than 1 image) */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all duration-150 ${
                            activeImg === i
                              ? "border-teal shadow-sm"
                              : "border-charcoal/15 hover:border-charcoal/40"
                          }`}
                          aria-label={`Image ${i + 1}`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} thumbnail ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT — Product Info */}
                <div className="flex flex-col gap-3">
                  {/* Category Badge */}
                  <span className="bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded self-start border border-teal/15">
                    {product.category}
                  </span>

                  {/* Product Name */}
                  <h1 className="font-serif text-3xl text-charcoal leading-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <p className="text-2xl font-bold text-vermilion">
                    NPR {product.price?.toLocaleString()}
                  </p>

                  {/* Origin */}
                  {product.origin && (
                    <p className="flex items-center gap-1.5 text-sm text-charcoal/70">
                      <span>📍</span>
                      <span>{product.origin}</span>
                    </p>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center gap-3">
                    <StockBadge status={product.stockStatus || "In Stock"} />
                    {!isOutOfStock && product.quantity <= 5 && product.quantity > 0 && (
                      <span className="text-xs text-terai font-semibold">
                        Only {product.quantity} left!
                      </span>
                    )}
                  </div>

                  {/* Artisan */}
                  <div className="flex items-center gap-2.5 py-2 border-y border-charcoal/8 my-1">
                    {product.artisanAvatar ? (
                      <img
                        src={product.artisanAvatar}
                        alt={artisanName}
                        className="w-9 h-9 rounded-full object-cover border border-charcoal/15"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal flex items-center justify-center text-ivory text-sm font-bold shrink-0">
                        {getInitials(artisanName)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-charcoal/50 uppercase tracking-wider">Handcrafted by</p>
                      <p className="text-sm font-semibold text-charcoal">{artisanName}</p>
                    </div>
                  </div>

                  {/* Short Description */}
                  {product.description && (
                    <p className="text-sm text-charcoal/80 leading-relaxed">
                      <ExpandableText text={product.description} maxChars={200} />
                    </p>
                  )}

                  {/* Customization badge */}
                  {product.customizationAvailable && (
                    <div className="flex items-center gap-2 bg-teal/8 border border-teal/20 rounded px-3 py-2">
                      <span className="text-teal font-bold">✦</span>
                      <span className="text-teal text-sm font-semibold">Custom Orders Welcome</span>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="mt-1">
                    <p className="text-xs uppercase tracking-wider text-charcoal/50 font-semibold mb-2">Quantity</p>
                    <QuantitySelector
                      qty={qty}
                      setQty={setQty}
                      max={product.quantity || 1}
                      disabled={isOutOfStock}
                    />
                  </div>

                  {/* Cart Banner */}
                  <SuccessBanner message={cartBanner} />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                      className="flex-1 bg-teal text-ivory py-3 px-6 text-sm font-semibold uppercase tracking-wider rounded hover:bg-teal/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className="flex-1 bg-vermilion text-ivory py-3 px-6 text-sm font-semibold uppercase tracking-wider rounded hover:bg-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Order Now (Buy Now)
                    </button>
                  </div>

                  {!user && !isOutOfStock && (
                    <p className="text-xs text-charcoal/50 text-center mt-1">
                      Sign in required for checkout.{" "}
                      <button onClick={openLogin} className="text-teal hover:underline font-medium">
                        Log in
                      </button>
                    </p>
                  )}
                </div>
              </section>

              {/* ───────────── 3. The Story Behind the Craft ───────────── */}
              <section className="border-t border-charcoal/10 py-10 mb-2">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-serif text-2xl text-charcoal whitespace-nowrap">
                    The Story Behind the Craft
                  </h2>
                  <div className="flex-1 h-px bg-charcoal/15" />
                </div>

                {hasStory ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-8">
                    {/* Full Description */}
                    {product.description && (
                      <div className="md:col-span-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                          About This Piece
                        </h3>
                        <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Materials */}
                    {product.materials && product.materials.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                          Materials Used
                        </h3>
                        <ul className="space-y-1.5">
                          {product.materials.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-charcoal/80">
                              <span className="text-terai mt-0.5 text-xs font-bold">✦</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Crafting Method */}
                    {product.craftingMethod && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                          Crafting Method
                        </h3>
                        <p className="text-sm text-charcoal/80 leading-relaxed">
                          {product.craftingMethod}
                        </p>
                      </div>
                    )}

                    {/* Dimensions */}
                    {product.dimensions && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                          Dimensions
                        </h3>
                        <p className="text-sm text-charcoal/80">{product.dimensions}</p>
                      </div>
                    )}

                    {/* Weight */}
                    {product.weight && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                          Weight
                        </h3>
                        <p className="text-sm text-charcoal/80">{weightDisplay}</p>
                      </div>
                    )}

                    {/* Origin card */}
                    {product.origin && (
                      <div className="bg-sand/60 border border-charcoal/10 rounded-lg px-5 py-4 flex items-start gap-3">
                        <span className="text-2xl mt-0.5">📍</span>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-1">
                            Origin
                          </h3>
                          <p className="text-sm font-semibold text-charcoal">{product.origin}</p>
                          <p className="text-xs text-charcoal/60 mt-0.5">
                            Handmade in Nepal with local traditions
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customization Details */}
                    {product.customizationAvailable && (
                      <div className="bg-teal/5 border border-teal/15 rounded-lg px-5 py-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-teal/70 mb-2">
                          ✦ Custom Orders Available
                        </h3>
                        <p className="text-sm text-charcoal/80 leading-relaxed">
                          This artisan accepts custom orders. Contact them through their shop page to discuss personalization, sizing, or unique requirements.
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-3">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, i) => (
                            <a
                              key={i}
                              href={`#products?search=${encodeURIComponent(tag)}`}
                              className="inline-flex items-center px-3 py-1 rounded-full bg-sand border border-charcoal/15 text-xs text-charcoal/70 hover:bg-teal/10 hover:text-teal hover:border-teal/20 transition-colors"
                            >
                              #{tag}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-charcoal/10 rounded-lg px-8 py-10 text-center bg-sand/30">
                    <span className="text-4xl block mb-4">🏺</span>
                    <p className="font-serif text-lg text-charcoal/70 max-w-md mx-auto leading-relaxed italic">
                      "This artisan has not yet shared the story behind this craft. We believe every handmade item carries a unique tale."
                    </p>
                  </div>
                )}
              </section>

              {/* ───────────── 4. Product Specifications ───────────── */}
              <section className="border-t border-charcoal/10 py-10 mb-2">
                <div className="flex items-center gap-4 mb-7">
                  <h2 className="font-serif text-2xl text-charcoal whitespace-nowrap">
                    Product Specifications
                  </h2>
                  <div className="flex-1 h-px bg-charcoal/15" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full max-w-2xl">
                    <tbody>
                      <SpecRow label="Category" value={product.category} />
                      <SpecRow label="Origin" value={product.origin} />
                      <SpecRow
                        label="Materials"
                        value={
                          product.materials && product.materials.length > 0
                            ? product.materials.join(", ")
                            : null
                        }
                      />
                      <SpecRow label="Crafting Method" value={product.craftingMethod} />
                      <SpecRow label="Dimensions" value={product.dimensions} />
                      <SpecRow label="Weight" value={weightDisplay} />
                      <SpecRow
                        label="Custom Orders"
                        value={
                          product.customizationAvailable === true
                            ? "Available"
                            : product.customizationAvailable === false
                            ? "Not Available"
                            : null
                        }
                      />
                      <SpecRow label="Stock Status" value={product.stockStatus} />
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ───────────── 5. Meet the Artisan ───────────── */}
              {(artisanName || product.vendor) && (
                <section className="border-t border-charcoal/10 py-10 mb-2">
                  <div className="flex items-center gap-4 mb-7">
                    <h2 className="font-serif text-2xl text-charcoal whitespace-nowrap">
                      Meet the Artisan
                    </h2>
                    <div className="flex-1 h-px bg-charcoal/15" />
                  </div>

                  <div className="bg-sand/50 border border-charcoal/10 rounded-xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {product.artisanAvatar ? (
                          <img
                            src={product.artisanAvatar}
                            alt={artisanName}
                            className="w-20 h-20 rounded-full object-cover border-2 border-charcoal/15 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-teal flex items-center justify-center text-ivory text-2xl font-bold shadow-sm">
                            {getInitials(artisanName)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl text-charcoal leading-tight mb-0.5">
                          {artisanName}
                        </h3>

                        {product.vendor?.businessName && (
                          <p className="text-sm text-charcoal/60 font-medium mb-2">
                            {product.vendor.businessName}
                          </p>
                        )}

                        {/* Meta chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.vendor?.district && (
                            <span className="inline-flex items-center gap-1 text-xs bg-ivory border border-charcoal/15 px-2.5 py-1 rounded-full text-charcoal/70">
                              📍 {product.vendor.district}
                              {product.vendor.province ? `, ${product.vendor.province}` : ""}
                            </span>
                          )}
                          {product.vendor?.category && (
                            <span className="inline-flex items-center gap-1 text-xs bg-teal/10 border border-teal/15 px-2.5 py-1 rounded-full text-teal font-medium">
                              {product.vendor.category}
                            </span>
                          )}
                          {product.vendor?.createdAt && (
                            <span className="inline-flex items-center gap-1 text-xs bg-ivory border border-charcoal/15 px-2.5 py-1 rounded-full text-charcoal/70">
                              Est. {new Date(product.vendor.createdAt).getFullYear()}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {product.vendor?.description && (
                          <div className="text-sm text-charcoal/75 leading-relaxed mb-5">
                            {artisanExpanded || product.vendor.description.length <= 300 ? (
                              <span>{product.vendor.description}</span>
                            ) : (
                              <span>
                                {product.vendor.description.slice(0, 300)}…{" "}
                                <button
                                  onClick={() => setArtisanExpanded(true)}
                                  className="text-teal font-medium hover:underline focus:outline-none"
                                >
                                  Read more
                                </button>
                              </span>
                            )}
                            {artisanExpanded && product.vendor.description.length > 300 && (
                              <button
                                onClick={() => setArtisanExpanded(false)}
                                className="ml-1 text-teal font-medium hover:underline focus:outline-none text-sm"
                              >
                                Show less
                              </button>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        {vendorId && (
                          <a
                            href={`#products?vendor=${vendorId}`}
                            className="inline-flex items-center gap-2 bg-charcoal text-ivory text-sm font-semibold uppercase tracking-wider px-5 py-2.5 rounded hover:bg-teal transition-colors"
                          >
                            Explore More by {artisanName}
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ───────────── 6. More From This Artisan ───────────── */}
              {vendorProducts.length > 0 && (
                <section className="border-t border-charcoal/10 py-10 mb-2">
                  <div className="flex items-center justify-between gap-4 mb-7">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <h2 className="font-serif text-2xl text-charcoal whitespace-nowrap">
                        More From This Artisan
                      </h2>
                      <div className="flex-1 h-px bg-charcoal/15" />
                    </div>
                    {vendorId && (
                      <a
                        href={`#products?vendor=${vendorId}`}
                        className="shrink-0 text-teal text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        View All
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {vendorProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => { window.location.hash = `#product?id=${p._id}`; }}
                        className="cursor-pointer"
                      >
                        <ProductCard
                          product={p}
                          onSelect={(prod) => { window.location.hash = `#product?id=${prod._id}`; }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ───────────── 7. Similar Products ───────────── */}
              {similarProducts.length > 0 && (
                <section className="border-t border-charcoal/10 py-10 mb-2">
                  <div className="flex items-center justify-between gap-4 mb-7">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <h2 className="font-serif text-2xl text-charcoal whitespace-nowrap">
                        You May Also Like
                      </h2>
                      <div className="flex-1 h-px bg-charcoal/15" />
                    </div>
                    <a
                      href={`#products?category=${encodeURIComponent(product.category)}`}
                      className="shrink-0 text-teal text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      Browse {product.category}
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {similarProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => { window.location.hash = `#product?id=${p._id}`; }}
                        className="cursor-pointer"
                      >
                        <ProductCard
                          product={p}
                          onSelect={(prod) => { window.location.hash = `#product?id=${prod._id}`; }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          src={images[activeImg]}
          alt={product?.name || "Product image"}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
