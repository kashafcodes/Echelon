// ══════════════════════════════════════════════════════════════
//  LokArt AI Controller — Product Translation Endpoints
//  Protected: Vendor & Admin authentication required
// ══════════════════════════════════════════════════════════════

import { translateProductContent } from "../services/geminiTranslationService.js";

// In-memory rate limiter per user/vendor: max 15 requests per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const rateLimitMap = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userRecord = rateLimitMap.get(userId);

  if (!userRecord || now > userRecord.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    const secondsRemaining = Math.ceil((userRecord.resetTime - now) / 1000);
    return { allowed: false, secondsRemaining };
  }

  userRecord.count += 1;
  return { allowed: true };
}

// Cleanup stale rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * POST /api/ai/translate-product
 * Translates product title & description to English using Gemini
 */
export async function translateProduct(request, response) {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({
        ok: false,
        success: false,
        message: "Authentication required to access translation service.",
      });
    }

    // Rate limit check
    const rateCheck = checkRateLimit(user._id.toString());
    if (!rateCheck.allowed) {
      return response.status(429).json({
        ok: false,
        success: false,
        message: `Too many translation requests. Please wait ${rateCheck.secondsRemaining}s before trying again.`,
      });
    }

    const { productName = "", description = "" } = request.body || {};

    const cleanTitle = typeof productName === "string" ? productName.trim() : "";
    const cleanDesc = typeof description === "string" ? description.trim() : "";

    // Validation: at least one field must have content
    if (!cleanTitle && !cleanDesc) {
      return response.status(400).json({
        ok: false,
        success: false,
        message: "Please provide a product title or description to translate.",
      });
    }

    // Length safeguards
    if (cleanTitle.length > 300) {
      return response.status(400).json({
        ok: false,
        success: false,
        message: "Product title exceeds the 300 character limit.",
      });
    }

    if (cleanDesc.length > 5000) {
      return response.status(400).json({
        ok: false,
        success: false,
        message: "Product description exceeds the 5,000 character limit.",
      });
    }

    // Call translation service
    const result = await translateProductContent({
      productName: cleanTitle,
      description: cleanDesc,
    });

    return response.json({
      ok: true,
      success: true,
      translatedProductName: result.translatedProductName,
      translatedDescription: result.translatedDescription,
      detectedLanguage: result.detectedLanguage,
      notes: result.notes,
    });
  } catch (error) {
    console.error("[translateProduct Controller] Error:", error.message);

    if (error.code === "EMPTY_INPUT") {
      return response.status(400).json({
        ok: false,
        success: false,
        message: error.message,
      });
    }

    if (error.code === "API_KEY_MISSING") {
      return response.status(503).json({
        ok: false,
        success: false,
        message: "AI translation is currently unconfigured on this server (missing GEMINI_API_KEY).",
      });
    }

    if (error.code === "QUOTA_EXCEEDED") {
      return response.status(429).json({
        ok: false,
        success: false,
        message: error.message,
      });
    }

    if (error.code === "TIMEOUT") {
      return response.status(504).json({
        ok: false,
        success: false,
        message: "Translation request timed out. Please try again.",
      });
    }

    return response.status(500).json({
      ok: false,
      success: false,
      message: error.message || "Failed to translate product content. Please try again.",
    });
  }
}
