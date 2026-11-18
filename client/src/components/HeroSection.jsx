import { useAuth } from "../context/AuthContext.jsx";

export default function HeroSection({ onExploreClick }) {
  const { openRegister, user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-sand/60 border-b border-charcoal/10 py-8 sm:py-12 md:py-20">
      {/* Decorative Traditional Terai Background Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-terai/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-teal/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Headline & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-teal">
              <span>🪔</span> Authentic Crafts of Parsa & the Terai
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal leading-[1.2]">
              Every Creation Holds a Story.{" "}
              <span className="text-vermilion italic font-normal block sm:inline mt-1 sm:mt-0">
                Every Maker Has a Name.
              </span>
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm md:text-base text-charcoal/80 leading-relaxed mx-auto lg:mx-0">
              LokArt connects you directly to master Mithila painters, Sikki grass weavers, terracotta potters, and traditional creators across southern Nepal. No middlemen, full authenticity, delivered with Cash on Delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-2">
              <a
                href="#products"
                onClick={onExploreClick}
                className="bg-vermilion hover:bg-charcoal text-ivory px-5 py-3 sm:px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors shadow-sm text-center rounded sm:rounded-none"
              >
                Explore Marketplace
              </a>

              {user?.role !== "vendor" && (
                <button
                  type="button"
                  onClick={() => openRegister("vendor")}
                  className="border border-charcoal hover:bg-charcoal hover:text-ivory text-charcoal px-5 py-3 sm:px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors bg-ivory text-center rounded sm:rounded-none cursor-pointer"
                >
                  Become a Seller / Artisan
                </button>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t border-charcoal/15 max-w-lg mx-auto lg:mx-0 text-center sm:text-left">
              <div>
                <span className="font-serif text-base sm:text-xl font-bold text-teal block">100%</span>
                <span className="text-[10px] sm:text-[11px] text-charcoal/70 uppercase tracking-wider font-semibold">
                  Handcrafted
                </span>
              </div>
              <div>
                <span className="font-serif text-base sm:text-xl font-bold text-teal block">Direct</span>
                <span className="text-[10px] sm:text-[11px] text-charcoal/70 uppercase tracking-wider font-semibold">
                  Artisan Price
                </span>
              </div>
              <div>
                <span className="font-serif text-base sm:text-xl font-bold text-teal block">COD</span>
                <span className="text-[10px] sm:text-[11px] text-charcoal/70 uppercase tracking-wider font-semibold">
                  Nepal Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right: Curated Visual Showcase */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md rounded border border-charcoal/20 bg-ivory p-3 sm:p-4 shadow-xl">
              <div className="relative aspect-4/3 rounded overflow-hidden bg-sand">
                <img
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80"
                  alt="Mithila Traditional Painting"
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 rounded bg-vermilion px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-ivory shadow-xs">
                  Featured Masterpiece
                </span>
              </div>

              {/* Showcase Mini Info */}
              <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-teal uppercase tracking-wider block">
                    Mithila Art Heritage
                  </span>
                  <h3 className="font-serif text-sm sm:text-lg font-bold text-charcoal truncate">
                    Kohbar Wedding Canvas
                  </h3>
                  <p className="text-[11px] sm:text-xs text-charcoal/70 truncate">By Shanti Devi • Janakpurdham</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] uppercase text-charcoal/50 block">Price</span>
                  <span className="font-serif text-base sm:text-xl font-bold text-vermilion">Rs. 3,800</span>
                </div>
              </div>
            </div>

            {/* Overlapping Badge */}
            <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-3 sm:-left-4 rounded bg-charcoal p-3 text-ivory shadow-lg border border-charcoal/30 max-w-xs sm:max-w-[200px] mx-auto sm:mx-0 text-center sm:text-left">
              <span className="text-[11px] sm:text-xs font-serif font-semibold block">Artisan Spotlight</span>
              <p className="text-[10px] text-ivory/80 leading-tight mt-0.5">
                Every sale directly empowers indigenous families in the Terai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
