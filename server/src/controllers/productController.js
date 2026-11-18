import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";
import Category from "../models/Category.js";
import { uploadProductImageToCloudinary } from "../utils/cloudinary.js";

// Default categories if database has none seeded
const DEFAULT_CATEGORIES = [
  { name: "Mithila Art", slug: "mithila-art", icon: "🎨", description: "Authentic handmade paintings from Janakpur and Mithila heritage" },
  { name: "Bamboo Crafts", slug: "bamboo-crafts", icon: "🎋", description: "Handwoven sustainable bamboo baskets, furniture, and decor" },
  { name: "Pottery & Clay Work", slug: "pottery-and-clay-work", icon: "🏺", description: "Earthen terracotta pots, traditional lamps, and clay crafts" },
  { name: "Handmade Jewelry", slug: "handmade-jewelry", icon: "💍", description: "Cultural Terai brass, bead, and handcrafted ornaments" },
  { name: "Leaf Crafts", slug: "leaf-crafts", icon: "🍃", description: "Traditional Sikki grass and palm leaf utility woven items" },
  { name: "Handmade Decor", slug: "handmade-decor", icon: "🪔", description: "Heritage wall hangings, bells, and handmade interior artifacts" },
  { name: "Paintings and Sketches", slug: "paintings-and-sketches", icon: "🖌️", description: "Folk art, sketch portraits, and Terai storytelling canvases" },
  { name: "Traditional Crafts", slug: "traditional-crafts", icon: "🧵", description: "Indigenous tools, musical instruments, and cultural gear" },
  { name: "Crochet & Weaving", slug: "crochet-and-weaving", icon: "🧶", description: "Hand-knitted textiles, woolen garments, and macrame crafts" },
  { name: "Custom Creations", slug: "custom-creations", icon: "✨", description: "Personalized artisanal pieces made to order by local masters" },
];

/**
 * ==========================================
 * PUBLIC PRODUCT APIS
 * ==========================================
 */

/**
 * GET /api/categories
 * Returns active categories with product counts
 */
export async function getCategories(_request, response) {
  try {
    let categories = await Category.find({ isActive: true }).lean();

    if (!categories || categories.length === 0) {
      // Seed default categories
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find({ isActive: true }).lean();
    }

    // Get count of published products per category
    const counts = await Product.aggregate([
      { $match: { isPublished: true, isDeleted: false, status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat.name] || 0,
    }));

    return response.json({
      ok: true,
      categories: enriched,
    });
  } catch (error) {
    console.error("getCategories error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to load categories.",
      categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, productCount: 0 })),
    });
  }
}

/**
 * GET /api/products
 * Public list of published products with filters, search, pagination, and sorting
 */
export async function getProducts(request, response) {
  try {
    const {
      search = "",
      category = "",
      minPrice,
      maxPrice,
      origin = "",
      availability = "",
      sort = "newest",
      page = 1,
      limit = 12,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Base filter: only published, non-deleted products
    const query = {
      isPublished: true,
      isDeleted: false,
      status: "published",
    };

    // Category filter
    if (category && category !== "All" && category.trim()) {
      query.category = new RegExp(`^${category.trim()}$`, "i");
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        const min = Number(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        const max = Number(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // Origin filter
    if (origin && origin.trim()) {
      query.origin = new RegExp(origin.trim(), "i");
    }

    // Availability filter
    if (availability === "in-stock") {
      query.quantity = { $gt: 0 };
    }

    // Search query: search name, description, category, materials, tags, origin
    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, "i");
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { origin: regex },
        { craftingMethod: regex },
        { materials: regex },
        { tags: regex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "popular") {
      sortOption = { featured: -1, createdAt: -1 };
    }

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate("vendorId", "businessName category businessAddress verificationStatus")
        .populate("userId", "name avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Format products for clean presentation
    const formattedProducts = products.map((p) => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      images: p.images || [],
      quantity: p.quantity,
      stockStatus: p.stockStatus || (p.quantity > 5 ? "In Stock" : p.quantity > 0 ? "Low Stock" : "Out of Stock"),
      materials: p.materials || [],
      craftingMethod: p.craftingMethod || "",
      dimensions: p.dimensions || "",
      weight: p.weight,
      customizationAvailable: p.customizationAvailable || false,
      origin: p.origin || "Parsa, Terai, Nepal",
      tags: p.tags || [],
      originalName: p.originalName || "",
      originalDescription: p.originalDescription || "",
      originalLanguage: p.originalLanguage || "en",
      translations: p.translations || {},
      featured: p.featured || false,
      createdAt: p.createdAt,
      vendor: p.vendorId
        ? {
            id: p.vendorId._id,
            businessName: p.vendorId.businessName,
            category: p.vendorId.category,
            district: p.vendorId.businessAddress?.district,
          }
        : null,
      artisanName: p.userId?.name || p.vendorId?.businessName || "Local Artisan",
      artisanAvatar: p.userId?.avatar || "",
    }));

    return response.json({
      ok: true,
      products: formattedProducts,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum) || 1,
      limit: limitNum,
    });
  } catch (error) {
    console.error("getProducts error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to fetch products.",
      products: [],
      total: 0,
    });
  }
}

