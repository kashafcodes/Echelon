import mongoose from "mongoose";
import ProductStory from "../models/ProductStory.js";
import Product from "../models/Product.js";
import {
  uploadStoryImageToCloudinary,
  uploadStoryVideoToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
} from "../utils/cloudinary.js";

/**
 * Helper to process media items (handles base64 uploads)
 */
async function processMediaItems(mediaInput = []) {
  const processed = [];

  for (let i = 0; i < mediaInput.length; i++) {
    const item = mediaInput[i];
    const order = item.order !== undefined ? item.order : i;

    // If already has a clean remote URL and not a data URI
    if (item.url && !item.url.startsWith("data:")) {
      processed.push({
        type: item.type === "video" ? "video" : "image",
        url: item.url,
        publicId: item.publicId || "",
        thumbnail: item.thumbnail || "",
        order,
      });
      continue;
    }

    // If Base64 Data URL needs uploading
    const dataUrl = item.base64 || item.url;
    if (dataUrl && dataUrl.startsWith("data:")) {
      if (item.type === "video") {
        if (!isCloudinaryConfigured()) {
          throw new Error("Cloudinary must be configured to upload video stories.");
        }
        const uploadRes = await uploadStoryVideoToCloudinary(dataUrl);
        processed.push({
          type: "video",
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id,
          thumbnail: uploadRes.secure_url.replace(/\.[^/.]+$/, ".jpg"),
          order,
        });
      } else {
        // Image upload
        let secureUrl = dataUrl;
        let publicId = "";
        if (isCloudinaryConfigured()) {
          const uploadRes = await uploadStoryImageToCloudinary(dataUrl);
          secureUrl = uploadRes.secure_url;
          publicId = uploadRes.public_id;
        }
        processed.push({
          type: "image",
          url: secureUrl,
          publicId,
          order,
        });
      }
    }
  }

  return processed;
}

/**
 * GET /api/stories/product/:productId
 * Public: Get published story for a product
 */
export async function getProductStory(request, response) {
  try {
    const { productId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return response.status(400).json({ ok: false, message: "Invalid product ID." });
    }

    const story = await ProductStory.findOne({
      productId,
      isPublished: true,
    })
      .populate("productId", "name price images category stockStatus")
      .populate("vendorId", "businessName category businessAddress verificationStatus")
      .populate("userId", "name avatar")
      .lean();

    if (!story) {
      // Check if product has an embedded story uploaded with the craft
      const prod = await Product.findById(productId)
        .populate("vendorId", "businessName category businessAddress verificationStatus")
        .populate("userId", "name avatar")
        .lean();

      if (prod && prod.story && prod.story.mediaUrl) {
        return response.json({
          ok: true,
          story: {
            _id: prod._id,
            productId: prod._id,
            productName: prod.name,
            productPrice: prod.price,
            productImage: prod.images?.[0] || "",
            productCategory: prod.category,
            title: prod.story.title || `Craft Story: ${prod.name}`,
            description: prod.story.description || prod.description,
            media: [
              {
                type: prod.story.mediaType || "video",
                url: prod.story.mediaUrl,
                order: 0,
              },
            ],
            isPublished: true,
            createdAt: prod.createdAt,
            updatedAt: prod.updatedAt,
            artisan: {
              vendorId: prod.vendorId?._id,
              businessName: prod.vendorId?.businessName,
              category: prod.vendorId?.category,
              district: prod.vendorId?.businessAddress?.district,
              name: prod.userId?.name || prod.vendorId?.businessName,
              avatar: prod.userId?.avatar || "",
              verificationStatus: prod.vendorId?.verificationStatus,
            },
          },
        });
      }

      return response.json({ ok: true, story: null });
    }

    return response.json({
      ok: true,
      story: {
        _id: story._id,
        productId: story.productId?._id,
        productName: story.productId?.name,
        productPrice: story.productId?.price,
        productImage: story.productId?.images?.[0] || "",
        productCategory: story.productId?.category,
        title: story.title,
        description: story.description,
        media: (story.media || []).sort((a, b) => (a.order || 0) - (b.order || 0)),
        isPublished: story.isPublished,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        artisan: {
          vendorId: story.vendorId?._id,
          businessName: story.vendorId?.businessName,
          category: story.vendorId?.category,
          district: story.vendorId?.businessAddress?.district,
          name: story.userId?.name || story.vendorId?.businessName,
          avatar: story.userId?.avatar || "",
          verificationStatus: story.vendorId?.verificationStatus,
        },
      },
    });
  } catch (error) {
    console.error("getProductStory error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch product story." });
  }
}

/**
 * GET /api/stories/my-stories
 * Vendor: Retrieve all stories created by the current vendor
 */
export async function getMyStories(request, response) {
  try {
    const vendor = request.vendor;
    if (!vendor) {
      return response.status(403).json({ ok: false, message: "Vendor profile not found." });
    }

    const stories = await ProductStory.find({ vendorId: vendor._id })
      .populate("productId", "name price images category isPublished status quantity")
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = stories.map((s) => ({
      _id: s._id,
      title: s.title,
      description: s.description,
      isPublished: s.isPublished,
      mediaCount: s.media?.length || 0,
      media: (s.media || []).sort((a, b) => (a.order || 0) - (b.order || 0)),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      product: s.productId
        ? {
            _id: s.productId._id,
            name: s.productId.name,
            price: s.productId.price,
            image: s.productId.images?.[0] || "",
            category: s.productId.category,
            isPublished: s.productId.isPublished,
            status: s.productId.status,
          }
        : null,
    }));

    return response.json({
      ok: true,
      stories: formatted,
    });
  } catch (error) {
    console.error("getMyStories error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch stories." });
  }
}

