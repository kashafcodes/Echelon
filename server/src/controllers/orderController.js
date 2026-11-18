import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order, { computeOverallOrderStatus } from "../models/Order.js";
import Vendor from "../models/Vendor.js";
import CommissionSetting from "../models/CommissionSetting.js";

/**
 * Valid Status Transitions for Vendors/Admins
 */
const ALLOWED_TRANSITIONS = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"], // Shipped cannot be cancelled or moved back
  delivered: [], // Terminal status
  cancelled: [], // Terminal status
};

/**
 * POST /api/orders
 * Public / Customer creates order
 */
export async function placeOrder(request, response) {
  try {
    const user = request.user;

    if (!user) {
      return response.status(401).json({ ok: false, message: "Authentication required." });
    }
    if (user.role !== "customer" && user.role !== "admin") {
      return response.status(403).json({ ok: false, message: "Only customers can place orders." });
    }

    const { items, deliveryAddress, paymentMethod = "COD", notes = "" } = request.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ ok: false, message: "Order must contain at least one item." });
    }

    const requiredAddrFields = ["fullName", "phone", "province", "district", "municipality", "ward", "street"];
    for (const field of requiredAddrFields) {
      if (!deliveryAddress || !deliveryAddress[field] || !String(deliveryAddress[field]).trim()) {
        return response.status(400).json({
          ok: false,
          message: `Delivery address field '${field}' is required.`,
        });
      }
    }

    // Retrieve active global commission setting for order item snapshot
    const commissionSetting = await CommissionSetting.getSettings();
    const effectiveCommissionRate = commissionSetting.isEnabled
      ? Number(commissionSetting.percentage) || 0
      : 0;

    const orderItems = [];
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || Number(quantity) < 1) {
        return response.status(400).json({ ok: false, message: "Each item must have a valid productId and quantity." });
      }

      const qty = Number(quantity);

      const product = await Product.findOne({
        _id: productId,
        isPublished: true,
        isDeleted: false,
        status: "published",
      });

      if (!product) {
        return response.status(400).json({
          ok: false,
          message: `Product not found or is currently unavailable.`,
        });
      }

      if (product.quantity < qty) {
        return response.status(400).json({
          ok: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${qty}.`,
        });
      }

      const itemSubtotal = product.price * qty;
      const itemCommission = Math.round(((itemSubtotal * effectiveCommissionRate) / 100) * 100) / 100;
      const itemVendorEarning = Math.round((itemSubtotal - itemCommission) * 100) / 100;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        productName: product.name,
        productImage: product.images?.[0] || "",
        quantity: qty,
        unitPrice: product.price,
        subtotal: itemSubtotal,
        commissionPercentage: effectiveCommissionRate,
        commissionAmount: itemCommission,
        vendorEarning: itemVendorEarning,
        orderStatus: "placed",
        statusHistory: [
          {
            status: "placed",
            updatedAt: new Date(),
            updatedBy: user._id,
            note: "Order placed by customer via Cash on Delivery",
          },
        ],
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    const order = new Order({
      customerId: user._id,
      items: orderItems,
      deliveryAddress: {
        fullName: deliveryAddress.fullName.trim(),
        phone: deliveryAddress.phone.trim(),
        country: deliveryAddress.country?.trim() || "Nepal",
        province: deliveryAddress.province.trim(),
        district: deliveryAddress.district.trim(),
        municipality: deliveryAddress.municipality.trim(),
        ward: deliveryAddress.ward.trim(),
        street: deliveryAddress.street.trim(),
        landmark: deliveryAddress.landmark?.trim() || "",
      },
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "pending",
      paymentHistory: [
        {
          status: "pending",
          updatedAt: new Date(),
          updatedBy: user._id,
          note: "Pending Cash on Delivery confirmation upon arrival",
        },
      ],
      orderStatus: "placed",
      notes: notes?.trim() || "",
    });

    await order.save();

    // Deduct stock from products
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

    return response.status(201).json({
      ok: true,
      order,
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    return response.status(500).json({ ok: false, message: error.message || "Failed to place order." });
  }
}

/**
 * GET /api/orders/my
 * Customer views their own orders with multi-vendor item tracking
 */
export async function getMyOrders(request, response) {
  try {
    const user = request.user;
    if (!user) {
      return response.status(401).json({ ok: false, message: "Authentication required." });
    }

    const orders = await Order.find({ customerId: user._id })
      .populate("items.vendorId", "businessName category businessAddress")
      .sort({ createdAt: -1 })
      .lean();

    return response.json({ ok: true, orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch customer orders." });
  }
}

/**
 * GET /api/orders/:id
 * Detailed order view (Customer who placed it, Vendor with items in it, or Admin)
 */
export async function getOrderById(request, response) {
  try {
    const user = request.user;
    const { id } = request.params;

    const order = await Order.findById(id)
      .populate("customerId", "name email phone avatar")
      .populate("items.vendorId", "businessName category businessAddress")
      .lean();

    if (!order) {
      return response.status(404).json({ ok: false, message: "Order not found." });
    }

    // Role-based visibility check
    const isCustomerOwner = order.customerId?._id?.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    let isVendorParticipant = false;

    if (user.role === "vendor") {
      const vendorDoc = await Vendor.findOne({ userId: user._id });
      if (vendorDoc) {
        isVendorParticipant = order.items.some(
          (item) => item.vendorId?._id?.toString() === vendorDoc._id.toString() ||
                    item.vendorId?.toString() === vendorDoc._id.toString()
        );
      }
    }

    if (!isCustomerOwner && !isAdmin && !isVendorParticipant) {
      return response.status(403).json({ ok: false, message: "Access denied to this order." });
    }

    return response.json({ ok: true, order });
  } catch (error) {
    console.error("getOrderById error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch order details." });
  }
}

/**
 * PATCH /api/orders/:id/cancel
 * Customer cancels their own order or an item if still placed/confirmed
 */
export async function cancelOrderByCustomer(request, response) {
  try {
    const user = request.user;
    const { id } = request.params;
    const { itemId, reason = "Cancelled by customer" } = request.body;

    const order = await Order.findOne({ _id: id, customerId: user._id });
    if (!order) {
      return response.status(404).json({ ok: false, message: "Order not found." });
    }

    if (itemId) {
      // Cancel a specific item
      const item = order.items.id(itemId);
      if (!item) {
        return response.status(404).json({ ok: false, message: "Order item not found." });
      }

      if (!["placed", "confirmed"].includes(item.orderStatus)) {
        return response.status(400).json({
          ok: false,
          message: `Cannot cancel item in '${item.orderStatus}' status. It has already progressed to fulfillment.`,
        });
      }

      item.orderStatus = "cancelled";
      item.cancellationReason = reason.trim();
      item.statusHistory.push({
        status: "cancelled",
        updatedAt: new Date(),
        updatedBy: user._id,
        note: `Cancelled by customer: ${reason.trim()}`,
      });

      // Restore product inventory
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity },
      });
    } else {
      // Cancel whole order
      if (!["placed", "confirmed"].includes(order.orderStatus)) {
        return response.status(400).json({
          ok: false,
          message: `Order cannot be cancelled in '${order.orderStatus}' status.`,
        });
      }

      for (const item of order.items) {
        if (["placed", "confirmed"].includes(item.orderStatus)) {
          item.orderStatus = "cancelled";
          item.cancellationReason = reason.trim();
          item.statusHistory.push({
            status: "cancelled",
            updatedAt: new Date(),
            updatedBy: user._id,
            note: `Order cancelled by customer: ${reason.trim()}`,
          });

          await Product.findByIdAndUpdate(item.productId, {
            $inc: { quantity: item.quantity },
          });
        }
      }

      order.cancellationReason = reason.trim();
    }

    order.orderStatus = computeOverallOrderStatus(order.items);
    await order.save();

    return response.json({
      ok: true,
      message: "Cancellation request processed successfully.",
      order,
    });
  } catch (error) {
    console.error("cancelOrderByCustomer error:", error);
    return response.status(500).json({ ok: false, message: "Failed to process cancellation." });
  }
}

/**
 * =========================================================================
 * VENDOR ORDER APIS
 * =========================================================================
 */

/**
 * GET /api/orders/vendor/orders
 * Returns all orders containing products belonging to the logged-in vendor.
 * Supports filtering by status, search by orderNumber, sorting, and pagination.
 */
export async function getVendorOrders(request, response) {
  try {
    const user = request.user;
    const vendor = request.vendor;

    if (!vendor) {
      return response.status(403).json({ ok: false, message: "Artisan vendor profile required." });
    }

    const {
      status = "all",
      search = "",
      sort = "newest",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 10,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Filter to orders that contain at least one item from this vendor
    const matchQuery = {
      "items.vendorId": vendor._id,
    };

    if (search.trim()) {
      matchQuery.orderNumber = new RegExp(search.trim(), "i");
    }

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = end;
      }
    }

    // Specific vendor item status filter
    if (status && status !== "all") {
      matchQuery.items = {
        $elemMatch: {
          vendorId: vendor._id,
          orderStatus: status,
        },
      };
    }

    // Sort order
    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [orders, totalCount] = await Promise.all([
      Order.find(matchQuery)
        .populate("customerId", "name email phone")
        .populate("items.productId", "name category images image description price stockStatus quantity origin material dimensions weight")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(matchQuery),
    ]);

    // Format orders for vendor view (highlighting this vendor's items)
    const formattedOrders = orders.map((order) => {
      const vendorItems = (order.items || [])
        .filter((i) => {
          const vId = i.vendorId?._id
            ? i.vendorId._id.toString()
            : i.vendorId?.toString?.() || "";
          return vId === vendor._id.toString();
        })
        .map((i, idx) => {
          // With .lean() + .populate(), i._id is a MongoDB ObjectId object
          // Always coerce it to a string so the frontend can use it safely
          const itemId = i._id ? i._id.toString() : `item-fallback-${idx}`;
          const productId = i.productId?._id
            ? i.productId._id.toString()
            : i.productId?.toString?.() || null;

          return {
            _id: itemId,
            productId,
            vendorId: i.vendorId?._id
              ? i.vendorId._id.toString()
              : i.vendorId?.toString?.() || null,
            productName: i.productName || "",
            productImage: i.productImage || "",
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
            commissionPercentage: i.commissionPercentage ?? 0,
            commissionAmount: i.commissionAmount ?? 0,
            vendorEarning: i.vendorEarning ?? (i.subtotal - (i.commissionAmount ?? 0)),
            orderStatus: i.orderStatus || "placed",
            statusHistory: (i.statusHistory || []).map((h) => ({
              status: h.status,
              updatedAt: h.updatedAt,
              note: h.note || "",
            })),
            cancellationReason: i.cancellationReason || "",
          };
        });

      const vendorSubtotal = vendorItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const vendorCommission = vendorItems.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
      const vendorNetEarnings = vendorItems.reduce((acc, curr) => acc + (curr.vendorEarning || 0), 0);

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        customerName: order.deliveryAddress?.fullName || order.customerId?.name || "Customer",
        customerPhone: order.deliveryAddress?.phone || order.customerId?.phone || "",
        customerEmail: order.customerId?.email || "",
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        overallOrderStatus: order.orderStatus,
        orderNotes: order.notes || "",
        cancellationReason: order.cancellationReason || "",
        vendorItems,
        vendorSubtotal,
        vendorCommission,
        vendorNetEarnings,
        totalItemsCount: vendorItems.reduce((acc, curr) => acc + curr.quantity, 0),
      };
    });

    // Compute status counts specifically for this vendor
    const allVendorOrders = await Order.find({ "items.vendorId": vendor._id }).lean();
    const counts = {
      total: 0,
      placed: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    allVendorOrders.forEach((o) => {
      const vItems = o.items.filter((i) => i.vendorId.toString() === vendor._id.toString());
      if (vItems.length > 0) {
        counts.total += 1;
        // Count based on the items or overall status
        vItems.forEach((vi) => {
          if (counts[vi.orderStatus] !== undefined) {
            counts[vi.orderStatus] += 1;
          }
        });
      }
    });

    return response.json({
      ok: true,
      orders: formattedOrders,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum) || 1,
      counts,
    });
  } catch (error) {
    console.error("getVendorOrders error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch vendor orders." });
  }
}

/**
 * PATCH /api/orders/vendor/:id/items/:itemId/status
 * Vendor updates the status of their own item in an order.
 * Follows strict transition rules, logs history, and recalculates overall status.
 */
export async function updateVendorItemStatus(request, response) {
  try {
    const user = request.user;
    const vendor = request.vendor;
    const { id, itemId } = request.params;
    const { status: newStatus, note = "", cancellationReason = "" } = request.body;

    if (!vendor) {
      return response.status(403).json({ ok: false, message: "Artisan vendor profile required." });
    }

    if (!newStatus || !["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"].includes(newStatus)) {
      return response.status(400).json({ ok: false, message: "Invalid status provided." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return response.status(404).json({ ok: false, message: "Order not found." });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return response.status(404).json({ ok: false, message: "Item not found in order." });
    }

    // Verify vendor owns this item
    if (item.vendorId.toString() !== vendor._id.toString() && user.role !== "admin") {
      return response.status(403).json({
        ok: false,
        message: "You can only update items originating from your own artisan workshop.",
      });
    }

    const currentStatus = item.orderStatus || "placed";

    // Prevent identical update
    if (currentStatus === newStatus) {
      return response.status(400).json({
        ok: false,
        message: `Item is already in '${newStatus}' status.`,
      });
    }

    // Check transition validity
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus) && user.role !== "admin") {
      return response.status(400).json({
        ok: false,
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(", ") || "none"}`,
      });
    }

    // Update item
    item.orderStatus = newStatus;
    if (newStatus === "cancelled" && cancellationReason) {
      item.cancellationReason = cancellationReason.trim();
      // Restore inventory
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity },
      });
    }

    item.statusHistory.push({
      status: newStatus,
      updatedAt: new Date(),
      updatedBy: user._id,
      note: note.trim() || `Status updated to ${newStatus} by ${vendor.businessName}`,
    });

    // Recompute overall order status
    order.orderStatus = computeOverallOrderStatus(order.items);
    await order.save();

    return response.json({
      ok: true,
      message: `Item status successfully updated to '${newStatus}'.`,
      order,
      item,
    });
  } catch (error) {
    console.error("updateVendorItemStatus error:", error);
    return response.status(500).json({ ok: false, message: error.message || "Failed to update item status." });
  }
}

