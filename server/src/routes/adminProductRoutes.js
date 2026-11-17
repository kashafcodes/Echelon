import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAdminPendingProducts,
  approveProduct,
  rejectProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Admin-only endpoints
router.use(authenticate);
router.use(authorize("admin"));

router.get("/pending", getAdminPendingProducts);
router.patch("/:id/approve", approveProduct);
router.patch("/:id/reject", rejectProduct);

export default router;