/**
 * GET /api/products/featured
 * Returns eligible featured products
 */
export async function getFeaturedProducts(_request, response) {
  try {
    const products = await Product.find({
      isPublished: true,
      isDeleted: false,
      status: "published",
      quantity: { $gt: 0 },
    })
      .populate("vendorId", "businessName category businessAddress")
      .populate("userId", "name avatar")
      .sort({ featured: -1, createdAt: -1 })
      .limit(8)
      .lean();

    return response.json({
      ok: true,
      products: products.map(formatSingleProduct),
    });
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    return response.status(500).json({ ok: false, products: [] });
  }
}

/**
 * GET /api/products/random
 * Returns a randomized set of in-stock, published products without duplicates
 */
export async function getRandomProducts(request, response) {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(request.query.limit, 10) || 6));
    const excludeId = request.query.excludeId;

    const matchStage = {
      isPublished: true,
      isDeleted: false,
      status: "published",
      quantity: { $gt: 0 },
    };

    if (excludeId) {
      try {
        matchStage._id = { $ne: new Product.base.Types.ObjectId(excludeId) };
      } catch (_) {}
    }

    const randomDocs = await Product.aggregate([
      { $match: matchStage },
      { $sample: { size: limit } },
    ]);

    // Populate vendor and user info
    const populated = await Product.populate(randomDocs, [
      { path: "vendorId", select: "businessName category businessAddress" },
      { path: "userId", select: "name avatar" },
    ]);

    return response.json({
      ok: true,
      products: populated.map(formatSingleProduct),
    });
  } catch (error) {
    console.error("getRandomProducts error:", error);
    return response.status(500).json({ ok: false, products: [] });
  }
}

/**
 * GET /api/products/:id
 * Returns a single product's detail (only if published or if owner)
 */
export async function getProductById(request, response) {
  try {
    const { id } = request.params;
    const product = await Product.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("vendorId", "businessName description category businessAddress verificationStatus createdAt")
      .populate("userId", "name phone email avatar")
      .lean();

    if (!product) {
      return response.status(404).json({
        ok: false,
        message: "Product not found.",
      });
    }

    // Check visibility if not published
    if (!product.isPublished || product.status !== "published") {
      // If user is authenticated and is the product owner or admin, allow viewing
      const currentUser = request.user;
      const isOwner = currentUser && (currentUser._id.toString() === product.userId._id.toString() || currentUser.role === "admin");
      if (!isOwner) {
        return response.status(404).json({
          ok: false,
          message: "Product not found or is currently private.",
        });
      }
    }

    return response.json({
      ok: true,
      product: formatSingleProduct(product),
    });
  } catch (error) {
    console.error("getProductById error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch product details." });
  }
}

/**
 * ==========================================
 * VENDOR PRODUCT APIS (Authenticated Vendor)
 * ==========================================
 */

/**
 * POST /api/vendor/products
 * Vendor creates a new product
 */
