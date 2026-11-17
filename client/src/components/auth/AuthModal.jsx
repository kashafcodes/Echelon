import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";

export default function AuthModal({ onRoleRedirect }) {
  const {
    authModalOpen,
    authModalView,
    initialRole,
    closeAuthModal,
    setAuthModalView,
  } = useAuth();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && authModalOpen) {
        closeAuthModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleAuthSuccess = (user) => {
    closeAuthModal();
    if (onRoleRedirect) {
      onRoleRedirect(user);
    } else {
      if (user.role === "admin") {
        window.location.hash = "#admin";
      } else if (user.role === "vendor") {
        window.location.hash = "#vendor";
      } else {
        window.location.hash = "#customer";
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-fadeIn"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-ivory border border-charcoal/20 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute right-4 top-4 text-charcoal/60 hover:text-charcoal p-1 text-xl font-mono leading-none"
        >
          &times;
        </button>

        {/* Brand Banner */}
        <div className="mb-6 text-center">
          <p className="font-serif text-3xl text-charcoal tracking-wide">LokArt</p>
          <p className="text-xs tracking-[0.18em] text-teal uppercase mt-0.5">
            Parsa · The Terai · Nepal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-charcoal/15 mb-6">
          <button
            type="button"
            onClick={() => setAuthModalView("login")}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider uppercase transition-colors ${
              authModalView === "login"
                ? "border-b-2 border-vermilion text-vermilion"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalView("register")}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider uppercase transition-colors ${
              authModalView === "register"
                ? "border-b-2 border-vermilion text-vermilion"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Register
          </button>
        </div>

        {/* Content */}
        {authModalView === "login" ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthModalView("register")}
          />
        ) : (
          <RegisterForm
            initialRole={initialRole}
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthModalView("login")}
          />
        )}
      </div>
    </div>
  );
}
