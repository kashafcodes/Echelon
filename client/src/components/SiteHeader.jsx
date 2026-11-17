import { useState } from "react";

export default function SiteHeader({ currentView = "home", onNavigate }) {
  const [open, setOpen] = useState(false);

  const links = [
    { target: "crafts", label: "Creations & Crafts" },
    { target: "artisans", label: "Meet the Creators" },
    { target: "path", label: "How LokArt Works" },
    { target: "mission", label: "Our Mission" },
    { target: "faq", label: "FAQs" },
  ];

  function handleLinkClick(target) {
    setOpen(false);
    if (onNavigate) {
      onNavigate("home", target);
    }
  }

  function handleLogoClick(e) {
    e.preventDefault();
    setOpen(false);
    if (onNavigate) {
      onNavigate("home", "top");
    }
  }

  function handleBecomeCreator() {
    setOpen(false);
    if (onNavigate) {
      onNavigate(currentView === "register" ? "home" : "register");
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-ivory/95 backdrop-blur-md">
      {/* Regional Terai Notice Bar */}
      <div className="bg-charcoal px-4 py-1.5 text-center text-xs tracking-wider text-ivory">
        <span className="text-terai font-medium">🇳🇵 LokArt Initiative:</span> Direct from artisans in Parsa & the Terai · 100% Handcrafted · Cash on Delivery Nepal
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <a
          href="#top"
          onClick={handleLogoClick}
          className="group flex items-baseline gap-2.5 text-decoration-none"
        >
          <span className="font-serif text-3xl font-bold tracking-tight text-charcoal group-hover:text-vermilion transition-colors">
            LokArt
          </span>
          <span className="rounded bg-teal/15 px-2 py-0.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-teal">
            Parsa · Terai
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <button
              key={link.target}
              type="button"
              onClick={() => handleLinkClick(link.target)}
              className="text-sm font-medium tracking-wide text-charcoal/80 transition-colors hover:text-vermilion cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          {currentView === "register" ? (
            <button
              type="button"
              onClick={() => handleLinkClick("top")}
              className="border border-charcoal px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-ivory cursor-pointer"
            >
              ← Back to Marketplace
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBecomeCreator}
              className="bg-vermilion px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-charcoal cursor-pointer shadow-sm"
            >
              Become a Creator
            </button>
          )}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          {currentView !== "register" && (
            <button
              type="button"
              onClick={handleBecomeCreator}
              className="bg-vermilion px-3 py-1.5 text-xs font-medium text-ivory"
            >
              Join
            </button>
          )}
          <button
            type="button"
            className="border border-charcoal/20 px-3 py-1.5 text-sm font-medium hover:bg-charcoal/5"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "✕ Close" : "☰ Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-charcoal/10 bg-ivory px-5 py-4 md:hidden animate-fadeIn"
          aria-label="Mobile Navigation"
        >
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <button
                key={link.target}
                type="button"
                onClick={() => handleLinkClick(link.target)}
                className="text-left text-base font-medium py-1 text-charcoal/90 hover:text-vermilion"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-charcoal/10">
              <button
                type="button"
                onClick={handleBecomeCreator}
                className="w-full bg-vermilion py-2.5 text-center text-sm font-semibold text-ivory"
              >
                {currentView === "register" ? "← Back to Marketplace" : "Become a Creator / Helper"}
              </button>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
