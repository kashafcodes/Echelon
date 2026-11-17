import mongoose from "mongoose";
import { addressSchema } from "./User.js";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Associated User ID is required"],
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "Business / Shop name is required"],
      trim: true,
      minlength: [2, "Business name must be at least 2 characters"],
      maxlength: [150, "Business name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Business description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    businessAddress: {
      type: addressSchema,
      required: [true, "Business address is required"],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