export async function createVendorProduct(request, response) {
  try {
    const user = request.user;
    const vendor = request.vendor;

    if (!vendor) {
      return response.status(403).json({
        ok: false,
        message: "You must have an artisan vendor profile to list products.",
      });
    }

    const {
      name,
      description,
      price,
      category,
      images,
      quantity,
      materials,
      craftingMethod,
      dimensions,
      weight,
      customizationAvailable,
      origin,
      tags,
      originalName,
      originalDescription,
      originalLanguage,
      translations,
    } = request.body;

    // Validations
    if (!name || !name.trim()) {
      return response.status(400).json({ ok: false, message: "Product name is required." });
    }
    if (!description || !description.trim()) {
      return response.status(400).json({ ok: false, message: "Product description is required." });
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return response.status(400).json({ ok: false, message: "Price must be greater than 0." });
    }
    if (!category || !category.trim()) {
      return response.status(400).json({ ok: false, message: "Category is required." });
    }
    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 0) {
      return response.status(400).json({ ok: false, message: "Available quantity cannot be negative." });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return response.status(400).json({ ok: false, message: "At least one product image is required." });
    }

    // Process images: upload base64 images to Cloudinary if needed
    const processedImages = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (typeof img === "string" && img.startsWith("data:")) {
        try {
          const cloudRes = await uploadProductImageToCloudinary(img);
          processedImages.push(cloudRes.secure_url);
        } catch (uploadErr) {
          console.warn("[Product Upload] Cloudinary image upload error:", uploadErr.message);
          // If cloudinary is not configured in local dev, preserve image or use fallback
          processedImages.push(img);
        }
      } else if (typeof img === "string" && img.trim()) {
        processedImages.push(img.trim());
      }
    }

    if (processedImages.length === 0) {
      return response.status(400).json({ ok: false, message: "At least one valid image is required." });
    }

    // Auto-publish policy: if vendor is approved, publish immediately; otherwise pending
    const isVendorApproved = vendor.verificationStatus === "approved";
    const status = isVendorApproved ? "published" : "pending";
    const isPublished = isVendorApproved;

    const newProduct = new Product({
      vendorId: vendor._id,
      userId: user._id,
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      images: processedImages,
      quantity: numQty,
      materials: Array.isArray(materials) ? materials : typeof materials === "string" ? materials.split(",").map((m) => m.trim()).filter(Boolean) : [],
      craftingMethod: craftingMethod?.trim() || "",
      dimensions: dimensions?.trim() || "",
      weight: Number(weight) || null,
      customizationAvailable: Boolean(customizationAvailable),
      origin: origin?.trim() || (vendor.businessAddress?.district ? `${vendor.businessAddress.district}, Terai, Nepal` : "Parsa, Terai, Nepal"),
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      originalName: originalName?.trim() || "",
      originalDescription: originalDescription?.trim() || "",
      originalLanguage: originalLanguage?.trim() || "en",
      translations: translations && typeof translations === "object" ? translations : {},
      status,
      isPublished,
    });

    await newProduct.save();

    return response.status(201).json({
      ok: true,
      message: isVendorApproved
        ? "Product created and published successfully!"
        : "Product submitted for review! It will be published once your studio is verified.",
      product: newProduct,
    });
  } catch (error) {
    console.error("createVendorProduct error:", error);
    return response.status(500).json({
      ok: false,
      message: error.message || "Failed to create product.",
    });
  }
}

/**
 * GET /api/vendor/products
 * Fetch products belonging strictly to the logged-in vendor
 */
