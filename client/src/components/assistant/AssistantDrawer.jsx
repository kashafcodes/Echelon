// ══════════════════════════════════════════
//  LokArt AI Assistant — Main Drawer UI
// ══════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from "react";
import { useAssistant } from "../../context/AssistantContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MicButton from "./MicButton.jsx";
import {
  startListening,
  stopListening,
  speak,
  cancelSpeech,
  isSpeechSynthesisSupported,
  isWhisperRecording,
} from "../../assistant/speechService.js";
import { processMessage } from "../../assistant/conversationManager.js";
import { getResponse, LANGS, LANG_LABELS } from "../../assistant/i18n.js";

const WELCOME_MESSAGES = {
  [LANGS.EN]: (name, role) =>
    role === "vendor"
      ? `Namaste${name ? `, ${name}` : ""}! 🙏 I'm your LokArt assistant. Ask me about your orders, products, or earnings.`
      : `Namaste${name ? `, ${name}` : ""}! 🙏 I'm your LokArt assistant. I can help you search products, manage your cart, track orders, and more!`,
  [LANGS.NE]: (name) => `नमस्ते${name ? `, ${name}` : ""}! 🙏 म तपाईंको LokArt सहायक हूँ।`,
  [LANGS.HI]: (name) => `नमस्ते${name ? `, ${name}` : ""}! 🙏 मैं आपका LokArt सहायक हूं।`,
};

