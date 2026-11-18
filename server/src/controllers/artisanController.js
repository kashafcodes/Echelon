import mongoose from "mongoose";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { formatSingleProduct } from "./productController.js";

/**
 * GET /api/artisans/:vendorId
 * Returns public profile details for an artisan/vendor
 */
export async function getArtisanProfile(request, response) {
  try {
    const { vendorId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return response.status(400).json({ ok: false, message: "Invalid artisan ID." });
    }

    const vendor = await Vendor.findById(vendorId)
      .populate("userId", "name avatar email createdAt")
      .lean();

    if (!vendor) {
      return response.status(404).json({ ok: false, message: "Artisan studio not found." });
    }

    // Count active published products
    const productCount = await Product.countDocuments({
      vendorId: vendor._id,
      isPublished: true,
      isDeleted: false,
      status: "published",
    });

    const formattedProfile = {
      _id: vendor._id,
      userId: vendor.userId?._id,
      artisanName: vendor.userId?.name || vendor.businessName,
      businessName: vendor.businessName,
      description: vendor.description,
      category: vendor.category,
      businessAddress: vendor.businessAddress,
      avatar: vendor.userId?.avatar || "",
      verificationStatus: vendor.verificationStatus,
      isVerified: vendor.verificationStatus === "approved",
      joinedAt: vendor.userId?.createdAt || vendor.createdAt,
      productCount,
    };

    return response.json({
      ok: true,
      artisan: formattedProfile,
    });
  } catch (error) {
    console.error("getArtisanProfile error:", error);
    return response.status(500).json({ ok: false, message: "Failed to retrieve artisan profile." });
  }
}

/**
 * GET /api/artisans/:vendorId/products
 * Returns published products of an artisan with pagination & filtering
 */
export async function getArtisanProducts(request, response) {
  try {
    const { vendorId } = request.params;
    const { page = 1, limit = 12, sort = "newest", category } = request.query;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return response.status(400).json({ ok: false, message: "Invalid artisan ID." });
    }

    const query = {
      vendorId,
      isPublished: true,
      isDeleted: false,
      status: "published",
    };

    if (category && category !== "All") {
      query.category = category;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "price-low") sortOptions = { price: 1 };
    else if (sort === "price-high") sortOptions = { price: -1 };
    else if (sort === "oldest") sortOptions = { createdAt: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("vendorId", "businessName category businessAddress verificationStatus")
        .populate("userId", "name avatar")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    return response.json({
      ok: true,
      products: products.map(formatSingleProduct),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("getArtisanProducts error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch artisan crafts." });
  }
}
