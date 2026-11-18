import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function MobileBottomNav() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash.toLowerCase() || "#top");
  const { cartCount, cartOpen, setCartOpen } = useCart();
  const { user, openLogin } = useAuth();

  useEffect(() => {
    function handleHashChange() {
      setCurrentHash(window.location.hash.toLowerCase() || "#top");
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isHome =
    !currentHash ||
    currentHash === "#top" ||
    currentHash === "" ||
    currentHash === "#categories" ||
    currentHash === "#crafts" ||
    currentHash === "#artisans";

  const isExplore =
    currentHash.startsWith("#products") ||
    currentHash.startsWith("#product");

  const isOrders =
    currentHash.startsWith("#my-orders") ||
    currentHash.startsWith("#orders");

  const isProfile =
    currentHash.startsWith("#profile") ||
    currentHash.startsWith("#user-profile") ||
    currentHash.startsWith("#vendor-profile") ||
    currentHash.startsWith("#admin-profile") ||
    currentHash.startsWith("#vendor") ||
    currentHash.startsWith("#admin");

  const navigateTo = (targetHash) => {
    // Crucial: Automatically close cart drawer so user is not stuck on cart overlay!
    setCartOpen(false);
    window.location.hash = targetHash;
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-60 w-[90%] max-w-md bg-ivory/95 backdrop-blur-md border border-charcoal/15 rounded-full shadow-2xl py-2 px-3 flex items-center justify-around transition-all select-none"
    >
      {/* 1. Explore Crafts Button */}
      <a
        href="#products"
        onClick={(e) => {
          e.preventDefault();
          navigateTo("#products");
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-300 ${
          isExplore && !cartOpen
            ? "-translate-y-2 text-vermilion font-bold scale-110 drop-shadow-sm"
            : "text-charcoal/70 hover:text-charcoal active:scale-95"
        }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
            isExplore && !cartOpen
              ? "bg-vermilion text-ivory shadow-md shadow-vermilion/30"
              : "bg-transparent text-charcoal/75"
          }`}
        >
          <svg
            className="h-5 w-5 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <span
          className={`text-[9px] uppercase tracking-wider font-bold mt-0.5 ${
            isExplore && !cartOpen ? "text-vermilion" : "text-charcoal/60"
          }`}
        >
          Explore
        </span>
      </a>

      {/* 2. My Orders Button */}
      <a
        href={user ? "#my-orders" : "#top"}
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            openLogin();
          } else {
            navigateTo("#my-orders");
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-300 ${
          isOrders && !cartOpen
            ? "-translate-y-2 text-vermilion font-bold scale-110 drop-shadow-sm"
            : "text-charcoal/70 hover:text-charcoal active:scale-95"
        }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
            isOrders && !cartOpen
              ? "bg-vermilion text-ivory shadow-md shadow-vermilion/30"
              : "bg-transparent text-charcoal/75"
          }`}
        >
          <svg
            className="h-5 w-5 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <span
          className={`text-[9px] uppercase tracking-wider font-bold mt-0.5 ${
            isOrders && !cartOpen ? "text-vermilion" : "text-charcoal/60"
          }`}
        >
          Orders
        </span>
      </a>

      {/* 3. Center Elevated Home Icon */}
      <div className="relative flex items-center justify-center -mt-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navigateTo("#top");
          }}
          className={`flex flex-col items-center justify-center transition-all duration-300 ${
            isHome && !cartOpen
              ? "-translate-y-3 scale-110 drop-shadow-md"
              : "hover:-translate-y-1"
          }`}
          aria-label="Home"
        >
          <div
            className={`flex h-13 w-13 items-center justify-center rounded-full shadow-lg border-2 transition-all duration-300 ${
              isHome && !cartOpen
                ? "bg-vermilion border-ivory text-ivory ring-4 ring-terai/30 shadow-vermilion/40"
                : "bg-teal border-ivory text-ivory hover:bg-charcoal"
            }`}
          >
            <svg
              className="h-6 w-6 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span
            className={`text-[9px] uppercase tracking-wider font-bold mt-1 ${
              isHome && !cartOpen ? "text-vermilion font-black" : "text-charcoal/70"
            }`}
          >
            Home
          </span>
        </a>
      </div>

      {/* 4. Cart Button */}
      <button
        type="button"
        onClick={() => setCartOpen(!cartOpen)}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-300 cursor-pointer ${
          cartOpen
            ? "-translate-y-2 text-teal font-bold scale-110 drop-shadow-sm"
            : "text-charcoal/70 hover:text-teal active:scale-95"
        }`}
        aria-label="Cart"
      >
        <div
          className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
            cartOpen
              ? "bg-teal text-ivory shadow-md shadow-teal/30"
              : "bg-transparent text-charcoal/75 hover:bg-sand/40"
          }`}
        >
          <svg
            className="h-5 w-5 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {cartCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold shadow-xs ${
                cartOpen ? "bg-vermilion text-ivory" : "bg-teal text-ivory"
              }`}
            >
              {cartCount}
            </span>
          )}
        </div>
        <span
          className={`text-[9px] uppercase tracking-wider font-bold mt-0.5 ${
            cartOpen ? "text-teal" : "text-charcoal/60"
          }`}
        >
          Cart
        </span>
      </button>

      {/* 5. Profile / Account Button */}
      <a
        href={user ? "#profile" : "#top"}
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            openLogin();
          } else {
            navigateTo("#profile");
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-300 ${
          isProfile && !cartOpen
            ? "-translate-y-2 text-vermilion font-bold scale-110 drop-shadow-sm"
            : "text-charcoal/70 hover:text-charcoal active:scale-95"
        }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
            isProfile && !cartOpen
              ? "bg-vermilion text-ivory shadow-md shadow-vermilion/30"
              : "bg-transparent text-charcoal/75"
          }`}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className={`h-7 w-7 rounded-full object-cover border ${
                isProfile && !cartOpen ? "border-ivory ring-2 ring-vermilion/50" : "border-charcoal/20"
              }`}
            />
          ) : (
            <svg
              className="h-5 w-5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
        <span
          className={`text-[9px] uppercase tracking-wider font-bold mt-0.5 ${
            isProfile && !cartOpen ? "text-vermilion" : "text-charcoal/60"
          }`}
        >
          {user ? (user.role === "vendor" ? "Studio" : user.role === "admin" ? "Admin" : "Profile") : "Sign In"}
        </span>
      </a>
    </nav>
  );
}
