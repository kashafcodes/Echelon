// ══════════════════════════════════════════
//  LokArt AI Assistant — Intent Engine
//  Rule-based NLP classifier (zero-cost)
// ══════════════════════════════════════════

// ── Intent definitions ───────────────────
export const INTENTS = {
  GREET: "GREET",
  HELP: "HELP",
  SEARCH_PRODUCTS: "SEARCH_PRODUCTS",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  VIEW_CART: "VIEW_CART",
  CLEAR_CART: "CLEAR_CART",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  ADD_TO_WISHLIST: "ADD_TO_WISHLIST",
  REMOVE_FROM_WISHLIST: "REMOVE_FROM_WISHLIST",
  VIEW_WISHLIST: "VIEW_WISHLIST",
  VIEW_ORDERS: "VIEW_ORDERS",
  CHECK_ORDER_STATUS: "CHECK_ORDER_STATUS",
  CANCEL_ORDER: "CANCEL_ORDER",
  START_CHECKOUT: "START_CHECKOUT",
  CONFIRM: "CONFIRM",
  DENY: "DENY",
  // Vendor intents
  VENDOR_VIEW_ORDERS: "VENDOR_VIEW_ORDERS",
  VENDOR_UPDATE_ORDER_STATUS: "VENDOR_UPDATE_ORDER_STATUS",
  VENDOR_VIEW_PRODUCTS: "VENDOR_VIEW_PRODUCTS",
  VENDOR_VIEW_EARNINGS: "VENDOR_VIEW_EARNINGS",
  VENDOR_LOW_STOCK: "VENDOR_LOW_STOCK",
  UNKNOWN: "UNKNOWN",
};

// ── Keyword maps ─────────────────────────
const patterns = [
  {
    intent: INTENTS.GREET,
    keywords: ["hello", "hi", "hey", "namaste", "namaskar", "hola", "good morning", "good afternoon", "good evening", "नमस्ते", "हेलो"],
  },
  {
    intent: INTENTS.HELP,
    keywords: ["help", "what can you do", "commands", "assist", "guide", "how to", "options", "सहायता", "मदद"],
  },
  {
    intent: INTENTS.CONFIRM,
    keywords: ["yes", "yeah", "yep", "ok", "okay", "sure", "confirm", "proceed", "do it", "go ahead", "हो", "ठीक"],
  },
  {
    intent: INTENTS.DENY,
    keywords: ["no", "nope", "cancel", "stop", "abort", "never mind", "don't", "नहीं", "नो"],
  },
  {
    intent: INTENTS.SEARCH_PRODUCTS,
    keywords: ["search", "find", "look for", "show me", "browse", "discover", "get", "खोज", "ढूंढ"],
  },
  {
    intent: INTENTS.ADD_TO_CART,
    keywords: ["add to cart", "put in cart", "buy", "purchase", "cart add", "add it", "कार्ट में", "खरीद"],
  },
  {
    intent: INTENTS.REMOVE_FROM_CART,
    keywords: ["remove from cart", "delete from cart", "take out", "remove it", "हटाओ"],
  },
  {
    intent: INTENTS.VIEW_CART,
    keywords: ["view cart", "show cart", "my cart", "what's in cart", "cart items", "cart total", "कार्ट देखो"],
  },
  {
    intent: INTENTS.CLEAR_CART,
    keywords: ["clear cart", "empty cart", "remove all", "कार्ट खाली"],
  },
  {
    intent: INTENTS.UPDATE_QUANTITY,
    keywords: ["update quantity", "change quantity", "set quantity", "quantity to", "pieces", "units"],
  },
  {
    intent: INTENTS.ADD_TO_WISHLIST,
    keywords: ["add to wishlist", "save", "favourite", "favorite", "wishlist add", "like", "heart", "विशलिस्ट"],
  },
  {
    intent: INTENTS.REMOVE_FROM_WISHLIST,
    keywords: ["remove from wishlist", "unsave", "unfavorite", "wishlist remove"],
  },
  {
    intent: INTENTS.VIEW_WISHLIST,
    keywords: ["view wishlist", "show wishlist", "my wishlist", "saved items", "favourites", "my saves"],
  },
  {
    intent: INTENTS.VIEW_ORDERS,
    keywords: ["my orders", "order history", "past orders", "show orders", "view orders", "मेरे आदेश"],
  },
  {
    intent: INTENTS.CHECK_ORDER_STATUS,
    keywords: ["order status", "track order", "where is my order", "delivery status", "ऑर्डर स्टेटस"],
  },
  {
    intent: INTENTS.CANCEL_ORDER,
    keywords: ["cancel order", "return order", "ऑर्डर रद्द"],
  },
  {
    intent: INTENTS.START_CHECKOUT,
    keywords: ["checkout", "place order", "pay now", "proceed to checkout", "complete purchase", "चेकआउट"],
  },
  // Vendor
  {
    intent: INTENTS.VENDOR_VIEW_ORDERS,
    keywords: ["vendor orders", "my shop orders", "incoming orders", "customer orders", "new orders"],
  },
  {
    intent: INTENTS.VENDOR_VIEW_PRODUCTS,
    keywords: ["my products", "my listings", "product list", "inventory", "stock", "my items"],
  },
  {
    intent: INTENTS.VENDOR_VIEW_EARNINGS,
    keywords: ["earnings", "revenue", "commission", "income", "profit", "sales report", "how much earned"],
  },
  {
    intent: INTENTS.VENDOR_LOW_STOCK,
    keywords: ["low stock", "out of stock", "running low", "stock alert"],
  },
];