export async function getVendorProducts(request, response) {
  try {
    const vendor = request.vendor;
    if (!vendor) {
      return response.status(403).json({ ok: false, message: "Vendor profile required." });
    }

    const products = await Product.find({
      vendorId: vendor._id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return response.json({
      ok: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("getVendorProducts error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch vendor products." });
  }
}

/**
 * GET /api/vendor/products/:id
 * Get one specific product owned by the logged-in vendor
 */
export async function getVendorProductById(request, response) {
  try {
    const vendor = request.vendor;
    const { id } = request.params;

    const product = await Product.findOne({
      _id: id,
      vendorId: vendor._id,
      isDeleted: false,
    }).lean();

    if (!product) {
      return response.status(404).json({
        ok: false,
        message: "Product not found in your studio inventory.",
      });
    }

    return response.json({
      ok: true,
      product,
    });
  } catch (error) {
    console.error("getVendorProductById error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch product." });
  }
}

/**
 * PUT /api/vendor/products/:id
 * Update product owned by the vendor
 */
export async function updateVendorProduct(request, response) {
  try {
    const vendor = request.vendor;
    const { id } = request.params;

    const product = await Product.findOne({
      _id: id,
      vendorId: vendor._id,
      isDeleted: false,
    });

    if (!product) {
      return response.status(404).json({ ok: false, message: "Product not found in your inventory." });
    }

    const {
      name,
      description,
      price,
      category,
      images,
      quantity,
      materials,
      craftingMethod,
      dimensions,
      weight,
      customizationAvailable,
      origin,
      tags,
      originalName,
      originalDescription,
      originalLanguage,
      translations,
    } = request.body;

    if (name && name.trim()) product.name = name.trim();
    if (description && description.trim()) product.description = description.trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (numPrice <= 0) {
        return response.status(400).json({ ok: false, message: "Price must be greater than 0." });
      }
      product.price = numPrice;
    }
    if (category && category.trim()) product.category = category.trim();

    if (quantity !== undefined) {
      const numQty = parseInt(quantity, 10);
      if (numQty < 0) {
        return response.status(400).json({ ok: false, message: "Quantity cannot be negative." });
      }
      product.quantity = numQty;
    }

    // Process image updates if supplied
    if (images && Array.isArray(images) && images.length > 0) {
      const processedImages = [];
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:")) {
          try {
            const cloudRes = await uploadProductImageToCloudinary(img);
            processedImages.push(cloudRes.secure_url);
          } catch (uploadErr) {
            console.warn("[Update Product] Cloudinary error:", uploadErr.message);
            processedImages.push(img);
          }
        } else if (typeof img === "string" && img.trim()) {
          processedImages.push(img.trim());
        }
      }
      if (processedImages.length > 0) {
        product.images = processedImages;
      }
    }

    if (materials !== undefined) {
      product.materials = Array.isArray(materials) ? materials : typeof materials === "string" ? materials.split(",").map((m) => m.trim()).filter(Boolean) : [];
    }
    if (craftingMethod !== undefined) product.craftingMethod = craftingMethod.trim();
    if (dimensions !== undefined) product.dimensions = dimensions.trim();
    if (weight !== undefined) product.weight = Number(weight) || null;
    if (customizationAvailable !== undefined) product.customizationAvailable = Boolean(customizationAvailable);
    if (origin !== undefined) product.origin = origin.trim();
    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    }
    if (originalName !== undefined) product.originalName = originalName.trim();
    if (originalDescription !== undefined) product.originalDescription = originalDescription.trim();
    if (originalLanguage !== undefined) product.originalLanguage = originalLanguage.trim();
    if (translations !== undefined && typeof translations === "object") product.translations = translations;

    await product.save();

    return response.json({
      ok: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("updateVendorProduct error:", error);
    return response.status(500).json({ ok: false, message: error.message || "Failed to update product." });
  }
}

/**
 * PATCH /api/vendor/products/:id/publish
 * Toggle publish / unpublish status for an approved product
 */
export async function togglePublishProduct(request, response) {
  try {
    const vendor = request.vendor;
    const { id } = request.params;

    const product = await Product.findOne({
      _id: id,
      vendorId: vendor._id,
      isDeleted: false,
    });

    if (!product) {
      return response.status(404).json({ ok: false, message: "Product not found." });
    }

    if (vendor.verificationStatus !== "approved") {
      return response.status(403).json({
        ok: false,
        message: "Your studio must be verified and approved by LokArt admin before products can be published.",
      });
    }

    // Toggle publish status
    product.isPublished = !product.isPublished;
    product.status = product.isPublished ? "published" : "unpublished";
    await product.save();

    return response.json({
      ok: true,
      message: product.isPublished
        ? "Product is now published and live on the LokArt marketplace!"
        : "Product has been unpublished and hidden from the public store.",
      isPublished: product.isPublished,
      status: product.status,
      product,
    });
  } catch (error) {
    console.error("togglePublishProduct error:", error);
    return response.status(500).json({ ok: false, message: "Failed to update product publication state." });
  }
}

/**
 * DELETE /api/vendor/products/:id
 * Safe soft-delete / archive of a product
 */
export async function deleteVendorProduct(request, response) {
  try {
    const vendor = request.vendor;
    const { id } = request.params;

    const product = await Product.findOne({
      _id: id,
      vendorId: vendor._id,
      isDeleted: false,
    });

    if (!product) {
      return response.status(404).json({ ok: false, message: "Product not found." });
    }

    // Soft delete to safeguard order history
    product.isDeleted = true;
    product.isPublished = false;
    product.status = "unpublished";
    await product.save();

    return response.json({
      ok: true,
      message: "Product has been deleted successfully from your studio.",
    });
  } catch (error) {
    console.error("deleteVendorProduct error:", error);
    return response.status(500).json({ ok: false, message: "Failed to delete product." });
  }
}

