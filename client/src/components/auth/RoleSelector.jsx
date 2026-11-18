export default function RoleSelector({ role, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase mb-2">
        Choose Account Type *
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Customer option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("customer")}
          className={`flex flex-col items-start p-3.5 text-left border transition-all ${
            role === "customer"
              ? "border-teal bg-teal/10 shadow-sm ring-1 ring-teal"
              : "border-charcoal/20 bg-ivory hover:border-charcoal/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                role === "customer"
                  ? "border-teal bg-teal"
                  : "border-charcoal/40 bg-transparent"
              }`}
            >
              {role === "customer" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-ivory" />
              ) : null}
            </span>
            <span className="font-serif font-medium text-base text-charcoal">
              Customer
            </span>
          </div>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Browse, order and support local artisans and traditional craftsmanship.
          </p>
        </button>

        {/* Vendor option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("vendor")}
          className={`flex flex-col items-start p-3.5 text-left border transition-all ${
            role === "vendor"
              ? "border-vermilion bg-vermilion/10 shadow-sm ring-1 ring-vermilion"
              : "border-charcoal/20 bg-ivory hover:border-charcoal/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                role === "vendor"
                  ? "border-vermilion bg-vermilion"
                  : "border-charcoal/40 bg-transparent"
              }`}
            >
              {role === "vendor" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-ivory" />
              ) : null}
            </span>
            <span className="font-serif font-medium text-base text-charcoal">
              Artisan / Vendor
            </span>
          </div>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Sell authentic handcrafted work and manage listings with verified approval.
          </p>
        </button>
      </div>
      <p className="mt-2 text-xs text-charcoal/60 italic">
        * Admin accounts require private system authorization and cannot be registered publicly.
      </p>
    </div>
  );
}
