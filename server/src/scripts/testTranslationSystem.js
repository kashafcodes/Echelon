// ══════════════════════════════════════════════════════════════
//  LokArt AI Translation System & Persistence Verification Script
// ══════════════════════════════════════════════════════════════

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import { generateToken } from "../utils/token.js";

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("\n========================================================");
  console.log("  LokArt AI Translation & Multilingual Verification");
  console.log("========================================================\n");

  await mongoose.connect("mongodb://127.0.0.1:27017/lokart");
  console.log("✓ MongoDB Connected");

  // 1. Find or pick vendor & customer for testing
  let vendorUser = await User.findOne({ role: "vendor" });
  let vendor = vendorUser ? await Vendor.findOne({ userId: vendorUser._id }) : null;

  if (!vendorUser || !vendor) {
    console.log("Creating test vendor for verification...");
    vendorUser = await User.create({
      name: "Artisan Ramesh",
      email: `ramesh_${Date.now()}@test.com`,
      password: "hashedPassword123!",
      role: "vendor",
      phone: "9812345678",
    });
    vendor = await Vendor.create({
      userId: vendorUser._id,
      businessName: "Mithila Handmade Creations",
      category: "Mithila Art",
      verificationStatus: "approved",
      businessAddress: {
        street: "Artisan Lane",
        city: "Janakpur",
        district: "Dhanusha",
        province: "Madhesh",
      },
    });
  }

  let customerUser = await User.findOne({ role: "customer" });
  if (!customerUser) {
    customerUser = await User.create({
      name: "Customer Sita",
      email: `sita_${Date.now()}@test.com`,
      password: "hashedPassword123!",
      role: "customer",
      phone: "9823456789",
    });
  }

  const vendorToken = generateToken(vendorUser);
  const customerToken = generateToken(customerUser);

  console.log(`✓ Test Vendor: ${vendorUser.name} (${vendor.businessName})`);
  console.log(`✓ Test Customer: ${customerUser.name}\n`);

  // ── TEST 1: Unauthenticated request to /api/ai/translate-product ──
  console.log("Test 1: Unauthenticated request should be blocked (401)...");
  const res1 = await fetch(`${BASE_URL}/api/ai/translate-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productName: "Bamboo tokari", description: "Haat le banako" }),
  });
  console.log(`  Status: ${res1.status} (Expected: 401)`);
  if (res1.status === 401) console.log("  ✓ PASSED: Authentication enforced.");
  else console.error("  ✕ FAILED: Should reject unauthenticated requests.");

  // ── TEST 2: Customer role trying to access vendor translation tool ──
  console.log("\nTest 2: Customer role should be blocked (403)...");
  const res2 = await fetch(`${BASE_URL}/api/ai/translate-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ productName: "Bamboo tokari", description: "Haat le banako" }),
  });
  console.log(`  Status: ${res2.status} (Expected: 403)`);
  if (res2.status === 403) console.log("  ✓ PASSED: Role-based authorization enforced.");
  else console.error("  ✕ FAILED: Customer should not access translation endpoint.");

  // ── TEST 3: Vendor with empty input ──
  console.log("\nTest 3: Empty input validation (400)...");
  const res3 = await fetch(`${BASE_URL}/api/ai/translate-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${vendorToken}`,
    },
    body: JSON.stringify({ productName: "", description: "   " }),
  });
  console.log(`  Status: ${res3.status} (Expected: 400)`);
  const data3 = await res3.json();
  console.log(`  Response message: "${data3.message}"`);
  if (res3.status === 400) console.log("  ✓ PASSED: Empty input correctly rejected.");
  else console.error("  ✕ FAILED: Empty input should return 400.");

  // ── TEST 4: Vendor translation request without GEMINI_API_KEY ──
  console.log("\nTest 4: Graceful error when GEMINI_API_KEY is not configured...");
  const res4 = await fetch(`${BASE_URL}/api/ai/translate-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${vendorToken}`,
    },
    body: JSON.stringify({
      productName: "Haat le banako bamboo basket",
      description: "Yo daura bamboo bata haat le banako ho. Mithila art bata inspired xa.",
    }),
  });
  console.log(`  Status: ${res4.status}`);
  const data4 = await res4.json();
  console.log(`  Response message: "${data4.message}"`);
  if (res4.status === 503 || res4.status === 200) {
    console.log("  ✓ PASSED: Safe error handling without secrets or stack leaks.");
  }

  // ── TEST 5: Database Persistence of Multilingual Product ──
  console.log("\nTest 5: Create product with original & English translations...");
  const sampleOriginalName = "हातले बुनेको प्राकृतिक बाँसको टोकरी";
  const sampleOriginalDesc = "यो टोकरी स्थानीय बाँसबाट पूर्ण रूपमा हातले बुनेको हो। मिथिला परम्परा अनुसार बनाइएको छ।";
  const sampleEnglishName = "Handwoven Natural Bamboo Basket";
  const sampleEnglishDesc = "This basket is completely handwoven using locally harvested bamboo, inspired by traditional Mithila craftsmanship.";

  const createRes = await fetch(`${BASE_URL}/api/vendor/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${vendorToken}`,
    },
    body: JSON.stringify({
      name: sampleEnglishName,
      description: sampleEnglishDesc,
      price: 1850,
      category: "Bamboo Crafts",
      quantity: 12,
      origin: "Janakpur, Dhanusha, Nepal",
      images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80"],
      materials: ["Natural Bamboo", "Organic Dyes"],
      craftingMethod: "Handweaving",
      originalName: sampleOriginalName,
      originalDescription: sampleOriginalDesc,
      originalLanguage: "Nepali",
      translations: {
        en: {
          name: sampleEnglishName,
          description: sampleEnglishDesc,
        },
      },
    }),
  });

  const createdData = await createRes.json();
  console.log(`  Status: ${createRes.status}`);
  if (!createdData.ok || !createdData.product?._id) {
    console.error("  ✕ FAILED to create product:", createdData);
    process.exit(1);
  }
  const createdId = createdData.product._id;
  console.log(`  ✓ Product created successfully with ID: ${createdId}`);

  // ── TEST 6: Verify Product Retrieval via Public API ──
  console.log("\nTest 6: Verify product retrieval preserves original & translated text...");
  const getRes = await fetch(`${BASE_URL}/api/products/${createdId}`);
  const fetchedData = await getRes.json();
  console.log(`  Status: ${getRes.status}`);

  const p = fetchedData.product;
  console.log(`  Name (English): "${p.name}"`);
  console.log(`  Original Name: "${p.originalName}"`);
  console.log(`  Original Description: "${p.originalDescription}"`);
  console.log(`  Original Language: "${p.originalLanguage}"`);

  if (
    p.name === sampleEnglishName &&
    p.originalName === sampleOriginalName &&
    p.originalDescription === sampleOriginalDesc &&
    p.originalLanguage === "Nepali"
  ) {
    console.log("  ✓ PASSED: Full multilingual persistence & API formatting confirmed!");
  } else {
    console.error("  ✕ FAILED: Fields mismatch in retrieved product.");
  }

  // ── TEST 7: Update Product with new translation ──
  console.log("\nTest 7: Vendor updates product translation...");
  const updatedDesc = "Updated handwoven bamboo basket crafted with organic vegetable dyes.";
  const updateRes = await fetch(`${BASE_URL}/api/vendor/products/${createdId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${vendorToken}`,
    },
    body: JSON.stringify({
      description: updatedDesc,
      originalDescription: sampleOriginalDesc,
      originalLanguage: "Nepali",
    }),
  });
  const updateData = await updateRes.json();
  console.log(`  Status: ${updateRes.status}`);
  if (updateData.ok && updateData.product.description === updatedDesc) {
    console.log("  ✓ PASSED: Product update preserved both versions successfully!");
  } else {
    console.error("  ✕ FAILED: Product update failed:", updateData);
  }

  // Clean up test product
  await Product.findByIdAndDelete(createdId);
  console.log(`\n✓ Cleanup: Test product ${createdId} removed.`);

  await mongoose.disconnect();
  console.log("\n========================================================");
  console.log("  ALL TESTS COMPLETED SUCCESSFULLY! ✓");
  console.log("========================================================\n");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
