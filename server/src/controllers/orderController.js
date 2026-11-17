import Product from "../models/Product.js";
import Order from "../models/Order.js";

/**
 * POST /api/orders
 * Place a new order. Validates items, recalculates prices server-side, deducts inventory.
 * Body: { items: [{ productId, quantity }], deliveryAddress: { fullName, phone, country,
 *         province, district, municipality, ward, street, landmark }, paymentMethod: "COD" }
 */
export async function placeOrder(request, response) {
  try {
    const user = request.user;

    // 1. Validate authentication and role
    if (!user) {
      return response.status(401).json({ ok: false, message: "Authentication required." });
    }
    if (user.role !== "customer" && user.role !== "admin") {
      return response.status(403).json({ ok: false, message: "Only customers can place orders." });
    }

    const { items, deliveryAddress, paymentMethod = "COD", notes = "" } = request.body;

    // 2. Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ ok: false, message: "Order must contain at least one item." });
    }

    // 4. Validate deliveryAddress fields
    const requiredAddrFields = ["fullName", "phone", "province", "district", "municipality", "ward", "street"];
    for (const field of requiredAddrFields) {
      if (!deliveryAddress || !deliveryAddress[field] || !String(deliveryAddress[field]).trim()) {
        return response.status(400).json({
          ok: false,
          message: `Delivery address field '${field}' is required.`,
        });
      }
    }

    // 3. Build order items — validate stock and fetch prices from DB
    const orderItems = [];
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || Number(quantity) < 1) {
        return response.status(400).json({ ok: false, message: "Each item must have a valid productId and quantity." });
      }

      const qty = Number(quantity);

      // 3a. Fetch product — must be published and not deleted
      const product = await Product.findOne({
        _id: productId,
        isPublished: true,
        isDeleted: false,
        status: "published",
      });

      if (!product) {
        return response.status(400).json({
          ok: false,
          message: `Product not found or is unavailable.`,
        });
      }

      // 3b. Check stock
      if (product.quantity < qty) {
        return response.status(400).json({
          ok: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${qty}.`,
        });
      }

      // 3c. Build order item with server-side pricing
      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        productName: product.name,
        productImage: product.images?.[0] || "",
        quantity: qty,
        unitPrice: product.price,
        subtotal: product.price * qty,
      });
    }

    // 5. Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    // 6. Create and save the order document
    const order = new Order({
      customerId: user._id,
      items: orderItems,
      deliveryAddress: {
        fullName:     deliveryAddress.fullName.trim(),
        phone:        deliveryAddress.phone.trim(),
        country:      deliveryAddress.country?.trim() || "Nepal",
        province:     deliveryAddress.province.trim(),
        district:     deliveryAddress.district.trim(),
        municipality: deliveryAddress.municipality.trim(),
        ward:         deliveryAddress.ward.trim(),
        street:       deliveryAddress.street.trim(),
        landmark:     deliveryAddress.landmark?.trim() || "",
      },
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: "COD",
      notes: notes?.trim() || "",
    });

    await order.save();

    // 7. Deduct inventory for each item (after successful save)
    await Promise.all(
      orderItems.map(async ({ productId, quantity }) => {
        const updated = await Product.findByIdAndUpdate(
          productId,
          { $inc: { quantity: -quantity } },
          { new: true }
        );
        if (updated) {
          let newStockStatus;
          if (updated.quantity === 0) {
            newStockStatus = "Out of Stock";
          } else if (updated.quantity <= 5) {
            newStockStatus = "Low Stock";
          } else {
            newStockStatus = "In Stock";
          }
          await Product.findByIdAndUpdate(productId, { stockStatus: newStockStatus });
        }
      })
    );

    // 8. Return created order
    return response.status(201).json({
      ok: true,
      order: {
        _id:             order._id,
        orderNumber:     order.orderNumber,
        items:           order.items,
        deliveryAddress: order.deliveryAddress,
        subtotal:        order.subtotal,
        deliveryFee:     order.deliveryFee,
        totalAmount:     order.totalAmount,
        paymentMethod:   order.paymentMethod,
        paymentStatus:   order.paymentStatus,
        orderStatus:     order.orderStatus,
        createdAt:       order.createdAt,
      },
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    return response.status(500).json({ ok: false, message: error.message || "Failed to place order." });
  }
}

/**
 * GET /api/orders/my
 * Customer's own order history, sorted newest first.
 */
export async function getMyOrders(request, response) {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ ok: false, message: "Authentication required." });
    }

    const orders = await Order.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return response.json({ ok: true, orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch orders." });
  }
}

/**
 * GET /api/orders/:id
 * Get one order by ID. Customer must own it, or requester must be admin.
 */
export async function getOrderById(request, response) {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ ok: false, message: "Authentication required." });
    }

    const { id } = request.params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return response.status(404).json({ ok: false, message: "Order not found." });
    }

    // Authorization: must be the customer who placed it, or an admin
    if (order.customerId.toString() !== user._id.toString() && user.role !== "admin") {
      return response.status(403).json({ ok: false, message: "Access denied." });
    }

    return response.json({ ok: true, order });
  } catch (error) {
    console.error("getOrderById error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch order." });
  }
}
