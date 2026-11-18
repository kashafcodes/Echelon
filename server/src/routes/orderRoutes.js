import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrderByCustomer,
  getVendorOrders,
  updateVendorItemStatus,
  getAdminAllOrders,
  updateOrderPaymentStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Customer endpoints
router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.patch("/:id/cancel", cancelOrderByCustomer);

// Vendor endpoints (Artisans)
router.get("/vendor/orders", authorize("vendor", "admin"), getVendorOrders);
router.patch(
  "/vendor/:id/items/:itemId/status",
  authorize("vendor", "admin"),
  updateVendorItemStatus
);

// Admin endpoints (All orders & COD Payment settlements)
router.get("/admin/all", authorize("admin"), getAdminAllOrders);
router.patch("/admin/:id/payment-status", authorize("admin"), updateOrderPaymentStatus);

// Single order view (Customer, Vendor, or Admin)
router.get("/:id", getOrderById);

export default router;
