// ══════════════════════════════════════════
//  LokArt AI Assistant — Mic Button
// ══════════════════════════════════════════

export default function MicButton({ state = "idle", onClick, disabled = false }) {
  // state: "idle" | "listening" | "processing"

  const baseClass =
    "relative flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none select-none";

  const stateStyles = {
    idle: "bg-charcoal/10 hover:bg-teal/15 text-charcoal/60 hover:text-teal w-10 h-10",
    listening: "bg-teal text-white w-10 h-10 shadow-lg",
    processing: "bg-terai/20 text-terai w-10 h-10",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={state === "listening" ? "Stop listening" : "Start voice input"}
      className={`${baseClass} ${stateStyles[state] || stateStyles.idle} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Pulse ring when listening */}
      {state === "listening" && (
        <span className="absolute inset-0 rounded-full bg-teal/40 animate-ping" />
      )}

      {state === "processing" ? (
        /* Spinner */
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        /* Mic icon */
        <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-7 9a1 1 0 112 0 5 5 0 0010 0 1 1 0 112 0 7 7 0 01-6 6.92V21h3a1 1 0 110 2H9a1 1 0 110-2h3v-2.08A7 7 0 015 12z" />
        </svg>
      )}
    </button>
  );
}
