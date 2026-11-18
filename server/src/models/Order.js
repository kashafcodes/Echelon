import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const paymentHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    statusHistory: [statusHistorySchema],
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    country: { type: String, default: "Nepal", trim: true },
    province: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    municipality: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentHistory: [paymentHistorySchema],
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Helper function to calculate overall order status from individual item statuses
export function computeOverallOrderStatus(items = []) {
  if (!items || items.length === 0) return "placed";
  const statuses = items.map((i) => i.orderStatus || "placed");

  // If all are cancelled -> cancelled
  if (statuses.every((s) => s === "cancelled")) return "cancelled";

  // Filter out cancelled items for forward progression (unless all cancelled)
  const active = statuses.filter((s) => s !== "cancelled");
  if (active.length === 0) return "cancelled";

  // If all active are delivered -> delivered
  if (active.every((s) => s === "delivered")) return "delivered";

  // If any active is shipped or delivered -> shipped
  if (active.some((s) => s === "shipped" || s === "delivered")) return "shipped";

  // If any active is processing -> processing
  if (active.some((s) => s === "processing")) return "processing";

  // If all active are confirmed (or any confirmed) -> confirmed
  if (active.some((s) => s === "confirmed")) return "confirmed";

  return "placed";
}

// Auto-generate order number before save
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const ts = Date.now().toString(36).toUpperCase();
    this.orderNumber = `LK-${ts}-${String(count + 1).padStart(4, "0")}`;
  }

  // Also auto-compute overall order status from items if items exist
  if (this.items && this.items.length > 0) {
    this.orderStatus = computeOverallOrderStatus(this.items);
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
