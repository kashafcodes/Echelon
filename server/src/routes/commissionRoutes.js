import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getCommissionSettings,
  updateCommissionSettings,
  getAdminCommissionOverview,
  getVendorCommissionOverview,
} from "../controllers/commissionController.js";

const router = express.Router();

// All commission endpoints require authentication
router.use(authenticate);

// Global settings: Admin & Vendor can view; only Admin can update
router.get("/settings", getCommissionSettings);
router.put("/settings", authorize("admin"), updateCommissionSettings);

// Admin dedicated analytics, vendor summaries & global transaction ledger
router.get("/admin/overview", authorize("admin"), getAdminCommissionOverview);

// Vendor dedicated earnings, commission deductions & order breakdown (Read-only)
router.get("/vendor/overview", authorize("vendor", "admin"), getVendorCommissionOverview);

export default router;
