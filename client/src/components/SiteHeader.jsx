import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const navLinks = [
  { href: "#top", label: "Home" },
  { href: "#categories", label: "Categories" },
  { href: "#products", label: "Explore Crafts" },
  { href: "#artisans", label: "Artisans" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, vendor, openLogin, openRegister, logout } = useAuth();
  const { cartCount, setCartOpen, wishlistCount } = useCart();

  function closeMenu() {
    setOpen(false);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      window.location.hash = "#products";
      return;
    }
    // Encode query into hash for ProductsPage to pick up
    window.location.hash = `#products?search=${encodeURIComponent(searchQuery.trim())}`;
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-ivory/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a href="#top" className="group flex items-baseline gap-2 shrink-0" onClick={closeMenu}>
          <span className="font-serif text-2xl font-bold tracking-wide text-charcoal group-hover:text-vermilion transition-colors">
            LokArt
          </span>
          <span className="rounded bg-terai/20 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-teal uppercase">
            Terai
          </span>
        </a>

        {/* Search Bar - Center Desktop */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md items-center border border-charcoal/20 bg-sand/40 hover:border-charcoal/40 focus-within:border-teal focus-within:bg-ivory rounded transition-all mx-2"
        >
          <span className="pl-3 text-charcoal/40 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Mithila art, bamboo, pottery, jewelry..."
            className="w-full bg-transparent px-3 py-1.5 text-xs text-charcoal placeholder:text-charcoal/45 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-2 text-xs text-charcoal/40 hover:text-charcoal"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="border-l border-charcoal/15 bg-sand/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-teal hover:text-ivory transition-colors rounded-r"
          >
            Search
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider text-charcoal/80">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-vermilion transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section: Actions & Auth */}
        <div className="flex items-center gap-3">
          {/* Wishlist Button */}
          <a
            href="#products"
            className="relative p-2 text-charcoal hover:text-vermilion transition-colors"
            title="Wishlist items"
            aria-label="Wishlist"
          >
            <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-vermilion text-[10px] font-bold text-ivory">
                {wishlistCount}
              </span>
            )}
          </a>

          {/* Cart Button */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-charcoal hover:text-teal transition-colors flex items-center"
            title="Shopping Cart"
            aria-label="Cart"
          >
            <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-teal text-[10px] font-bold text-ivory">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth State (Desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-charcoal/15">
            {user ? (
              <>
                {/* Admin Dashboard CTA */}
                {user.role === "admin" && (
                  <a
                    href="#admin"
                    className="rounded bg-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal/80 transition-colors flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
                    Admin
                  </a>
                )}

                {/* Vendor Studio CTA */}
                {user.role === "vendor" && (
                  <a
                    href="#vendor"
                    className="rounded bg-vermilion px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                    Artisan Studio
                  </a>
                )}

                {/* User Profile Pill */}
                <a
                  href="#profile"
                  className="flex items-center gap-2 rounded border border-charcoal/20 bg-sand/40 px-2.5 py-1 text-xs font-medium text-charcoal hover:border-teal hover:text-teal transition-all group"
                  title="View & Edit Profile"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover border border-charcoal/20"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-[11px] font-bold text-ivory">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                  <span className="font-semibold text-charcoal group-hover:text-teal transition-colors max-w-[110px] truncate">
                    {user.role === "vendor" && vendor?.businessName ? vendor.businessName : user.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-charcoal text-ivory"
                        : user.role === "vendor"
                          ? vendor?.verificationStatus === "approved"
                            ? "bg-teal/20 text-teal"
                            : "bg-terai/20 text-terai"
                          : "bg-teal/15 text-teal"
                    }`}
                  >
                    {user.role === "admin"
                      ? "Admin"
                      : user.role === "vendor"
                        ? vendor?.verificationStatus === "approved"
                          ? "Artisan"
                          : "Pending"
                        : "Customer"}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-charcoal/60 hover:text-vermilion transition-colors font-medium ml-1"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  className="text-xs font-semibold uppercase tracking-wider text-charcoal hover:text-vermilion transition-colors px-2 py-1.5"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openRegister("customer")}
                  className="border border-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => openRegister("vendor")}
                  className="bg-vermilion px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors hidden xl:inline-block"
                >
                  Sell Craft
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden rounded border border-charcoal/20 p-2 text-charcoal hover:bg-sand"
            aria-label="Toggle navigation menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="md:hidden px-4 pb-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center border border-charcoal/20 bg-sand/40 rounded overflow-hidden"
        >
          <span className="pl-3 text-charcoal/40 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search traditional crafts..."
            className="w-full bg-transparent px-3 py-1.5 text-xs text-charcoal placeholder:text-charcoal/50 focus:outline-hidden"
          />
          <button
            type="submit"
            className="bg-teal px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory"
          >
            Go
          </button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="md:hidden border-t border-charcoal/10 bg-ivory px-5 py-6 space-y-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-3 font-semibold uppercase tracking-wider text-xs">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="py-1 text-charcoal hover:text-vermilion border-b border-charcoal/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="border-t border-charcoal/10 pt-4 flex flex-col gap-2.5">
            {user ? (
              <>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-xs font-bold text-ivory">
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
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="text-xs text-vermilion uppercase font-semibold"
                  >
                    Sign Out
                  </button>
                </div>

                {user.role === "admin" && (
                  <a
                    href="#admin"
                    onClick={closeMenu}
                    className="bg-charcoal py-2 text-center text-xs font-semibold uppercase tracking-wider text-ivory"
                  >
                    Open Admin Dashboard
                  </a>
                )}
                {user.role === "vendor" && (
                  <a
                    href="#vendor"
                    onClick={closeMenu}
                    className="bg-vermilion py-2 text-center text-xs font-semibold uppercase tracking-wider text-ivory"
                  >
                    Open Artisan Studio
                  </a>
                )}
                <a
                  href="#profile"
                  onClick={closeMenu}
                  className="border border-charcoal/30 py-2 text-center text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  My Profile & Settings
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    openLogin();
                  }}
                  className="border border-charcoal py-2 text-center text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    openRegister("customer");
                  }}
                  className="bg-teal py-2 text-center text-xs font-semibold uppercase tracking-wider text-ivory"
                >
                  Create Customer Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    openRegister("vendor");
                  }}
                  className="bg-vermilion py-2 text-center text-xs font-semibold uppercase tracking-wider text-ivory"
                >
                  Register as Artisan Vendor
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
