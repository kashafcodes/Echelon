import { useState, useEffect, useCallback } from "react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { artisanApi } from "../services/api.js";

function getVendorIdFromHash() {
  const hash = window.location.hash; // e.g. "#artisan?id=123" or "#/artisan/123" or "#artisan/123"
  if (hash.includes("?id=")) {
    const qIdx = hash.indexOf("?");
    const params = new URLSearchParams(hash.slice(qIdx + 1));
    return params.get("id");
  }
  const match = hash.match(/#\/?artisan\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return null;
}

export default function ArtisanProfilePage() {
  const [vendorId, setVendorId] = useState(getVendorIdFromHash);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Watch for hash changes (e.g. clicking different artisan)
  useEffect(() => {
    const handleHashChange = () => {
      const id = getVendorIdFromHash();
      if (id !== vendorId) {
        setVendorId(id);
        setPage(1);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [vendorId]);

  // Load Profile
  useEffect(() => {
    if (!vendorId) {
      setLoadingProfile(false);
      setProfileError("Artisan ID not specified.");
      return;
    }

    setLoadingProfile(true);
    setProfileError("");

    artisanApi
      .getProfile(vendorId)
      .then((res) => {
        if (res?.ok && res.artisan) {
          setProfile(res.artisan);
        } else {
          setProfileError(res?.message || "Artisan studio could not be found.");
        }
      })
      .catch((err) => {
        console.error("Failed to load artisan profile:", err);
        setProfileError("Failed to load artisan profile.");
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [vendorId]);

  // Load Products
  const loadProducts = useCallback(() => {
    if (!vendorId) return;
    setLoadingProducts(true);

    const params = {
      page,
      limit: 12,
      sort,
    };
    if (categoryFilter !== "All") {
      params.category = categoryFilter;
    }

    artisanApi
      .getProducts(vendorId, params)
      .then((res) => {
        if (res?.ok) {
          setProducts(res.products || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load artisan products:", err);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, [vendorId, page, sort, categoryFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const locationStr = profile?.businessAddress
    ? [profile.businessAddress.city, profile.businessAddress.district, profile.businessAddress.province]
        .filter(Boolean)
        .join(", ")
    : "Terai, Nepal";

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal font-sans">
      <SiteHeader />

      <main className="flex-1 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="bg-sand/40 border-b border-charcoal/10 py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 text-xs text-charcoal/70">
            <a href="#home" className="hover:text-vermilion transition-colors">
              Home
            </a>
            <span>/</span>
            <a href="#products" className="hover:text-vermilion transition-colors">
              Marketplace
            </a>
            <span>/</span>
            <span className="text-charcoal font-semibold">
              {profile?.businessName || profile?.artisanName || "Artisan Studio"}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loadingProfile && (
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-vermilion border-r-transparent" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-charcoal/60">
              Loading Artisan Studio...
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loadingProfile && profileError && (
          <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <span className="text-5xl">🎨</span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-charcoal">
              Artisan Not Found
            </h2>
            <p className="mt-2 text-sm text-charcoal/70">{profileError}</p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href="#products"
                className="bg-vermilion text-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded hover:bg-charcoal transition-colors"
              >
                Browse All Crafts
              </a>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!loadingProfile && profile && (
          <>
            {/* Header Hero Banner */}
            <div className="relative bg-gradient-to-r from-teal/15 via-sand/60 to-terai/15 border-b border-charcoal/10">
              <div className="max-w-6xl mx-auto px-4 pt-10 pb-12 sm:pb-16">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  {/* Avatar / Portrait */}
                  <div className="relative shrink-0">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.artisanName}
                        className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover border-4 border-ivory shadow-lg"
                      />
                    ) : (
                      <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-teal text-ivory font-serif text-4xl sm:text-5xl font-bold border-4 border-ivory shadow-lg">
                        {profile.artisanName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {profile.isVerified && (
                      <span
                        className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-teal text-ivory border-2 border-ivory shadow-xs"
                        title="Verified LokArt Artisan"
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <span className="rounded bg-teal/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-teal">
                        {profile.category || "Traditional Crafts"}
                      </span>
                      {profile.isVerified ? (
                        <span className="rounded bg-teal/15 px-2.5 py-0.5 text-xs font-semibold text-teal flex items-center gap-1">
                          <span>✓</span> Verified Artisan Studio
                        </span>
                      ) : (
                        <span className="rounded bg-sand px-2.5 py-0.5 text-xs font-semibold text-charcoal/70">
                          Community Partner
                        </span>
                      )}
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
                      {profile.businessName}
                    </h1>

                    <p className="text-sm font-semibold text-vermilion">
                      Artisan: {profile.artisanName}
                    </p>

                    <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-charcoal/70">
                      <span>📍</span>
                      <span>{locationStr}</span>
                    </p>

                    {profile.description && (
                      <p className="text-xs sm:text-sm text-charcoal/85 leading-relaxed max-w-2xl whitespace-pre-line">
                        {profile.description}
                      </p>
                    )}

                    {/* Stats Ribbon */}
                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-charcoal/75">
                      <div>
                        <span className="font-bold text-charcoal text-base">
                          {profile.productCount ?? products.length}
                        </span>{" "}
                        <span className="text-charcoal/60">Crafts Listed</span>
                      </div>
                      <div className="h-4 w-px bg-charcoal/20" />
                      <div>
                        <span className="text-charcoal/60">Authentic Terai Heritage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="max-w-6xl mx-auto px-4 mt-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal/15 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-charcoal">
                    Creations by {profile.businessName}
                  </h2>
                  <p className="text-xs text-charcoal/70 mt-0.5">
                    Handmade directly by the artisan using indigenous materials and methods.
                  </p>
                </div>

                {/* Filter and Sort controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="rounded border border-charcoal/20 bg-ivory px-3 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="oldest">Sort: Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loadingProducts ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-vermilion border-r-transparent" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                    Loading crafts...
                  </p>
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((prod) => (
                      <ProductCard key={prod._id} product={prod} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded border border-charcoal/20 bg-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-semibold text-charcoal/80">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        className="rounded border border-charcoal/20 bg-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 text-center rounded-lg border border-dashed border-charcoal/20 bg-sand/20 mt-6 p-8">
                  <span className="text-4xl">🏺</span>
                  <h3 className="mt-3 font-serif text-lg font-bold text-charcoal">
                    No Crafts Currently Available
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/70 max-w-md mx-auto">
                    {profile.businessName} does not have any active craft listings right now. Please
                    check back soon as new pieces are handcrafted!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
