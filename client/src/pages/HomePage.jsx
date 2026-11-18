import { useEffect, useState, useCallback } from "react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import HeroSection from "../components/HeroSection.jsx";
import CategorySection from "../components/CategorySection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { productApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function HomePage() {
  const { openRegister } = useAuth();

  // Featured products
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Random recommended products
  const [randomProducts, setRandomProducts] = useState([]);
  const [loadingRandom, setLoadingRandom] = useState(true);

  // Main catalog / browse state
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // 1. Fetch featured products
  const loadFeatured = useCallback(async () => {
    try {
      setLoadingFeatured(true);
      const res = await productApi.getFeatured();
      if (res?.ok) {
        setFeaturedProducts(res.products || []);
      }
    } catch (err) {
      console.warn("Failed to load featured products:", err);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  // 2. Fetch random product suggestions
  const loadRandom = useCallback(async () => {
    try {
      setLoadingRandom(true);
      const res = await productApi.getRandom(6);
      if (res?.ok) {
        setRandomProducts(res.products || []);
      }
    } catch (err) {
      console.warn("Failed to load random products:", err);
    } finally {
      setLoadingRandom(false);
    }
  }, []);

  // 3. Fetch main filtered products
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const params = {
        page,
        limit: 8,
        sort: sortBy,
      };

      if (selectedCategory && selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (onlyInStock) {
        params.availability = "in-stock";
      }
      if (priceRange.min) {
        params.minPrice = priceRange.min;
      }
      if (priceRange.max) {
        params.maxPrice = priceRange.max;
      }

      const res = await productApi.getProducts(params);
      if (res?.ok) {
        setProducts(res.products || []);
        setTotalCount(res.total || 0);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [page, selectedCategory, searchQuery, sortBy, onlyInStock, priceRange]);

  useEffect(() => {
    loadFeatured();
    loadRandom();
  }, [loadFeatured, loadRandom]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle URL hash query params if any (e.g. #products?category=... or ?search=...)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes("?")) {
        const queryStr = hash.split("?")[1];
        const params = new URLSearchParams(queryStr);
        if (params.get("category")) {
          setSelectedCategory(params.get("category"));
        }
        if (params.get("search")) {
          setSearchQuery(params.get("search"));
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("newest");
    setOnlyInStock(false);
    setPriceRange({ min: "", max: "" });
    setPage(1);
  };

  return (
    <div id="top" className="min-h-screen bg-ivory flex flex-col justify-between selection:bg-terai selection:text-charcoal">
      {/* Site Header */}
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection onExploreClick={() => setSelectedCategory("All")} />

        {/* Categories Section */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setPage(1);
            // Smooth scroll to catalog
            const el = document.getElementById("marketplace-catalog");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Featured Products Showcase */}
        {featuredProducts.length > 0 && (
          <section className="py-12 bg-sand/30 border-b border-charcoal/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-vermilion">
                    Masterpiece Selection
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1">
                    Featured Creations
                  </h2>
                </div>
                <span className="text-xs text-charcoal/60 uppercase tracking-wider hidden sm:inline">
                  Verified Heritage Quality
                </span>
              </div>

              {loadingFeatured ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-sand animate-pulse rounded border border-charcoal/10" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {featuredProducts.slice(0, 4).map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onSelect={(prod) => {
                        window.location.hash = `#product?id=${prod._id}`;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Main E-commerce Marketplace Catalog with Search & Filters */}
        <section id="marketplace-catalog" className="py-12 bg-ivory">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header & Results Bar */}
            <div className="border-b border-charcoal/15 pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal">
                    Terai Marketplace
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1">
                    {selectedCategory === "All" ? "All Traditional Creations" : selectedCategory}
                  </h2>
                  <p className="text-xs text-charcoal/70 mt-1">
                    Showing {products.length} of {totalCount} verified items
                  </p>
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search within section */}
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search within crafts..."
                      className="w-full rounded border border-charcoal/20 bg-sand/40 px-3 py-1.5 text-xs text-charcoal placeholder:text-charcoal/50 focus:border-teal focus:bg-ivory focus:outline-hidden"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1.5 text-xs text-charcoal/50 hover:text-charcoal"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Sort By Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="rounded border border-charcoal/20 bg-sand/40 px-3 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:bg-ivory focus:outline-hidden"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="popular">Popular / Featured</option>
                  </select>

                  {/* Availability toggle */}
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-charcoal cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => {
                        setOnlyInStock(e.target.checked);
                        setPage(1);
                      }}
                      className="accent-teal h-3.5 w-3.5"
                    />
                    <span>In Stock Only</span>
                  </label>

                  {/* Clear filters button if active */}
                  {(selectedCategory !== "All" || searchQuery || onlyInStock || sortBy !== "newest") && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs text-vermilion hover:underline font-semibold"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="mt-8">
              {loadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-sand/50 animate-pulse rounded border border-charcoal/10" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center rounded border border-dashed border-charcoal/20 bg-sand/20">
                  <span className="text-4xl">🏺</span>
                  <h3 className="font-serif text-xl font-bold text-charcoal mt-3">
                    No creations found
                  </h3>
                  <p className="text-xs text-charcoal/70 max-w-md mx-auto mt-1">
                    We couldn't find any crafts matching your search or filters. Try choosing a different category or clearing your search term.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-5 inline-block bg-teal px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onSelect={(prod) => {
                        window.location.hash = `#product?id=${prod._id}`;
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 border-t border-charcoal/10 pt-6">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded border border-charcoal/20 bg-sand/40 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-sand disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-charcoal/70 px-2 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded border border-charcoal/20 bg-sand/40 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-sand disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recommended / Random Discovery Showcase (No Duplicates) */}
        {randomProducts.length > 0 && (
          <section className="py-12 bg-sand/50 border-t border-b border-charcoal/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal">
                    Random Discoveries
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1">
                    Handmade in the Villages
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={loadRandom}
                  className="flex items-center gap-1.5 rounded border border-charcoal/20 bg-ivory px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors shadow-2xs"
                >
                  <span>🔄</span> Shuffle Picks
                </button>
              </div>

              {loadingRandom ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-sand animate-pulse rounded border border-charcoal/10" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {randomProducts.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onSelect={(prod) => {
                        window.location.hash = `#product?id=${prod._id}`;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Authentic Artisan Mission Banner */}
        <section id="artisans" className="py-16 bg-charcoal text-ivory">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-terai">
              Empowering Terai Craft Communities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Direct Support for Indigenous Creators & Women Cooperatives
            </h2>
            <p className="text-sm sm:text-base text-ivory/80 leading-relaxed max-w-3xl mx-auto">
              Every Mithila canvas, Sikki basket, and terracotta lamp in our catalog is created by registered, verified artisans in Parsa, Bara, and Madhesh. By keeping pricing transparent and providing direct cash payments upon delivery, LokArt preserves endangered heritage while securing dignified local livelihoods.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <a
                href="#products"
                className="bg-vermilion hover:bg-ivory hover:text-charcoal text-ivory px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Shop All Authenticated Crafts
              </a>
              <button
                type="button"
                onClick={() => openRegister("vendor")}
                className="border border-ivory/40 hover:border-ivory text-ivory px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Apply as an Artisan Partner
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
