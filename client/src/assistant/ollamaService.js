// ══════════════════════════════════════════
//  LokArt AI Assistant — Ollama Service
//  Optional local AI model integration
// ══════════════════════════════════════════

const OLLAMA_BASE = "http://localhost:11434";
const TIMEOUT_MS = 4000;

let _available = null; // null = unchecked, true/false after check

export async function isOllamaAvailable() {
  if (_available !== null) return _available;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: ctrl.signal });
    clearTimeout(timer);
    _available = res.ok;
  } catch {
    _available = false;
  }
  return _available;
}

export function resetOllamaCache() {
  _available = null;
}

// Preferred lightweight models in order of preference
const PREFERRED_MODELS = ["phi3:mini", "llama3.2:1b", "llama3:latest", "mistral:latest"];

async function getAvailableModel() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const { models = [] } = await res.json();
    const names = models.map((m) => m.name);
    for (const preferred of PREFERRED_MODELS) {
      const found = names.find((n) => n.startsWith(preferred.split(":")[0]));
      if (found) return found;
    }
    return names[0] || null;
  } catch {
    return null;
  }
}

export async function enhanceIntentWithOllama(userText, conversationHistory = []) {
  if (!(await isOllamaAvailable())) return null;

  const model = await getAvailableModel();
  if (!model) return null;

  const systemPrompt = `You are a JSON-only intent classifier for LokArt, a Nepali handicraft e-commerce platform.
Classify the user's message into one of these intents:
GREET, HELP, SEARCH_PRODUCTS, ADD_TO_CART, REMOVE_FROM_CART, VIEW_CART, CLEAR_CART,
UPDATE_QUANTITY, ADD_TO_WISHLIST, VIEW_WISHLIST, VIEW_ORDERS, CHECK_ORDER_STATUS,
CANCEL_ORDER, START_CHECKOUT, CONFIRM, DENY,
VENDOR_VIEW_ORDERS, VENDOR_VIEW_PRODUCTS, VENDOR_VIEW_EARNINGS, VENDOR_LOW_STOCK, UNKNOWN

Also extract entities: query (product name/search term), category, number (quantity), orderId, status, sort.

Respond ONLY with valid JSON like:
{"intent":"SEARCH_PRODUCTS","entities":{"query":"thangka painting","category":"painting"},"confidence":0.9}`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-4).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: userText },
    ];

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.message?.content || "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export async function generateNaturalResponse(context) {
  if (!(await isOllamaAvailable())) return null;

  const model = await getAvailableModel();
  if (!model) return null;

  const { intent, data, userText } = context;

  const systemPrompt = `You are LokArt's friendly AI assistant for a Nepali handicraft marketplace.
Respond in 1-2 short, natural sentences. Be warm and helpful. 
Do not use markdown. Do not mention technical terms.
If you have product data, summarize it concisely.`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const userPrompt = `User said: "${userText}"
Intent: ${intent}
Data: ${JSON.stringify(data).slice(0, 400)}
Write a natural assistant response:`;

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data2 = await res.json();
    return data2.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