// ── Entity extraction ─────────────────────
function extractEntities(text) {
  const lower = text.toLowerCase();
  const entities = {};

  // Extract number (quantity, price, order ref)
  const numMatch = lower.match(/\b(\d+)\b/);
  if (numMatch) entities.number = parseInt(numMatch[1], 10);

  // Extract category keywords
  const categories = ["painting", "sculpture", "textile", "pottery", "jewelry", "jewellery",
    "woodcraft", "metalwork", "handicraft", "art", "craft", "fabric"];
  for (const cat of categories) {
    if (lower.includes(cat)) {
      entities.category = cat;
      break;
    }
  }

  // Extract price range
  const priceMatch = lower.match(/under\s+(?:rs\.?\s*)?(\d+)|below\s+(?:rs\.?\s*)?(\d+)/i);
  if (priceMatch) entities.maxPrice = parseInt(priceMatch[1] || priceMatch[2], 10);

  const minPriceMatch = lower.match(/above\s+(?:rs\.?\s*)?(\d+)|over\s+(?:rs\.?\s*)?(\d+)/i);
  if (minPriceMatch) entities.minPrice = parseInt(minPriceMatch[1] || minPriceMatch[2], 10);

  // Extract sort preference
  if (lower.includes("newest") || lower.includes("latest") || lower.includes("new")) entities.sort = "newest";
  else if (lower.includes("price low") || lower.includes("cheapest") || lower.includes("cheap")) entities.sort = "price_asc";
  else if (lower.includes("price high") || lower.includes("expensive")) entities.sort = "price_desc";

  // Extract search query — strip known intent words to get product name
  const stripWords = ["search", "find", "look for", "show me", "browse", "get", "for", "a", "an", "the", "some"];
  let query = lower;
  stripWords.forEach((w) => { query = query.replace(new RegExp(`\\b${w}\\b`, "g"), ""); });
  query = query.replace(/\s+/g, " ").trim();
  if (query.length > 1) entities.query = query;

  // Extract order ID pattern (alphanumeric 10+ chars)
  const orderMatch = text.match(/[A-Za-z0-9]{10,}/);
  if (orderMatch) entities.orderId = orderMatch[0];

  // Extract status keywords
  const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "processing"];
  for (const s of statuses) {
    if (lower.includes(s)) { entities.status = s; break; }
  }

  return entities;
}

// ── Main classifier ───────────────────────
export function classifyIntent(text) {
  if (!text || text.trim().length === 0) {
    return { intent: INTENTS.UNKNOWN, confidence: 0, entities: {} };
  }

  const lower = text.toLowerCase();
  let bestMatch = { intent: INTENTS.UNKNOWN, confidence: 0 };

  for (const { intent, keywords } of patterns) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const confidence = kw.length / lower.length; // longer match = higher confidence
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence };
        }
      }
    }
  }

  // If confidence too low, still return best guess
  if (bestMatch.intent === INTENTS.UNKNOWN && lower.length > 2) {
    // Try single word approaches
    if (lower.includes("cart")) bestMatch = { intent: INTENTS.VIEW_CART, confidence: 0.3 };
    else if (lower.includes("order")) bestMatch = { intent: INTENTS.VIEW_ORDERS, confidence: 0.3 };
    else if (lower.includes("wish")) bestMatch = { intent: INTENTS.VIEW_WISHLIST, confidence: 0.3 };
  }

  const entities = extractEntities(text);

  // Refine intent based on entities
  if (bestMatch.intent === INTENTS.SEARCH_PRODUCTS && entities.query) {
    // Keep as search
  }

  return {
    intent: bestMatch.intent,
    confidence: Math.min(bestMatch.confidence, 1),
    entities,
    originalText: text,
  };
}
