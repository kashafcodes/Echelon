// ══════════════════════════════════════════
//  LokArt AI Assistant — Floating Button
// ══════════════════════════════════════════

import { useAssistant } from "../../context/AssistantContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AssistantButton() {
  const { toggleAssistant, isOpen, messages, isListening } = useAssistant();
  const { user } = useAuth();

  // Only show for authenticated customer/vendor (not admin, not guest)
  if (!user || user.role === "admin") return null;

  const hasUnread = messages.length > 0 && !isOpen;

  return (
    <button
      onClick={toggleAssistant}
      aria-label="Open AI Assistant"
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-55 group"
      style={{ zIndex: 55 }}
    >
      {/* Outer glow when listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-teal/30 animate-ping scale-110" />
      )}

      {/* Button body */}
      <div
        className={`
          relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center
          transition-all duration-300 ease-out
          ${isOpen
            ? "bg-charcoal scale-95"
            : "bg-gradient-to-br from-vermilion to-terai hover:scale-105 active:scale-95"
          }
        `}
      >
        {isOpen ? (
          /* Close icon */
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Mic / sparkle icon */
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm7 10a1 1 0 112 0 7 7 0 01-6 6.92V21h3a1 1 0 110 2H9a1 1 0 110-2h3v-2.08A7 7 0 015 11a1 1 0 112 0 5 5 0 0010 0z" />
          </svg>
        )}

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold leading-none">
              {messages.filter((m) => m.role === "assistant").length > 9
                ? "9+"
                : messages.filter((m) => m.role === "assistant").length}
            </span>
          </span>
        )}
      </div>

      {/* Tooltip */}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-charcoal text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        {isOpen ? "Close Assistant" : "AI Assistant"}
      </span>
    </button>
  );
}
