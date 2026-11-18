// ══════════════════════════════════════════════════════════════
//  LokArt Gemini API Translation Verification Script
//  Tests specific prompt cases using translateProductContent
// ══════════════════════════════════════════════════════════════

import dotenv from "dotenv";
dotenv.config();

import { translateProductContent } from "../services/geminiTranslationService.js";

const TEST_CASES = [
  {
    title: "Bamboo tokari",
    desc: "Yo haat le banako xa.",
    note: "Basic handmade claim",
  },
  {
    title: "Mithila painting",
    desc: "Yo mithila art bata inspired xa.",
    note: "Mithila art heritage",
  },
  {
    title: "Tokari",
    desc: "Yo bamboo bata banako tokari ho.",
    note: "Bamboo craft name",
  },
  {
    title: "Local craft",
    desc: "Yo hamro local artisan le banako ho.",
    note: "Local artisan reference",
  },
  {
    title: "Crochet creation",
    desc: "Isma crochet use gareko xa.",
    note: "Craft technique",
  },
];

async function runGeminiTest() {
  console.log("\n========================================================");
  console.log("  Testing Gemini API Translation with Nepali Examples");
  console.log("========================================================\n");

  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key === "your_gemini_api_key_here") {
    console.log("⚠️  GEMINI_API_KEY is not set in server/.env.");
    console.log("   To test live Gemini API translation:");
    console.log("   1. Open server/.env");
    console.log("   2. Set GEMINI_API_KEY=your_actual_gemini_key");
    console.log("   3. Run: node src/scripts/testGeminiApi.js\n");
    console.log("✓ Service gracefully handles missing key with clear notification.");
    return;
  }

  console.log(`Using Model: ${process.env.GEMINI_MODEL || "gemini-2.5-flash"}\n`);

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`Test Case ${i + 1}: ${tc.note}`);
    console.log(`  Input Title: "${tc.title}"`);
    console.log(`  Input Desc:  "${tc.desc}"`);

    try {
      const result = await translateProductContent({
        productName: tc.title,
        description: tc.desc,
      });

      console.log(`  ✓ Translated Title: "${result.translatedProductName}"`);
      console.log(`  ✓ Translated Desc:  "${result.translatedDescription}"`);
      console.log(`  ✓ Detected Language: "${result.detectedLanguage}"`);
      if (result.notes) console.log(`  ✓ Cultural Notes:    "${result.notes}"`);
      console.log("");
    } catch (err) {
      console.error(`  ✕ Error: ${err.message}\n`);
    }
  }
}

runGeminiTest().catch(console.error);