/**
 * POST /api/stories
 * Vendor: Create or update story for a product
 */
export async function createOrUpdateStory(request, response) {
  try {
    const vendor = request.vendor;
    const user = request.user;
    const { productId, title, description, media, isPublished = false } = request.body;

    if (!vendor) {
      return response.status(403).json({ ok: false, message: "Vendor profile required." });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return response.status(400).json({ ok: false, message: "Valid Product ID is required." });
    }

    if (!title || !title.trim()) {
      return response.status(400).json({ ok: false, message: "Story title is required." });
    }

    if (!media || !Array.isArray(media) || media.length === 0) {
      return response.status(400).json({ ok: false, message: "At least one story photo or video is required." });
    }

    // Verify product ownership
    const product = await Product.findOne({
      _id: productId,
      vendorId: vendor._id,
      isDeleted: false,
    });

    if (!product) {
      return response.status(404).json({
        ok: false,
        message: "Product not found or does not belong to your studio.",
      });
    }

    // Process media items (upload any base64 files)
    const processedMedia = await processMediaItems(media);

    if (processedMedia.length === 0) {
      return response.status(400).json({ ok: false, message: "Failed to process media items." });
    }

    // Check if story already exists for this product (upsert pattern)
    let story = await ProductStory.findOne({ productId });

    if (story) {
      // Ensure vendor owns existing story
      if (!story.vendorId.equals(vendor._id)) {
        return response.status(403).json({ ok: false, message: "Not authorized to update this story." });
      }

      story.title = title.trim();
      story.description = (description || "").trim();
      story.media = processedMedia;
      story.isPublished = Boolean(isPublished);
      await story.save();
    } else {
      story = await ProductStory.create({
        vendorId: vendor._id,
        userId: user._id,
        productId,
        title: title.trim(),
        description: (description || "").trim(),
        media: processedMedia,
        isPublished: Boolean(isPublished),
      });
    }

    return response.status(201).json({
      ok: true,
      message: story.isPublished ? "Story published successfully!" : "Story saved as draft.",
      story,
    });
  } catch (error) {
    console.error("createOrUpdateStory error:", error);
    return response.status(500).json({
      ok: false,
      message: error.message || "Failed to save craft story.",
    });
  }
}

/**
 * PUT /api/stories/:storyId
 * Vendor: Update existing story
 */
export async function updateStory(request, response) {
  try {
    const vendor = request.vendor;
    const { storyId } = request.params;
    const { title, description, media, isPublished } = request.body;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return response.status(400).json({ ok: false, message: "Invalid story ID." });
    }

    const story = await ProductStory.findById(storyId);
    if (!story) {
      return response.status(404).json({ ok: false, message: "Story not found." });
    }

    if (!story.vendorId.equals(vendor._id)) {
      return response.status(403).json({ ok: false, message: "Not authorized to modify this story." });
    }

    if (title) story.title = title.trim();
    if (description !== undefined) story.description = (description || "").trim();
    if (isPublished !== undefined) story.isPublished = Boolean(isPublished);

    if (media && Array.isArray(media) && media.length > 0) {
      story.media = await processMediaItems(media);
    }

    await story.save();

    return response.json({
      ok: true,
      message: "Story updated successfully.",
      story,
    });
  } catch (error) {
    console.error("updateStory error:", error);
    return response.status(500).json({ ok: false, message: error.message || "Failed to update story." });
  }
}

/**
 * DELETE /api/stories/:storyId
 * Vendor: Delete a story
 */
export async function deleteStory(request, response) {
  try {
    const vendor = request.vendor;
    const { storyId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return response.status(400).json({ ok: false, message: "Invalid story ID." });
    }

    const story = await ProductStory.findById(storyId);
    if (!story) {
      return response.status(404).json({ ok: false, message: "Story not found." });
    }

    if (!story.vendorId.equals(vendor._id) && request.user.role !== "admin") {
      return response.status(403).json({ ok: false, message: "Not authorized to delete this story." });
    }

    // Clean up Cloudinary assets if any
    for (const item of story.media || []) {
      if (item.publicId) {
        deleteFromCloudinary(item.publicId, item.type).catch(() => {});
      }
    }

    await ProductStory.findByIdAndDelete(storyId);

    return response.json({
      ok: true,
      message: "Craft story deleted successfully.",
    });
  } catch (error) {
    console.error("deleteStory error:", error);
    return response.status(500).json({ ok: false, message: "Failed to delete story." });
  }
}

/**
 * PATCH /api/stories/:storyId/publish
 * Vendor: Toggle published status
 */
export async function togglePublishStory(request, response) {
  try {
    const vendor = request.vendor;
    const { storyId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return response.status(400).json({ ok: false, message: "Invalid story ID." });
    }

    const story = await ProductStory.findById(storyId);
    if (!story) {
      return response.status(404).json({ ok: false, message: "Story not found." });
    }

    if (!story.vendorId.equals(vendor._id) && request.user.role !== "admin") {
      return response.status(403).json({ ok: false, message: "Not authorized." });
    }

    story.isPublished = !story.isPublished;
    await story.save();

    return response.json({
      ok: true,
      isPublished: story.isPublished,
      message: story.isPublished ? "Story published to public catalog." : "Story switched to draft.",
    });
  } catch (error) {
    console.error("togglePublishStory error:", error);
    return response.status(500).json({ ok: false, message: "Failed to toggle story status." });
  }
}
