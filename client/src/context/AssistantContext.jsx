// ══════════════════════════════════════════
//  LokArt AI Assistant — Context Provider
// ══════════════════════════════════════════

import { createContext, useContext, useState, useCallback } from "react";
import { createInitialState } from "../assistant/conversationManager.js";
import { LANGS } from "../assistant/i18n.js";

const AssistantContext = createContext(null);

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationState, setConversationState] = useState(createInitialState());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState(LANGS.EN);
  const [isMuted, setIsMuted] = useState(false);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        ...msg,
      },
    ]);
  }, []);

  const addMessages = useCallback((msgs) => {
    setMessages((prev) => [
      ...prev,
      ...msgs.map((m) => ({
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        ...m,
      })),
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationState(createInitialState());
  }, []);

  const openAssistant = useCallback(() => setIsOpen(true), []);
  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const toggleAssistant = useCallback(() => setIsOpen((o) => !o), []);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        messages,
        addMessage,
        addMessages,
        clearMessages,
        conversationState,
        setConversationState,
        isSpeaking,
        setIsSpeaking,
        isListening,
        setIsListening,
        isProcessing,
        setIsProcessing,
        lang,
        setLang,
        isMuted,
        setIsMuted,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
