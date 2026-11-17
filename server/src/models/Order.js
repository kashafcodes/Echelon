import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  vendorId:     { type: mongoose.Schema.Types.ObjectId, ref: "Vendor",  required: true },
  productName:  { type: String, required: true },
  productImage: { type: String, default: "" },
  quantity:     { type: Number, required: true, min: 1 },
  unitPrice:    { type: Number, required: true, min: 0 },
  subtotal:     { type: Number, required: true, min: 0 },
}, { _id: false });

const deliveryAddressSchema = new mongoose.Schema({
  fullName:     { type: String, required: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  country:      { type: String, default: "Nepal", trim: true },
  province:     { type: String, required: true, trim: true },
  district:     { type: String, required: true, trim: true },
  municipality: { type: String, required: true, trim: true },
  ward:         { type: String, required: true, trim: true },
  street:       { type: String, required: true, trim: true },
  landmark:     { type: String, default: "", trim: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber:     { type: String, unique: true },
  customerId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items:           { type: [orderItemSchema], required: true },
  deliveryAddress: { type: deliveryAddressSchema, required: true },
  subtotal:        { type: Number, required: true, min: 0 },
  deliveryFee:     { type: Number, default: 0 },
  totalAmount:     { type: Number, required: true, min: 0 },
  paymentMethod:   { type: String, enum: ["COD"], default: "COD" },
  paymentStatus:   { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  orderStatus:     { type: String, enum: ["placed","confirmed","processing","shipped","delivered","cancelled"], default: "placed" },
  notes:           { type: String, default: "" },
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre("save", async function() {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const ts = Date.now().toString(36).toUpperCase();
    this.orderNumber = `LK-${ts}-${String(count + 1).padStart(4, "0")}`;
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
