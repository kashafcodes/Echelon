import { useEffect, useState, useRef } from "react";
import { productApi } from "../services/api.js";

export default function CategorySection({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    productApi
      .getCategories()
      .then((data) => {
        if (mounted && data?.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch categories:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    } else {
      window.location.hash = `#products?category=${encodeURIComponent(catName)}`;
    }
  };

  return (
    <section id="categories" className="py-10 bg-ivory border-b border-charcoal/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left/Right Scroll Arrows */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal">
              Explore Traditional Disciplines
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1">
              Shop by Heritage Category
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded border border-charcoal/20 bg-sand/40 hover:bg-charcoal hover:text-ivory text-charcoal transition-colors"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded border border-charcoal/20 bg-sand/40 hover:bg-charcoal hover:text-ivory text-charcoal transition-colors"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        {/* Categories Scrollable Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* "All Creations" Category Pill */}
          <button
            type="button"
            onClick={() => handleCategoryClick("All")}
            className={`flex shrink-0 flex-col items-center justify-center rounded border p-4 text-center transition-all w-32 sm:w-36 ${
              !selectedCategory || selectedCategory === "All"
                ? "border-teal bg-teal text-ivory shadow-sm"
                : "border-charcoal/15 bg-sand/40 hover:bg-sand text-charcoal hover:border-charcoal/30"
            }`}
          >
            <span className="text-3xl mb-2">✨</span>
            <span className="text-xs font-serif font-bold line-clamp-1">All Creations</span>
            <span className={`text-[10px] mt-1 uppercase tracking-wider ${
              !selectedCategory || selectedCategory === "All" ? "text-ivory/80" : "text-charcoal/60"
            }`}>
              Full Catalog
            </span>
          </button>

          {loading ? (
            // Skeleton loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 w-32 sm:w-36 shrink-0 animate-pulse rounded border border-charcoal/10 bg-sand/50"
              />
            ))
          ) : (
            categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat._id || cat.slug || cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`group flex shrink-0 flex-col items-center justify-center rounded border p-4 text-center transition-all w-32 sm:w-36 ${
                    isSelected
                      ? "border-vermilion bg-vermilion text-ivory shadow-sm"
                      : "border-charcoal/15 bg-sand/40 hover:bg-sand text-charcoal hover:border-charcoal/30"
                  }`}
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {cat.icon || "🎨"}
                  </span>
                  <span className="text-xs font-serif font-bold line-clamp-1">
                    {cat.name}
                  </span>
                  <span
                    className={`text-[10px] mt-1 rounded px-1.5 py-0.2 uppercase tracking-wider ${
                      isSelected
                        ? "bg-ivory/20 text-ivory"
                        : "bg-charcoal/10 text-charcoal/70"
                    }`}
                  >
                    {cat.productCount !== undefined ? `${cat.productCount} items` : "Explore"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
