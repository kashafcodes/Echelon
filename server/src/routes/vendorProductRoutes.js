import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createVendorProduct,
  getVendorProducts,
  getVendorProductById,
  updateVendorProduct,
  togglePublishProduct,
  deleteVendorProduct,
} from "../controllers/productController.js";

const router = express.Router();

// All vendor routes require authentication and vendor role
router.use(authenticate);
router.use(authorize("vendor", "admin"));

router.post("/", createVendorProduct);
router.get("/", getVendorProducts);
router.get("/:id", getVendorProductById);
router.put("/:id", updateVendorProduct);
router.patch("/:id/publish", togglePublishProduct);
router.delete("/:id", deleteVendorProduct);

export default router;
