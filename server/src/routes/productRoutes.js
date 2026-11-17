import express from "express";
import {
  getProducts,
  getFeaturedProducts,
  getRandomProducts,
  getProductById,
  getCategories,
} from "../controllers/productController.js";

const router = express.Router();

// Categories endpoint
router.get("/categories", getCategories);

// Featured and random product feeds
router.get("/featured", getFeaturedProducts);
router.get("/random", getRandomProducts);

// Product list with search and filters
router.get("/", getProducts);

// Single product details
router.get("/:id", getProductById);

export default router;
