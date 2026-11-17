import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { placeOrder, getMyOrders, getOrderById } from "../controllers/orderController.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Place a new order
router.post("/", placeOrder);

// Get the authenticated customer's order history
router.get("/my", getMyOrders);

// Get a single order by ID (customer must own it, or admin)
router.get("/:id", getOrderById);

export default router;
