// ══════════════════════════════════════════════════════════════
//  LokArt AI Translation Service — Google Gemini API
//  Translates Nepali (script/Romanized), Bhojpuri & mixed text
//  into natural, respectful English while preserving craft authenticity.
// ══════════════════════════════════════════════════════════════

import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Ensure environment variables are loaded regardless of current working directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

/**
 * Dynamically resolves the Gemini API key from process.env or directly from .env file
 * so changes to .env take effect immediately without needing a manual server restart.
 */
function getGeminiApiKey() {
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
  ) {
    return process.env.GEMINI_API_KEY.trim();
  }

  try {
    const envPath = path.resolve(__dirname, "../../.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
      if (match && match[1]) {
        const key = match[1].trim().replace(/^["']|["']$/g, "");
        if (key && key !== "your_gemini_api_key_here") {
          process.env.GEMINI_API_KEY = key;
          return key;
        }
      }
    }
  } catch (err) {
    console.warn("Could not read .env file directly:", err.message);
  }

  return null;
}

/**
 * Dynamically resolves the preferred Gemini model name
 */
function getGeminiModel() {
  if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) {
    return process.env.GEMINI_MODEL.trim();
  }

  try {
    const envPath = path.resolve(__dirname, "../../.env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^GEMINI_MODEL=(.+)$/m);
      if (match && match[1]) {
        const model = match[1].trim().replace(/^["']|["']$/g, "");
        if (model) {
          process.env.GEMINI_MODEL = model;
          return model;
        }
      }
    }
  } catch (_) {}

  return "gemini-3.1-flash-lite";
}

const SYSTEM_INSTRUCTION = `You are a multilingual translation assistant for LokArt, a marketplace dedicated to local Nepali artisans and handmade traditional crafts.

Understand Romanized Nepali (e.g., "Yo product haat le banako xa", "mithila art bata inspired"), Nepali script (e.g., "यो उत्पादन हातले बनाएको हो"), Bhojpuri, and mixed Nepali-English descriptions.

Translate the vendor's product title and description into natural, grammatically correct, professional English.

CRITICAL RULES:
1. Preserve the exact original meaning faithfully.
2. NEVER invent product materials, origins, dimensions, crafting methods, cultural backstories, or product qualities that were not mentioned by the vendor.
3. Do not add exaggerated or unsupported marketing claims (e.g. do not say "finest in the world" unless the vendor explicitly said so).
4. Preserve traditional craft names, cultural terminology, and regional identities (e.g., Mithila, Kohbar, Thangka, Daura, Dhaka, Lokta, Sukul, Madhubani, Khukuri, Chulo, Doko, Nanglo).
5. Understand informal phonetics and common Romanized Nepali variations (e.g., "xa"/"cha"/"chha" = छ/छन्, "yo" = यो, "bata" = बाट, "le" = ले, "banako" = बनाएको, "gareko" = गरेको, "tokari" = basket, "daura" = basket/apparel, "isma" = यसमा).
6. Do not translate proper names, artisan studio names, or brand names.
7. If the original text is already in good English, refine for clarity and polish without altering meaning.
8. Identify the source language (e.g. "Romanized Nepali", "Nepali", "Bhojpuri", "Mixed Nepali/English", "English").
9. Return structured JSON with:
   - translatedProductName: English translation of product title (or empty string if not provided)
   - translatedDescription: English translation of description (or empty string if not provided)
   - detectedLanguage: Identified source language/dialect
   - notes: Any optional cultural context preserved (or null)`;

/**
 * Clean & parse JSON from Gemini response text
 */
function parseGeminiJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response from AI translation service.");
  }

  let cleaned = rawText.trim();
  // Strip markdown code fences if returned (e.g. ```json ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  // Attempt direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract JSON object via regex
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse structured response from translation service.");
  }
}

/**
 * Translate product name and description using Google Gemini API
 *
 * @param {Object} params
 * @param {string} params.productName - Original title from vendor
 * @param {string} params.description - Original description from vendor
 * @returns {Promise<{
 *   success: boolean,
 *   translatedProductName: string,
 *   translatedDescription: string,
 *   detectedLanguage: string,
 *   notes?: string
 * }>}
 */
