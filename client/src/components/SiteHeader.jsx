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
    return "#profile";
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
            <div className="flex items-center gap-3 pl-3 border-l border-charcoal/15">
              {/* Admin Dashboard Action */}
              {user.role === "admin" && (
                <a
                  href="#admin"
                  className="rounded bg-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal/80 transition-colors flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
                  Admin Dashboard
                </a>
              )}

              {/* Vendor Studio Action */}
              {user.role === "vendor" && (
                <a
                  href="#vendor"
                  className="rounded bg-vermilion px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  Artisan Studio
                </a>
              )}

              {/* User Profile Pill (links directly to role-appropriate profile) */}
              <a
                href="#profile"
                className="flex items-center gap-2 rounded border border-charcoal/20 bg-sand/40 px-2.5 py-1 text-xs font-medium text-charcoal hover:border-teal hover:text-teal transition-all group"
                title={
                  user.role === "admin"
                    ? "Administrator Profile"
                    : user.role === "vendor"
                      ? "Artisan Studio & Personal Profile"
                      : "Customer Profile"
                }
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
                <span className="font-semibold text-charcoal group-hover:text-teal transition-colors max-w-[130px] truncate">
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
                    <div className="flex items-center gap-2.5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover border border-charcoal/20"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-xs font-bold text-ivory">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                      <div>
                        <span className="font-semibold text-sm text-charcoal block">
                          {user.role === "vendor" && vendor?.businessName ? vendor.businessName : user.name}
                        </span>
                        <span className="text-[10px] text-charcoal/60 uppercase font-bold tracking-wider">
                          {user.role === "admin"
                            ? "Platform Administrator"
                            : user.role === "vendor"
                              ? "LokArt Artisan"
                              : "Verified Customer"}
                        </span>
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
                    className={`py-2 text-center text-xs font-semibold uppercase tracking-wider ${
                      user.role === "customer"
                        ? "bg-teal text-ivory"
                        : "border border-charcoal/30 text-charcoal"
                    }`}
                  >
                    {user.role === "admin"
                      ? "Admin Profile & Credentials"
                      : user.role === "vendor"
                        ? "Shop & Artisan Profile"
                        : "My Profile & Address"}
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