/**
 * =========================================================================
 * ADMIN ORDER APIS
 * =========================================================================
 */

/**
 * GET /api/orders/admin/all
 * Admin monitors all orders across all vendors
 */
export async function getAdminAllOrders(request, response) {
  try {
    const {
      status = "all",
      search = "",
      sort = "newest",
      page = 1,
      limit = 20,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && status !== "all") {
      query.orderStatus = status;
    }
    if (search.trim()) {
      query.orderNumber = new RegExp(search.trim(), "i");
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email phone")
        .populate("items.vendorId", "businessName category")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Aggregate counts
    const counts = {
      total: await Order.countDocuments(),
      placed: await Order.countDocuments({ orderStatus: "placed" }),
      confirmed: await Order.countDocuments({ orderStatus: "confirmed" }),
      processing: await Order.countDocuments({ orderStatus: "processing" }),
      shipped: await Order.countDocuments({ orderStatus: "shipped" }),
      delivered: await Order.countDocuments({ orderStatus: "delivered" }),
      cancelled: await Order.countDocuments({ orderStatus: "cancelled" }),
      pendingPayment: await Order.countDocuments({ paymentStatus: "pending" }),
      paidPayment: await Order.countDocuments({ paymentStatus: "paid" }),
    };

    return response.json({
      ok: true,
      orders,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      counts,
    });
  } catch (error) {
    console.error("getAdminAllOrders error:", error);
    return response.status(500).json({ ok: false, message: "Failed to fetch admin orders." });
  }
}

/**
 * PATCH /api/orders/admin/:id/payment-status
 * Explicit authorized workflow for updating Cash on Delivery payment status to 'paid'
 */
export async function updateOrderPaymentStatus(request, response) {
  try {
    const user = request.user;
    const { id } = request.params;
    const { paymentStatus, note = "" } = request.body;

    if (!paymentStatus || !["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
      return response.status(400).json({ ok: false, message: "Invalid payment status provided." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return response.status(404).json({ ok: false, message: "Order not found." });
    }

    order.paymentStatus = paymentStatus;
    order.paymentHistory.push({
      status: paymentStatus,
      updatedAt: new Date(),
      updatedBy: user._id,
      note: note.trim() || `Payment status updated to ${paymentStatus} by administrator`,
    });

    await order.save();

    return response.json({
      ok: true,
      message: `Order payment status set to '${paymentStatus}'.`,
      order,
    });
  } catch (error) {
    console.error("updateOrderPaymentStatus error:", error);
    return response.status(500).json({ ok: false, message: "Failed to update payment status." });
  }
}
