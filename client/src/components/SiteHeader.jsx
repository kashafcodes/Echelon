import { useState } from "react";

const links = [
  { href: "#crafts", label: "Crafts" },
  { href: "#path", label: "How it works" },
  { href: "#mission", label: "Mission" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-ivory/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <a href="#top" className="group flex items-baseline gap-3" onClick={closeMenu}>
          <span className="font-serif text-2xl tracking-wide text-charcoal">LokArt</span>
          <span className="hidden text-xs tracking-[0.18em] text-teal uppercase sm:inline">
            Terai
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-charcoal/80 transition-colors hover:text-vermilion"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#creators"
            className="bg-vermilion px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-charcoal"
          >
            Become a Creator
          </a>
        </nav>

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

      {open ? (
        <nav id="mobile-nav" className="border-t border-charcoal/10 px-5 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMenu} className="text-lg">
                {link.label}
              </a>
            ))}
            <a href="#creators" onClick={closeMenu} className="text-lg text-vermilion">
              Become a Creator
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
