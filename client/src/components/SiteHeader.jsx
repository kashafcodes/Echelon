import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { href: "#products", label: "Products" },
  { href: "#crafts", label: "Crafts" },
  { href: "#path", label: "How it works" },
  { href: "#mission", label: "Mission" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, vendor, openLogin, openRegister, logout } = useAuth();

  function closeMenu() {
    setOpen(false);
  }

  const getDashboardHref = () => {
    if (!user) return "#top";
    if (user.role === "admin") return "#admin";
    if (user.role === "vendor") return "#vendor";
    return "#customer";
  };

  const getDashboardLabel = () => {
    if (!user) return "";
    if (user.role === "admin") return "Admin Dashboard";
    if (user.role === "vendor") return "Artisan Studio";
    return "My Profile";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-ivory/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <a href="#top" className="group flex items-baseline gap-3" onClick={closeMenu}>
          <span className="font-serif text-2xl tracking-wide text-charcoal">LokArt</span>
          <span className="hidden text-xs tracking-[0.18em] text-teal uppercase sm:inline">
            Terai
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-charcoal/80 transition-colors hover:text-vermilion"
            >
              {link.label}
            </a>
          ))}

          {/* Authentication State */}
          {user ? (
            <div className="flex items-center gap-4 pl-2 border-l border-charcoal/15">
              <a
                href={getDashboardHref()}
                className="flex items-center gap-2 group"
                title={`Logged in as ${user.name} (${user.role})`}
              >
                <span className="font-medium text-sm text-charcoal group-hover:text-vermilion transition-colors">
                  {user.name}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    user.role === "admin"
                      ? "bg-charcoal text-ivory"
                      : user.role === "vendor"
                        ? vendor?.verificationStatus === "approved"
                          ? "bg-teal/20 text-teal"
                          : "bg-terai/20 text-terai"
                        : "bg-teal/15 text-teal"
                  }`}
                >
                  {user.role === "vendor"
                    ? vendor?.verificationStatus === "approved"
                      ? "Artisan"
                      : "Pending"
                    : user.role}
                </span>
              </a>

              <a
                href={getDashboardHref()}
                className="border border-charcoal/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
              >
                {getDashboardLabel()}
              </a>

              <a
                href="#profile"
                className="border border-teal/40 bg-teal/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal hover:bg-teal hover:text-ivory transition-colors"
              >
                Profile
              </a>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-charcoal/60 hover:text-vermilion transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-charcoal/15">
              <button
                type="button"
                onClick={openLogin}
                className="text-sm font-medium text-charcoal hover:text-vermilion transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openRegister("customer")}
                className="border border-charcoal px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => openRegister("vendor")}
                className="bg-vermilion px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors"
              >
                Become a Creator
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="border border-charcoal/20 px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-charcoal/10 px-5 py-4 md:hidden bg-ivory"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-base text-charcoal"
              >
                {link.label}
              </a>
            ))}

            <div className="border-t border-charcoal/10 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-charcoal">
                      {user.name} ({user.role})
                    </span>
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
                  <a
                    href={getDashboardHref()}
                    onClick={closeMenu}
                    className="bg-teal py-2 text-center text-xs font-semibold uppercase tracking-wider text-ivory"
                  >
                    Open {getDashboardLabel()}
                  </a>
                  <a
                    href="#profile"
                    onClick={closeMenu}
                    className="border border-charcoal/30 py-2 text-center text-xs font-semibold uppercase tracking-wider text-charcoal"
                  >
                    Profile & Settings
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
                    className="border border-teal py-2 text-center text-xs font-semibold uppercase tracking-wider text-teal"
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
                    Become a Creator / Artisan
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
