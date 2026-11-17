import { useState, useMemo } from "react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import CraftVisual from "../components/CraftVisual.jsx";
import CraftStoryModal from "../components/CraftStoryModal.jsx";
import {
  CRAFT_CATEGORIES,
  VERIFIED_PRODUCTS,
  FEATURED_ARTISANS,
  HOW_IT_WORKS_STEPS,
  IMPACT_METRICS,
  FAQS,
} from "../data/craftsData.js";

export default function HomePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtisanFilter, setSelectedArtisanFilter] = useState(null);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Filter products based on category, search text, and artisan filter
  const filteredProducts = useMemo(() => {
    return VERIFIED_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesArtisan =
        !selectedArtisanFilter || product.artisanId === selectedArtisanFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.artisanName.toLowerCase().includes(query) ||
        product.village.toLowerCase().includes(query) ||
        product.categoryLabel.toLowerCase().includes(query) ||
        product.materials.toLowerCase().includes(query);

      return matchesCategory && matchesArtisan && matchesSearch;
    });
  }, [selectedCategory, selectedArtisanFilter, searchQuery]);

  function handleFilterByArtisan(artisanId) {
    setSelectedArtisanFilter(artisanId);
    setSelectedCategory("all");
    const craftsSection = document.getElementById("crafts");
    if (craftsSection) {
      craftsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleClearFilters() {
    setSelectedCategory("all");
    setSelectedArtisanFilter(null);
    setSearchQuery("");
  }

  function toggleFaq(index) {
    setExpandedFaq(expandedFaq === index ? null : index);
  }

  return (
    <div id="top" className="min-h-screen bg-ivory text-charcoal">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-40 focus:bg-ivory focus:px-4 focus:py-2 focus:border focus:border-charcoal shadow-lg font-medium"
      >
        Skip to content
      </a>

      {/* Header */}
      <SiteHeader currentView="home" onNavigate={onNavigate} />

      <main id="content">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-charcoal/10 bg-ivory">
          {/* Subtle decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#292522_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.9fr] md:px-8 md:py-24 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                <span>📍 Parsa · The Terai · Nepal</span>
              </div>

              <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-charcoal">
                Every creation has a story. <br className="hidden sm:inline" />
                <span className="text-vermilion">Every creator</span> deserves a stage.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal/80">
                Discover authentic handmade treasures from local Terai artisans. We empower rural makers—particularly women—with digital visibility, fair direct earnings, and zero middlemen.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#crafts"
                  className="bg-vermilion px-7 py-3.5 text-center text-sm font-bold text-ivory hover:bg-charcoal transition-colors shadow-md"
                >
                  Explore Creations
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("register")}
                  className="border-2 border-charcoal px-6 py-3 text-center text-sm font-bold text-charcoal hover:bg-charcoal hover:text-ivory transition-colors cursor-pointer"
                >
                  Become a Creator
                </button>
                <a
                  href="#artisans"
                  className="px-5 py-3.5 text-center text-sm font-semibold text-charcoal/70 hover:text-vermilion transition-colors"
                >
                  Meet the Makers →
                </a>
              </div>

              {/* Trust badges row */}
              <div className="mt-10 pt-6 border-t border-charcoal/10 grid grid-cols-3 gap-4 text-xs font-medium text-charcoal/80">
                <div>
                  <p className="font-bold text-vermilion text-sm">100%</p>
                  <p>Handcrafted by artisans</p>
                </div>
                <div>
                  <p className="font-bold text-teal text-sm">Consent First</p>
                  <p>Artisan approved pricing</p>
                </div>
                <div>
                  <p className="font-bold text-terai text-sm">Cash on Delivery</p>
                  <p>Delivered across Nepal</p>
                </div>
              </div>
            </div>

            {/* Aside Cultural Highlight Card */}
            <aside className="relative flex flex-col justify-between overflow-hidden bg-teal p-8 text-ivory shadow-xl md:min-h-96">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-terai/20 pointer-events-none"></div>

              <div>
                <span className="inline-block rounded bg-terai/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-terai">
                  Featured Artisan of Parsa
                </span>
                <p className="mt-4 font-serif text-3xl font-light leading-snug">
                  “No Craft Forgotten. <br />
                  <span className="font-normal text-terai">No Creator Unseen.</span>”
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ivory/80">
                  Sunita Devi, 24-year master of Kohbar Mithila painting from Bindabasini, Parsa:
                  <em> “When our folk art enters someone's home, our heritage continues to live.”</em>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-ivory/20 flex items-center justify-between">
                <div>
                  <p className="font-serif text-lg font-bold">Sunita Devi</p>
                  <p className="text-xs text-ivory/70">Master Mithila Painter</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFilterByArtisan("artisan-1")}
                  className="rounded bg-ivory px-3.5 py-1.5 text-xs font-bold text-teal hover:bg-terai hover:text-charcoal transition-colors cursor-pointer"
                >
                  View Her Work
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* TRUST PILLARS BAR */}
        <section className="bg-charcoal text-ivory">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 text-xs font-semibold tracking-[0.18em] uppercase sm:grid-cols-2 md:grid-cols-4 md:px-8">
            <div className="flex items-center gap-3">
              <span className="text-terai text-lg">✦</span>
              <span>100% Handcrafted</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-terai text-lg">✦</span>
              <span>Consent Before Listing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-terai text-lg">✦</span>
              <span>LokArt Verified Authenticity</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-terai text-lg">✦</span>
              <span>Cash on Delivery Nepal</span>
            </div>
          </div>
        </section>

        {/* MISSION INTRODUCTION */}
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2 md:px-8 items-center">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-vermilion">
              Why LokArt Exists
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl leading-tight text-charcoal">
              A stage for the people who make the work.
            </h2>
          </div>
          <div className="space-y-4 text-base sm:text-lg leading-relaxed text-charcoal/80">
            <p>
              LokArt is a digital marketplace for local artisans, particularly women artisans in
              Parsa and the Terai. It helps creators show their work, manage creations, receive
              orders, and reach customers beyond the immediate local market.
            </p>
            <p>
              This is not a catalogue of anonymous factory goods. The person, the place, the materials, and the heritage stay beside each creation.
            </p>
          </div>
        </section>

        {/* INTERACTIVE CRAFTS SHOWCASE & MARKETPLACE GALLERY */}
        <section id="crafts" className="border-y border-charcoal/10 bg-sand py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-vermilion uppercase">
                  Explore Heritage Crafts
                </p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-charcoal">
                  Verified Creations from the Terai
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal/75">
                  Browse authentic pieces verified by LokArt. Click any creation to read the artisan's personal story, see raw indigenous materials, and request delivery with Cash on Delivery.
                </p>
              </div>

              {/* Live Search Input */}
              <div className="w-full md:w-72">
                <label htmlFor="search-crafts" className="sr-only">
                  Search crafts or artisans
                </label>
                <div className="relative">
                  <input
                    id="search-crafts"
                    type="text"
                    placeholder="Search crafts, artisans, village..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-charcoal/20 bg-ivory py-2.5 pl-9 pr-3 text-sm focus:border-vermilion focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-charcoal/50 text-sm">🔍</span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-charcoal/50 hover:text-charcoal text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-8 flex flex-wrap gap-2 items-center">
              {CRAFT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedArtisanFilter(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id && !selectedArtisanFilter
                      ? "bg-charcoal text-ivory shadow-sm"
                      : "bg-ivory text-charcoal/80 border border-charcoal/15 hover:border-charcoal/40"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.id !== "all" && (
                    <span className="ml-1.5 opacity-60">({cat.count})</span>
                  )}
                </button>
              ))}

              {selectedArtisanFilter && (
                <div className="flex items-center gap-2 rounded bg-teal/10 px-3 py-1.5 text-xs font-semibold text-teal border border-teal/20">
                  <span>Filtered by artisan</span>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="hover:text-vermilion font-bold text-sm"
                    title="Clear filter"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid */}
            <div className="mt-10">
              {filteredProducts.length === 0 ? (
                <div className="rounded bg-ivory p-12 text-center border border-charcoal/15 space-y-3">
                  <p className="font-serif text-2xl text-charcoal">No creations match your filter</p>
                  <p className="text-sm text-charcoal/70">
                    Try clearing the search query or selecting "All Crafts".
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-2 bg-vermilion px-5 py-2 text-xs font-bold text-ivory hover:bg-charcoal"
                  >
                    Show All Crafts
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between overflow-hidden border border-charcoal/15 bg-ivory transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div>
                        {/* Craft Visual Illustration */}
                        <div className="relative overflow-hidden">
                          <CraftVisual
                            type={product.iconType}
                            title={product.title}
                            className="h-48 w-full border-b border-charcoal/10"
                          />
                          <span className="absolute top-3 right-3 rounded bg-ivory/90 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-charcoal backdrop-blur-xs border border-charcoal/10">
                            {product.categoryLabel}
                          </span>
                          <span className="absolute bottom-3 left-3 rounded bg-charcoal/85 px-2 py-0.5 text-[10px] font-medium text-ivory">
                            ✓ Verified
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-5">
                          <div className="flex items-baseline justify-between text-xs text-charcoal/70">
                            <span className="font-medium text-teal">
                              {product.artisanName}
                            </span>
                            <span>{product.village}</span>
                          </div>

                          <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-charcoal group-hover:text-vermilion transition-colors line-clamp-2">
                            {product.title}
                          </h3>

                          <p className="mt-2 text-xs leading-relaxed text-charcoal/70 line-clamp-2">
                            {product.shortDesc}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="border-t border-charcoal/10 bg-sand/40 p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-charcoal/60 block">
                            Direct Artisan Price
                          </span>
                          <span className="font-serif text-lg font-bold text-vermilion">
                            रू {product.price.toLocaleString("en-NP")}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveProductModal(product)}
                          className="bg-charcoal px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-vermilion transition-colors cursor-pointer"
                        >
                          Story & Details
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Note about unverified works */}
            <div className="mt-12 rounded border border-charcoal/10 bg-ivory p-5 text-center text-xs text-charcoal/70">
              <span className="font-semibold text-charcoal">LokArt Integrity Pledge:</span> Products appear in this public catalog only after direct artisan consent and LokArt quality verification. Unverified pieces stay private.
            </div>
          </div>
        </section>

        {/* MEET THE CREATORS SECTION */}
        <section id="artisans" className="py-20 bg-ivory">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.2em] text-teal uppercase">
                Faces of the Terai
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-charcoal">
                Meet the Master Creators
              </h2>
              <p className="mt-3 text-base text-charcoal/75 leading-relaxed">
                Generations of patience, indigenous wisdom, and pride. Each artisan on LokArt retains 100% ownership of their narrative and creations.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_ARTISANS.map((artisan) => (
                <div
                  key={artisan.id}
                  className="flex flex-col justify-between border border-charcoal/15 bg-sand/30 p-6 transition-all hover:bg-sand/60"
                >
                  <div>
                    {/* Header with avatar token */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-ivory font-serif text-xl font-bold shadow-inner">
                        {artisan.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-charcoal">
                          {artisan.name}
                        </h3>
                        <p className="text-xs text-teal font-medium">
                          {artisan.village}, {artisan.district}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="inline-block rounded bg-terai/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-charcoal">
                        {artisan.craft}
                      </span>
                      <p className="mt-1 text-xs text-charcoal/60">
                        {artisan.experience} experience
                      </p>
                    </div>

                    <blockquote className="mt-4 border-l-2 border-vermilion pl-3 text-xs italic text-charcoal/80 leading-relaxed">
                      "{artisan.quote}"
                    </blockquote>

                    <p className="mt-3 text-xs text-charcoal/70 leading-normal">
                      {artisan.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-charcoal/10">
                    <button
                      type="button"
                      onClick={() => handleFilterByArtisan(artisan.id)}
                      className="w-full text-center border border-charcoal/30 py-2 text-xs font-bold text-charcoal hover:bg-charcoal hover:text-ivory transition-colors cursor-pointer"
                    >
                      View Creations ({artisan.creationsCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW LOKART WORKS (THE DIGNITY PIPELINE) */}
        <section id="path" className="border-y border-charcoal/10 bg-sand/70 py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.2em] text-teal uppercase">
                Transparent Process
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-charcoal">
                Four steps from workshop to customer.
              </h2>
              <p className="mt-3 text-base text-charcoal/75 leading-relaxed">
                Designed specifically for rural makers with low digital barriers and complete artisan control.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col justify-between border-t-4 border-teal bg-ivory p-6 shadow-sm"
                >
                  <div>
                    <span className="font-serif text-3xl font-bold text-terai">
                      {step.step}
                    </span>
                    <h3 className="mt-3 font-serif text-lg font-bold text-charcoal">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-charcoal/80">
                      {step.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-charcoal/10 text-[11px] text-teal font-medium">
                    ✓ {step.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION FOR CREATORS & HELPERS */}
        <section id="creators" className="py-20 bg-ivory">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="rounded-none border border-charcoal/20 bg-sand p-8 sm:p-12">
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-vermilion">
                    Join the Collective
                  </span>
                  <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-charcoal">
                    Are you a creator or a community helper?
                  </h2>
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-charcoal/80">
                    Whether you weave bamboo, paint Mithila rituals, or crochet woolen goods, LokArt gives you a digital stage without requiring digital expertise.
                  </p>
                  <p className="mt-3 text-sm text-charcoal/75 leading-relaxed">
                    Tech-savvy youth can register as <strong>Community Helpers</strong> to support local elders and relatives with listing, photography, and communication—always with the maker's consent.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate("register")}
                      className="bg-vermilion px-7 py-3 text-sm font-bold text-ivory hover:bg-charcoal transition-colors cursor-pointer shadow-md"
                    >
                      Register as Artisan or Helper →
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-charcoal/15 bg-ivory p-5">
                    <p className="font-bold text-sm text-teal">For Independent Artisans</p>
                    <p className="mt-1 text-xs text-charcoal/75 leading-relaxed">
                      You set your own prices. When a customer orders, you receive 100% of your listed price upon delivery. LokArt never deducts predatory commissions.
                    </p>
                  </div>

                  <div className="border border-charcoal/15 bg-ivory p-5">
                    <p className="font-bold text-sm text-terai">For Community Helpers</p>
                    <p className="mt-1 text-xs text-charcoal/75 leading-relaxed">
                      Assist an artisan in your village or family. Prepare photographs and descriptions. A helper cannot publish alone: the artisan reviews and confirms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION & IMPACT COUNTERS */}
        <section id="mission" className="bg-teal py-20 text-ivory">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-terai">
                Our Long-Term Mission
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-5xl leading-tight">
                Keep traditional craft visible, and make the business around it understandable.
              </h2>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-ivory/85">
                LokArt exists so makers in Parsa and the Terai can present their work with dignity,
                decide what is published in their name, and receive orders without handing that
                control to someone else.
              </p>
            </div>

            {/* Impact Metrics Row */}
            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4 pt-10 border-t border-ivory/20">
              {IMPACT_METRICS.map((metric) => (
                <div key={metric.label}>
                  <p className="font-serif text-4xl sm:text-5xl font-bold text-terai">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-ivory">
                    {metric.label}
                  </p>
                  <p className="text-xs text-ivory/70">{metric.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-20 bg-ivory">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-vermilion">
                Clarifications & Answers
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-charcoal">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm text-charcoal/70">
                Everything you need to know about LokArt, buying handcrafted work, and supporting creators.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {FAQS.map((faq, index) => (
                <div
                  key={faq.q}
                  className="border border-charcoal/15 bg-sand/30 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-5 text-left font-serif text-base sm:text-lg text-charcoal hover:text-vermilion cursor-pointer"
                    aria-expanded={expandedFaq === index}
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 text-xl font-bold text-charcoal/50">
                      {expandedFaq === index ? "−" : "+"}
                    </span>
                  </button>

                  {expandedFaq === index && (
                    <div className="border-t border-charcoal/10 p-5 pt-3 text-sm leading-relaxed text-charcoal/80 bg-ivory">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <SiteFooter onNavigate={onNavigate} />

      {/* STORY & CRAFT DETAILS MODAL */}
      {activeProductModal && (
        <CraftStoryModal
          product={activeProductModal}
          onClose={() => setActiveProductModal(null)}
          onRegisterClick={() => {
            setActiveProductModal(null);
            if (onNavigate) onNavigate("register");
          }}
        />
      )}
    </div>
  );
}