/**
 * ==========================================
 * ADMIN PRODUCT APIS (Authenticated Admin)
 * ==========================================
 */

/**
 * GET /api/admin/products/pending
 * View all products awaiting approval
 */
export async function getAdminPendingProducts(_request, response) {
  try {
    const products = await Product.find({
      status: "pending",
      isDeleted: false,
    })
      .populate("vendorId", "businessName category businessAddress verificationStatus")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return response.json({
      ok: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("getAdminPendingProducts error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch pending products." });
  }
}

/**
 * PATCH /api/admin/products/:id/approve
 * Admin approves product for publishing
 */
export async function approveProduct(request, response) {
  try {
    const { id } = request.params;
    const product = await Product.findOne({ _id: id, isDeleted: false });

    if (!product) {
      return response.status(404).json({ ok: false, message: "Product not found." });
    }

    product.status = "published";
    product.isPublished = true;
    product.rejectionReason = "";
    await product.save();

    return response.json({
      ok: true,
      message: `Product '${product.name}' has been approved and published!`,
      product,
    });
  } catch (error) {
    console.error("approveProduct error:", error);
    return response.status(500).json({ ok: false, message: "Failed to approve product." });
  }
}

/**
 * PATCH /api/admin/products/:id/reject
 * Admin rejects product with reason
 */
export async function rejectProduct(request, response) {
  try {
    const { id } = request.params;
    const { reason } = request.body;

    if (!reason || !reason.trim()) {
      return response.status(400).json({ ok: false, message: "Rejection reason is required." });
    }

    const product = await Product.findOne({ _id: id, isDeleted: false });

    if (!product) {
      return response.status(404).json({ ok: false, message: "Product not found." });
    }

    product.status = "rejected";
    product.isPublished = false;
    product.rejectionReason = reason.trim();
    await product.save();

    return response.json({
      ok: true,
      message: `Product '${product.name}' has been rejected.`,
      product,
    });
  } catch (error) {
    console.error("rejectProduct error:", error);
    return response.status(500).json({ ok: false, message: "Failed to reject product." });
  }
}

/**
 * GET /api/products/by-vendor/:vendorId
 * Returns published products belonging to a specific vendor,
 * optionally excluding a product (for "more from this vendor" on detail pages).
 */
export async function getProductsByVendor(request, response) {
  try {
    const { vendorId } = request.params;
    const { excludeId, limit = 8 } = request.query;

    const query = {
      vendorId,
      isPublished: true,
      isDeleted: false,
      status: "published",
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const products = await Product.find(query)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return response.json({
      ok: true,
      products: products.map(formatSingleProduct),
    });
  } catch (error) {
    console.error("getProductsByVendor error:", error);
    return response.status(500).json({ ok: false, products: [], message: "Failed to fetch vendor products." });
  }
}

/**
 * Helper to format a single product for API output
 */
function formatSingleProduct(p) {
  return {
    _id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images || [],
    quantity: p.quantity,
    stockStatus: p.stockStatus || (p.quantity > 5 ? "In Stock" : p.quantity > 0 ? "Low Stock" : "Out of Stock"),
    materials: p.materials || [],
    craftingMethod: p.craftingMethod || "",
    dimensions: p.dimensions || "",
    weight: p.weight,
    customizationAvailable: p.customizationAvailable || false,
    origin: p.origin || "Parsa, Terai, Nepal",
    tags: p.tags || [],
    originalName: p.originalName || "",
    originalDescription: p.originalDescription || "",
    originalLanguage: p.originalLanguage || "en",
    translations: p.translations || {},
    featured: p.featured || false,
    isPublished: p.isPublished,
    status: p.status,
    rejectionReason: p.rejectionReason || "",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    vendor: p.vendorId
      ? {
          id: p.vendorId._id,
          businessName: p.vendorId.businessName,
          category: p.vendorId.category,
          district: p.vendorId.businessAddress?.district,
          description: p.vendorId.description,
          verificationStatus: p.vendorId.verificationStatus,
        }
      : null,
    artisanName: p.userId?.name || p.vendorId?.businessName || "Local Artisan",
    artisanAvatar: p.userId?.avatar || "",
  };
}
