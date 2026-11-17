import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard.jsx";
import CartDrawer from "../components/CartDrawer.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { productApi } from "../services/api.js";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories on mount
  useEffect(() => {
    productApi.getCategories().then((res) => {
      if (res?.categories) {
        setCategories(res.categories);
      }
    });
  }, []);

  // Sync hash query params on mount or hashchange (e.g. #products?category=... or ?search=...)
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash;
      if (hash.includes("?")) {
        const queryStr = hash.split("?")[1];
        const params = new URLSearchParams(queryStr);
        if (params.get("category")) setCategory(params.get("category"));
        if (params.get("search")) setSearch(params.get("search"));
      }
    };
    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, []);

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort,
      };

      if (category && category !== "All") params.category = category;
      if (search.trim()) params.search = search.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (availability === "in-stock") params.availability = "in-stock";

      const res = await productApi.getProducts(params);
      if (res?.ok) {
        setProducts(res.products || []);
        setTotal(res.total || 0);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error("ProductsPage fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [category, search, minPrice, maxPrice, availability, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <div id="top" className="min-h-screen bg-ivory flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Breadcrumb / Title */}
        <div className="border-b border-charcoal/15 pb-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal">
              LokArt Craft Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Explore Traditional Creations
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70">
              Browse authentic handmade pieces crafted by verified artisans across Parsa, Bara, and the Terai.
            </p>
          </div>

          {/* Search bar row */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, description, material, or artisan..."
                className="w-full rounded border border-charcoal/25 bg-sand/40 px-3.5 py-2 text-xs sm:text-sm text-charcoal placeholder:text-charcoal/50 focus:border-teal focus:bg-ivory focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-xs text-charcoal/40 hover:text-charcoal"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs text-charcoal/70 font-medium">
                {total} {total === 1 ? "craft found" : "crafts found"}
              </span>

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded border border-charcoal/20 bg-sand/40 px-3 py-2 text-xs font-semibold text-charcoal focus:border-teal focus:outline-hidden"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Popular / Featured</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Filters Sidebar + Products Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/30 p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-charcoal">Filters</h3>
                {(category !== "All" || search || minPrice || maxPrice || availability !== "all") && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-vermilion hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/80 block mb-2.5">
                  Category
                </label>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("All");
                      setPage(1);
                    }}
                    className={`flex items-center justify-between text-xs py-1.5 px-2 rounded text-left transition-colors ${
                      category === "All"
                        ? "bg-teal text-ivory font-bold"
                        : "text-charcoal hover:bg-sand"
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id || c.name}
                      type="button"
                      onClick={() => {
                        setCategory(c.name);
                        setPage(1);
                      }}
                      className={`flex items-center justify-between text-xs py-1.5 px-2 rounded text-left transition-colors ${
                        category === c.name
                          ? "bg-teal text-ivory font-bold"
                          : "text-charcoal hover:bg-sand"
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {c.productCount > 0 && (
                        <span className="text-[10px] opacity-75 ml-1">({c.productCount})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-t border-charcoal/10 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/80 block mb-2">
                  Price Range (NPR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Rs."
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded border border-charcoal/20 bg-ivory px-2 py-1.5 text-xs text-charcoal placeholder:text-charcoal/40"
                  />
                  <input
                    type="number"
                    placeholder="Max Rs."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded border border-charcoal/20 bg-ivory px-2 py-1.5 text-xs text-charcoal placeholder:text-charcoal/40"
                  />
                </div>
              </div>

              {/* Availability Filter */}
              <div className="border-t border-charcoal/10 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/80 block mb-2">
                  Availability
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === "all"}
                      onChange={() => setAvailability("all")}
                      className="accent-teal"
                    />
                    <span>All Items</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === "in-stock"}
                      onChange={() => setAvailability("in-stock")}
                      className="accent-teal"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-sand/50 animate-pulse rounded border border-charcoal/10" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center rounded border border-dashed border-charcoal/20 bg-sand/20">
                <span className="text-4xl">🌾</span>
                <h3 className="font-serif text-xl font-bold text-charcoal mt-3">
                  No crafts match your filter criteria
                </h3>
                <p className="text-xs text-charcoal/70 max-w-sm mx-auto mt-1">
                  Try adjusting your price range, searching a different term, or clearing category filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-5 inline-block bg-teal px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3 border-t border-charcoal/10 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-charcoal/20 bg-sand/40 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-xs text-charcoal font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded border border-charcoal/20 bg-sand/40 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-sand disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      <SiteFooter />
    </div>
  );
}
