import { Router } from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  getAdminUsers,
  updateVendorStatus,
} from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes (any authenticated user)
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.post("/profile/avatar", authenticate, uploadAvatar);
router.delete("/profile/avatar", authenticate, removeAvatar);
router.put("/password", authenticate, changePassword);

// Admin-only routes
router.get("/admin/users", authenticate, authorize("admin"), getAdminUsers);
router.put(
  "/admin/vendors/:id/status",
  authenticate,
  authorize("admin"),
  updateVendorStatus,
);

export default router;
