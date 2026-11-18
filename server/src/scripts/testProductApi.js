import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lokart";

async function testBackend() {
  try {
    console.log("Testing MongoDB connection and Product models...");
    await mongoose.connect(uri);

    const categories = await Category.find({ isActive: true });
    console.log(`✓ Categories loaded: ${categories.length}`);

    const publishedProducts = await Product.find({ isPublished: true, isDeleted: false, status: "published" });
    console.log(`✓ Published products in store: ${publishedProducts.length}`);

    if (publishedProducts.length > 0) {
      console.log(`Sample Product: "${publishedProducts[0].name}" - Rs. ${publishedProducts[0].price} (${publishedProducts[0].stockStatus})`);
    }

    console.log("All Product Model & DB tests PASSED successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testBackend();
