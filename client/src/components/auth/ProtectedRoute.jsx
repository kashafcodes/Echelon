import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requireApprovedVendor = false,
}) {
  const { user, vendor, loading, openLogin } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
          <p className="text-sm tracking-wide text-charcoal/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="rounded border border-charcoal/15 bg-sand p-8 shadow-sm">
          <p className="text-sm font-semibold tracking-wider text-vermilion uppercase">
            Sign In Required
          </p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal">
            Authentication Required
          </h2>
          <p className="mt-3 text-sm text-charcoal/80 leading-relaxed">
            Please log in with your LokArt account to access this section.
          </p>
          <button
            type="button"
            onClick={openLogin}
            className="mt-6 inline-block bg-vermilion px-6 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal transition-colors"
          >
            Sign In to LokArt
          </button>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="rounded border border-vermilion/30 bg-vermilion/10 p-8 shadow-sm">
          <p className="text-sm font-semibold tracking-wider text-vermilion uppercase">
            Access Restricted
          </p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal">Unauthorized Role</h2>
          <p className="mt-3 text-sm text-charcoal/80 leading-relaxed">
            Your account ({user.role}) does not have permission to view this section.
          </p>
          <a
            href="#top"
            className="mt-6 inline-block border border-charcoal px-6 py-2.5 text-sm text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Check vendor verification status if route requires approval
  if (
    user.role === "vendor" &&
    requireApprovedVendor &&
    vendor?.verificationStatus !== "approved"
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded border-2 border-terai bg-sand/60 p-6 text-charcoal shadow-sm">
          <span className="inline-block rounded bg-terai/20 px-2.5 py-1 text-xs font-bold tracking-wider text-terai uppercase">
            Verification Pending
          </span>
          <h3 className="mt-3 font-serif text-2xl">
            Artisan Shop Under Review
          </h3>
          <p className="mt-2 text-sm text-charcoal/80 leading-relaxed">
            Your vendor application for <strong>{vendor?.businessName || "your craft shop"}</strong> is
            currently awaiting review by LokArt administrators. To maintain genuine Terai craftsmanship,
            product publishing is enabled once your verification is approved.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#vendor"
              className="bg-teal px-5 py-2 text-xs font-medium text-ivory hover:bg-charcoal"
            >
              View Vendor Profile
            </a>
            <a
              href="#products"
              className="border border-charcoal px-5 py-2 text-xs text-charcoal hover:bg-charcoal hover:text-ivory"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
