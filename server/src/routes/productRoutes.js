import express from "express";
import {
  getProducts,
  getFeaturedProducts,
  getRandomProducts,
  getProductById,
  getCategories,
  getProductsByVendor,
} from "../controllers/productController.js";
import { getProductStory } from "../controllers/storyController.js";

const router = express.Router();

// Categories endpoint
router.get("/categories", getCategories);

// Featured and random product feeds
router.get("/featured", getFeaturedProducts);
router.get("/random", getRandomProducts);

// Vendor's published products (must be before /:id to avoid conflict)
router.get("/by-vendor/:vendorId", getProductsByVendor);

// Product story route (must be before /:id to avoid conflict)
router.get("/:productId/story", getProductStory);

// Product list with search and filters
router.get("/", getProducts);

// Single product details
router.get("/:id", getProductById);

export default router;
