import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import WishlistDrawer from "./WishlistDrawer.jsx";

const navLinks = [
  { href: "#top", label: "Home" },
  { href: "#categories", label: "Categories" },
  { href: "#products", label: "Explore Crafts" },
  { href: "#artisans", label: "Artisans" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // mobile search expand
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { user, vendor, openLogin, openRegister, logout } = useAuth();
  const { cartCount, setCartOpen, wishlistCount } = useCart();

  function closeMenu() {
    setMenuOpen(false);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    window.location.hash = q
      ? `#products?search=${encodeURIComponent(q)}`
      : "#products";
    setSearchOpen(false);
    closeMenu();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-ivory/95 backdrop-blur-md">

        {/* ════════════════════════════════
            TOP BAR  (logo | search | icons)
            ════════════════════════════════ */}
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">

          {/* Brand */}
          <a
            href="#top"
            className="group flex items-baseline gap-1.5 shrink-0"
            onClick={closeMenu}
          >
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-charcoal group-hover:text-vermilion transition-colors">
              LokArt
            </span>
            <span className="rounded bg-terai/20 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-teal uppercase hidden sm:inline">
              Terai
            </span>
          </a>

          {/* ── Desktop search (md+): flex-1, always visible ── */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 items-center rounded-lg border border-charcoal/20 bg-sand/50 transition-all hover:border-charcoal/35 focus-within:border-teal focus-within:bg-ivory focus-within:shadow-sm overflow-hidden mx-2"
          >
            <span className="pl-3 pr-1 text-charcoal/40 shrink-0">
              <svg className="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Mithila art, pottery, bamboo, jewelry…"
              className="flex-1 min-w-0 bg-transparent py-2.5 pr-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-2 text-charcoal/35 hover:text-charcoal transition-colors shrink-0"
                aria-label="Clear"
              >
                <svg className="h-3.5 w-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="shrink-0 self-stretch px-4 bg-teal text-ivory text-xs font-bold uppercase tracking-wider hover:bg-charcoal transition-colors"
            >
              Search
            </button>
          </form>

          {/* Spacer on mobile so icons go to the right */}
          <div className="flex-1 md:hidden" />

          {/* ── Right icon cluster ── */}
          <div className="flex items-center gap-0.5 shrink-0">

            {/* Mobile: Search toggle icon */}
            <button
              type="button"
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                searchOpen
                  ? "text-teal bg-teal/10"
                  : "text-charcoal/70 hover:text-charcoal hover:bg-sand/60"
              }`}
              aria-label="Search"
            >
              {searchOpen ? (
                <svg className="h-5 w-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              className="relative p-2 text-charcoal/70 hover:text-vermilion hover:bg-sand/60 transition-colors rounded-lg"
              title="Saved Crafts"
              aria-label="Open wishlist"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-vermilion text-[9px] font-bold text-ivory">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-charcoal/70 hover:text-teal hover:bg-sand/60 transition-colors rounded-lg"
              title="Cart"
              aria-label="Open cart"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal text-[9px] font-bold text-ivory">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-charcoal/15">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <a href="#admin" className="rounded bg-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal/80 transition-colors flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
                      Admin
                    </a>
                  )}
                  {user.role === "vendor" && (
                    <a href="#vendor" className="rounded bg-vermilion px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                      Studio
                    </a>
                  )}
                  <a
                    href="#profile"
                    className="flex items-center gap-1.5 rounded border border-charcoal/20 bg-sand/40 px-2.5 py-1.5 text-xs font-medium text-charcoal hover:border-teal hover:text-teal transition-all"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-5 w-5 rounded-full object-cover border border-charcoal/20" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-[10px] font-bold text-ivory">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                    <span className="font-semibold max-w-[90px] truncate">
                      {user.role === "vendor" && vendor?.businessName ? vendor.businessName : user.name}
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-charcoal/55 hover:text-vermilion transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={openLogin} className="text-xs font-semibold uppercase tracking-wider text-charcoal hover:text-vermilion transition-colors px-2 py-1.5">
                    Sign In
                  </button>
                  <button type="button" onClick={() => openRegister("customer")} className="border border-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors rounded">
                    Register
                  </button>
                  <button type="button" onClick={() => openRegister("vendor")} className="bg-vermilion px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors rounded hidden xl:inline-block">
                    Sell Craft
                  </button>
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
              className="md:hidden rounded-lg border border-charcoal/20 p-2 text-charcoal hover:bg-sand transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════
            MOBILE SEARCH ROW (expands on tap)
            ════════════════════════════════ */}
        {searchOpen && (
          <div className="md:hidden border-t border-charcoal/8 bg-ivory px-4 py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-xl border-2 border-teal bg-white shadow-sm overflow-hidden"
            >
              <span className="pl-3 pr-2 text-teal shrink-0">
                <svg className="h-4 w-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crafts, art, jewelry…"
                autoFocus
                className="flex-1 min-w-0 bg-transparent py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2 text-charcoal/35 hover:text-charcoal transition-colors shrink-0"
                >
                  <svg className="h-3.5 w-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 self-stretch px-5 bg-teal text-ivory text-xs font-bold uppercase tracking-wider hover:bg-charcoal transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════
            DESKTOP NAV LINKS ROW
            ════════════════════════════════ */}
        <div className="hidden md:flex items-center gap-6 px-6 lg:px-8 py-1.5 border-t border-charcoal/8 max-w-7xl mx-auto text-xs font-semibold uppercase tracking-wider text-charcoal/70">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-vermilion transition-colors py-0.5">
              {link.label}
            </a>
          ))}
          {user && (
            <a href="#my-orders" className="ml-auto hover:text-teal transition-colors py-0.5">
              My Orders
            </a>
          )}
        </div>

        {/* ════════════════════════════════
            MOBILE DRAWER MENU
            ════════════════════════════════ */}
        {menuOpen && (
          <div className="md:hidden border-t border-charcoal/10 bg-ivory px-5 py-5 space-y-4 shadow-lg">
            <nav className="flex flex-col gap-1 font-semibold uppercase tracking-wider text-xs">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center py-2.5 px-1 text-charcoal hover:text-vermilion border-b border-charcoal/6 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="border-t border-charcoal/10 pt-4 flex flex-col gap-2.5">
              {user ? (
                <>
                  {/* User identity row */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2.5">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-teal/30" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-sm font-bold text-ivory">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                      <div>
                        <span className="text-xs font-bold text-charcoal block">
                          {user.role === "vendor" && vendor?.businessName ? vendor.businessName : user.name}
                        </span>
                        <span className="text-[10px] text-teal uppercase font-bold">{user.role}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { closeMenu(); logout(); }}
                      className="text-xs text-vermilion uppercase font-semibold border border-vermilion/30 px-2.5 py-1 rounded"
                    >
                      Sign Out
                    </button>
                  </div>

                  {user.role === "admin" && (
                    <a href="#admin" onClick={closeMenu} className="bg-charcoal py-3 text-center text-xs font-bold uppercase tracking-wider text-ivory rounded-lg">
                      Admin Dashboard
                    </a>
                  )}
                  {user.role === "vendor" && (
                    <a href="#vendor" onClick={closeMenu} className="bg-vermilion py-3 text-center text-xs font-bold uppercase tracking-wider text-ivory rounded-lg hover:bg-charcoal transition-colors">
                      Artisan Studio
                    </a>
                  )}
                  <a href="#profile" onClick={closeMenu} className="border border-charcoal/25 py-3 text-center text-xs font-bold uppercase tracking-wider text-charcoal rounded-lg hover:border-teal hover:text-teal transition-colors">
                    My Profile & Settings
                  </a>
                  <a href="#my-orders" onClick={closeMenu} className="bg-sand border border-charcoal/15 py-3 text-center text-xs font-bold uppercase tracking-wider text-charcoal hover:text-teal transition-colors rounded-lg">
                    My Orders & Tracking
                  </a>
                  <button
                    type="button"
                    onClick={() => { closeMenu(); setWishlistOpen(true); }}
                    className="flex items-center justify-center gap-2 border border-vermilion/25 py-3 text-xs font-bold uppercase tracking-wider text-vermilion rounded-lg hover:bg-vermilion/5 transition-colors"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Saved Crafts {wishlistCount > 0 && `(${wishlistCount})`}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { closeMenu(); openLogin(); }}
                    className="border border-charcoal py-3 text-center text-xs font-bold uppercase tracking-wider text-charcoal rounded-lg hover:bg-charcoal hover:text-ivory transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { closeMenu(); openRegister("customer"); }}
                    className="bg-teal py-3 text-center text-xs font-bold uppercase tracking-wider text-ivory rounded-lg hover:bg-charcoal transition-colors"
                  >
                    Create Customer Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { closeMenu(); openRegister("vendor"); }}
                    className="bg-vermilion py-3 text-center text-xs font-bold uppercase tracking-wider text-ivory rounded-lg hover:bg-charcoal transition-colors"
                  >
                    Register as Artisan Vendor
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Wishlist drawer */}
      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
