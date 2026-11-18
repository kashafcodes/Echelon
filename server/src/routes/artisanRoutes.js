import express from "express";
import {
  getArtisanProfile,
  getArtisanProducts,
} from "../controllers/artisanController.js";

const router = express.Router();

// Public: Get artisan profile
router.get("/:vendorId", getArtisanProfile);

// Public: Get artisan products (with pagination & sorting)
router.get("/:vendorId/products", getArtisanProducts);

export default router;