export async function translateProductContent({ productName = "", description = "" }) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    const error = new Error(
      "Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env."
    );
    error.code = "API_KEY_MISSING";
    throw error;
  }

  const modelName = getGeminiModel();

  const candidateModels = [
    modelName,
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i); // unique

  const cleanTitle = (productName || "").trim();
  const cleanDesc = (description || "").trim();

  if (!cleanTitle && !cleanDesc) {
    const error = new Error("Product title or description must be provided for translation.");
    error.code = "EMPTY_INPUT";
    throw error;
  }

  const userPrompt = `Translate the following product information into natural English for LokArt:

${cleanTitle ? `Product Title / Name:\n"${cleanTitle}"\n` : "(No title provided)\n"}
${cleanDesc ? `Product Description:\n"${cleanDesc}"\n` : "(No description provided)\n"}

Return ONLY valid JSON matching this schema:
{
  "translatedProductName": string,
  "translatedDescription": string,
  "detectedLanguage": string,
  "notes": string or null
}`;

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      // 25 second timeout safeguard
      const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          const err = new Error("Gemini translation request timed out. Please try again.");
          err.code = "TIMEOUT";
          reject(err);
        }, 25000);
      });

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Low temperature for high translation fidelity and minimal hallucination
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedProductName: {
                type: Type.STRING,
                description: "The translated English product title",
              },
              translatedDescription: {
                type: Type.STRING,
                description: "The translated English product description",
              },
              detectedLanguage: {
                type: Type.STRING,
                description: "Detected source language, e.g., Romanized Nepali, Nepali, Bhojpuri, etc.",
              },
              notes: {
                type: Type.STRING,
                description: "Brief notes on preserved craft terms, or null",
                nullable: true,
              },
            },
            required: ["translatedProductName", "translatedDescription", "detectedLanguage"],
          },
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response?.text;

      const parsed = parseGeminiJson(responseText);

      return {
        success: true,
        translatedProductName: (parsed.translatedProductName || cleanTitle).trim(),
        translatedDescription: (parsed.translatedDescription || cleanDesc).trim(),
        detectedLanguage: parsed.detectedLanguage || "Nepali/Regional",
        notes: parsed.notes || null,
      };
    } catch (err) {
      const errStr = (err.message || "").toLowerCase();
      // If model not found, high demand, or temporarily unavailable, try next candidate model
      if (
        errStr.includes("not_found") ||
        errStr.includes("404") ||
        errStr.includes("no longer available") ||
        errStr.includes("unavailable") ||
        errStr.includes("503") ||
        errStr.includes("high demand") ||
        errStr.includes("overloaded")
      ) {
        console.warn(`[Gemini Translation] Model ${modelName} unavailable, attempting next candidate...`);
        lastError = err;
        continue;
      }
      lastError = err;
      break;
    }
  }

  // If all models failed or a non-recoverable error occurred
  const err = lastError || new Error("Failed to generate translation.");
  console.error("[Gemini Translation Service] Error:", err.message);

  // Provide friendly, non-sensitive error messages
  if (err.code === "API_KEY_MISSING" || err.code === "EMPTY_INPUT" || err.code === "TIMEOUT") {
    throw err;
  }

  // Check for quota or rate limit errors
  const errStr = (err.message || "").toLowerCase();
  if (errStr.includes("quota") || errStr.includes("429") || errStr.includes("resource_exhausted")) {
    const quotaErr = new Error(
      "Gemini translation quota limit reached or service is busy. Please try again in a few moments."
    );
    quotaErr.code = "QUOTA_EXCEEDED";
    throw quotaErr;
  }

  if (errStr.includes("api_key") || errStr.includes("unauthenticated") || errStr.includes("403") || errStr.includes("api key not valid")) {
    const authErr = new Error(
      "Invalid Gemini API credentials. Please check your GEMINI_API_KEY configuration."
    );
    authErr.code = "INVALID_KEY";
    throw authErr;
  }

  const genErr = new Error(
    "Translation service temporarily unavailable. Please verify your connection or try again."
  );
  genErr.code = "SERVICE_ERROR";
  throw genErr;
}