export default function AssistantDrawer() {
  const {
    isOpen,
    closeAssistant,
    messages,
    addMessage,
    addMessages,
    clearMessages,
    conversationState,
    setConversationState,
    isListening,
    setIsListening,
    isProcessing,
    setIsProcessing,
    isSpeaking,
    setIsSpeaking,
    lang,
    setLang,
    isMuted,
    setIsMuted,
  } = useAssistant();

  const { user } = useAuth();
  const cartContext = useCart();

  const [inputText, setInputText] = useState("");
  const [micError, setMicError] = useState("");
  const [interimText, setInterimText] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [micMode, setMicMode] = useState("auto"); // "auto" | "whisper"

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasShownWelcome = useRef(false);

  // ── Auto-scroll ───────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // ── Show welcome message on first open ─
  useEffect(() => {
    if (isOpen && !hasShownWelcome.current && user) {
      hasShownWelcome.current = true;
      const welcomeFn = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES[LANGS.EN];
      const welcomeText = welcomeFn(user.name, user.role);
      addMessage({ role: "assistant", text: welcomeText, type: "text" });
    }
  }, [isOpen, user, lang, addMessage]);

  // ── Focus input when opened ───────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Stop everything on close ──────────
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      cancelSpeech();
      setIsListening(false);
      setIsSpeaking(false);
      setInterimText("");
    }
  }, [isOpen, setIsListening, setIsSpeaking]);

  // ── Send message ──────────────────────
  const handleSend = useCallback(
    async (text) => {
      const trimmed = (text || inputText).trim();
      if (!trimmed || isProcessing) return;

      setInputText("");
      setInterimText("");
      setMicError("");

      // Add user message
      addMessage({ role: "user", text: trimmed, type: "text" });
      setIsProcessing(true);

      try {
        const { messages: responseMessages, newState } = await processMessage({
          text: trimmed,
          conversationState,
          user,
          cartContext,
          lang,
          messageHistory: messages.slice(-10),
        });

        setConversationState(newState);
        addMessages(responseMessages);

        // Speak the first text response if not muted
        if (!isMuted && isSpeechSynthesisSupported()) {
          const firstText = responseMessages.find((m) => m.text && m.type === "text")?.text;
          if (firstText) {
            setIsSpeaking(true);
            speak({
              text: firstText.replace(/\*\*/g, "").slice(0, 300), // strip markdown, limit length
              lang,
              onEnd: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false),
            });
          }
        }
      } catch (err) {
        addMessage({
          role: "assistant",
          text: getResponse("error", lang, err.message || "unknown"),
          type: "text",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      inputText, isProcessing, addMessage, addMessages, conversationState,
      setConversationState, user, cartContext, lang, messages, isMuted,
      setIsProcessing, setIsSpeaking,
    ]
  );

  // ── Handle confirm/deny buttons ───────
  const handleConfirm = useCallback(() => handleSend("yes"), [handleSend]);
  const handleDeny = useCallback(() => handleSend("no"), [handleSend]);

  // ── Voice input (auto-selects Web Speech → Whisper) ──
  const handleMicToggle = useCallback(() => {
    if (isListening) {
      // If Whisper recording → stop triggers transcription
      stopListening();
      setIsListening(false);
      return;
    }

    setMicError("");
    setInterimText("🎤 Starting microphone...");
    setIsListening(true);

    startListening({
      lang,
      onStatus: (statusMsg) => {
        setInterimText(statusMsg);
      },
      onResult: (transcript) => {
        setInterimText(transcript);
        setIsListening(false);
        handleSend(transcript);
      },
      onError: (errMsg) => {
        setMicError(errMsg);
        setInterimText("");
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
        setInterimText((t) => (t.startsWith("🎤") || t.startsWith("⬇️") || t.startsWith("🧠") || t.startsWith("⟳") || t.startsWith("🔄") ? "" : t));
      },
    });
  }, [isListening, lang, handleSend, setIsListening]);

  // ── Mute toggle ───────────────────────
  const handleMuteToggle = () => {
    if (!isMuted && isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
    }
    setIsMuted((m) => !m);
  };

  // ── Keyboard handler ──────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Mic state ─────────────────────────
  const micState = isListening ? "listening" : isProcessing ? "processing" : "idle";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 md:hidden"
        onClick={closeAssistant}
      />

      {/* Drawer panel */}
      <div
        className="
          fixed z-60 flex flex-col
          bottom-0 left-0 right-0 h-[90vh] rounded-t-2xl
          md:bottom-6 md:right-6 md:left-auto md:top-auto md:h-[600px] md:w-[400px] md:rounded-2xl
          bg-ivory shadow-2xl border border-sand overflow-hidden
          animate-slide-up md:animate-slide-left
        "
        style={{ zIndex: 60 }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-sand flex-shrink-0">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vermilion to-terai flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold font-serif">L</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-charcoal font-serif">LokArt Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              <span className="text-xs text-charcoal/50">
                {isListening
                  ? interimText.startsWith("⬇️")
                    ? "Downloading model..."
                    : interimText.startsWith("🧠")
                    ? "Processing..."
                    : "Recording..."
                  : isProcessing
                  ? "Thinking..."
                  : isSpeaking
                  ? "Speaking..."
                  : "Online · All browsers"}
              </span>
            </div>
          </div>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu((s) => !s)}
              className="text-xs font-medium text-charcoal/60 hover:text-charcoal px-2 py-1 rounded-lg hover:bg-sand transition-colors flex items-center gap-1"
            >
              {lang === LANGS.EN ? "EN" : lang === LANGS.NE ? "NE" : "HI"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-sand overflow-hidden z-10 min-w-[120px]">
                {Object.entries(LANG_LABELS).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-sand ${lang === code ? "text-vermilion font-semibold" : "text-charcoal"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mute button */}
          <button
            onClick={handleMuteToggle}
            title={isMuted ? "Unmute" : "Mute"}
            className={`p-1.5 rounded-lg transition-colors ${isMuted ? "bg-vermilion/10 text-vermilion" : "text-charcoal/50 hover:text-charcoal hover:bg-sand"}`}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Clear button */}
          <button
            onClick={clearMessages}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-sand transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Close button */}
          <button
            onClick={closeAssistant}
            className="p-1.5 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-sand transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {messages.length === 0 && !isProcessing && (
            <div className="text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vermilion/20 to-terai/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-vermilion/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm7 10a1 1 0 112 0 7 7 0 01-6 6.92V21h3a1 1 0 110 2H9a1 1 0 110-2h3v-2.08A7 7 0 015 11a1 1 0 112 0 5 5 0 0010 0z" />
                </svg>
              </div>
              <p className="text-sm text-charcoal/50 font-serif">Start a conversation</p>
              <p className="text-xs text-charcoal/40 mt-1">Try: "Find thangka paintings"</p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onAddToCart={(product) => {
                cartContext.addToCart(product, 1);
                addMessage({ role: "assistant", text: `✅ Added "${product.name}" to your cart!`, type: "text" });
              }}
              onAddToWishlist={(product) => {
                cartContext.toggleWishlist(product);
                addMessage({ role: "assistant", text: `💛 Saved "${product.name}" to your wishlist!`, type: "text" });
              }}
              onConfirm={handleConfirm}
              onDeny={handleDeny}
            />
          ))}

          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-vermilion flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">L</span>
              </div>
              <div className="bg-sand rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-charcoal/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-charcoal/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-charcoal/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Error / status bar ── */}
        {(micError || interimText) && (
          <div
            className={`px-4 py-2.5 text-xs flex-shrink-0 flex items-start gap-2 ${
              micError ? "bg-vermilion/10 text-vermilion border-t border-vermilion/20" : "bg-teal/10 text-teal border-t border-teal/20"
            }`}
          >
            <span className="flex-1 leading-relaxed">{micError || interimText}</span>
            {micError && (
              <button
                onClick={() => setMicError("")}
                className="flex-shrink-0 opacity-60 hover:opacity-100 mt-0.5"
                aria-label="Dismiss error"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── Quick suggestions ── */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
            {(user?.role === "vendor"
              ? ["My orders", "My products", "My earnings", "Low stock"]
              : ["Find art", "My cart", "My orders", "Help"]
            ).map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs whitespace-nowrap bg-white border border-sand text-charcoal/70 hover:text-vermilion hover:border-vermilion/40 rounded-full px-3 py-1.5 transition-colors flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ── Input area ── */}
        <div className="border-t border-sand bg-white px-3 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Mic button */}
            <MicButton
              state={micState}
              onClick={handleMicToggle}
              disabled={isProcessing}
            />

            {/* Text input */}
            <input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? "Listening..." : `Ask me anything... (${lang === LANGS.EN ? "English" : lang === LANGS.NE ? "नेपाली" : "हिंदी"})`
              }
              disabled={isListening || isProcessing}
              className="
                flex-1 text-sm text-charcoal placeholder-charcoal/40
                bg-sand rounded-xl px-4 py-2.5
                border border-transparent focus:border-teal/40 focus:outline-none
                transition-colors disabled:opacity-60
              "
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isProcessing}
              className="
                w-10 h-10 rounded-xl bg-vermilion text-white
                flex items-center justify-center flex-shrink-0
                hover:bg-vermilion/85 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-charcoal/30 mt-2">
            🎤 Voice works in all browsers · Text always available
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-left {
          from { transform: translateX(100%) scale(0.95); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16,1,0.3,1); }
        @media (min-width: 768px) {
          .animate-slide-left { animation: slide-left 0.3s cubic-bezier(0.16,1,0.3,1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
