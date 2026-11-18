import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { translateProduct } from "../controllers/aiController.js";

const router = express.Router();

// Both vendors and administrators can access AI translation tools
router.use(authenticate);
router.use(authorize("vendor", "admin"));

router.post("/translate-product", translateProduct);

export default router;
