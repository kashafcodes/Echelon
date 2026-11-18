import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
      index: "text",
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
      index: "text",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "At least one product image is required",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 1,
    },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    materials: {
      type: [String],
      default: [],
    },
    craftingMethod: {
      type: String,
      trim: true,
      default: "",
    },
    dimensions: {
      type: String,
      trim: true,
      default: "",
    },
    weight: {
      type: Number,
      min: 0,
      default: null,
    },
    customizationAvailable: {
      type: Boolean,
      default: false,
    },
    origin: {
      type: String,
      trim: true,
      default: "Parsa, Terai, Nepal",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "unpublished", "rejected"],
      default: "pending",
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    originalName: {
      type: String,
      trim: true,
      default: "",
    },
    originalDescription: {
      type: String,
      trim: true,
      default: "",
    },
    originalLanguage: {
      type: String,
      trim: true,
      default: "en",
    },
    translations: {
      en: {
        name: { type: String, trim: true, default: "" },
        description: { type: String, trim: true, default: "" },
      },
    },
    story: {
      mediaType: {
        type: String,
        enum: ["video", "image"],
        default: "video",
      },
      mediaUrl: {
        type: String,
        default: "",
      },
      title: {
        type: String,
        trim: true,
        default: "",
      },
      description: {
        type: String,
        trim: true,
        default: "",
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to automatically compute stockStatus based on quantity
productSchema.pre("save", function () {
  if (this.quantity === 0) {
    this.stockStatus = "Out of Stock";
  } else if (this.quantity <= 5) {
    this.stockStatus = "Low Stock";
  } else {
    this.stockStatus = "In Stock";
  }
});

// Text index for full search capability (supports English and original language search)
productSchema.index({
  name: "text",
  description: "text",
  originalName: "text",
  originalDescription: "text",
  category: "text",
  origin: "text",
  materials: "text",
  tags: "text",
});

const Product = mongoose.model("Product", productSchema);
export default Product;
