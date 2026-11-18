import mongoose from "mongoose";

const mediaItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
    },
    publicId: {
      type: String, // Cloudinary public_id for deletion
    },
    thumbnail: {
      type: String, // Video thumbnail URL (optional)
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const productStorySchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
      unique: true, // One story per product
    },
    title: {
      type: String,
      required: [true, "Story title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    media: {
      type: [mediaItemSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one media item is required",
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const ProductStory = mongoose.model("ProductStory", productStorySchema);

export default ProductStory;
