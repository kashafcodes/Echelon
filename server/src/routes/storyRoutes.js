import express from "express";
import {
  getProductStory,
  getMyStories,
  createOrUpdateStory,
  updateStory,
  deleteStory,
  togglePublishStory,
} from "../controllers/storyController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public: Get published story by product ID
router.get("/product/:productId", getProductStory);

// Protected: Vendor story management
router.use(authenticate);

// Get vendor's own stories
router.get("/my-stories", authorize("vendor", "admin"), getMyStories);

// Create or update story
router.post("/", authorize("vendor", "admin"), createOrUpdateStory);

// Update story
router.put("/:storyId", authorize("vendor", "admin"), updateStory);

// Toggle publish
router.patch("/:storyId/publish", authorize("vendor", "admin"), togglePublishStory);

// Delete story
router.delete("/:storyId", authorize("vendor", "admin"), deleteStory);

export default router;
