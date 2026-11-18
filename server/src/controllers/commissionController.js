import mongoose from "mongoose";
import CommissionSetting from "../models/CommissionSetting.js";
import Order from "../models/Order.js";
import Vendor from "../models/Vendor.js";

/**
 * GET /api/commission/settings
 * Public/Authenticated: Get current active global commission rate and status
 * (Admins also get rate change history)
 */
export async function getCommissionSettings(request, response) {
  try {
    const settings = await CommissionSetting.getSettings();
    const isAdmin = request.user?.role === "admin";

    // If admin, populate updatedBy user details for history
    if (isAdmin) {
      await settings.populate("history.updatedBy", "name email");
    }

    return response.json({
      ok: true,
      settings: {
        _id: settings._id,
        percentage: settings.percentage,
        isEnabled: settings.isEnabled,
        updatedAt: settings.updatedAt,
        history: isAdmin ? settings.history : undefined,
      },
    });
  } catch (error) {
    console.error("getCommissionSettings error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to retrieve commission settings.",
    });
  }
}

/**
 * PUT /api/commission/settings
 * Admin only: Update global commission percentage and enabled status
 */
export async function updateCommissionSettings(request, response) {
  try {
    const user = request.user;
    if (!user || user.role !== "admin") {
      return response.status(403).json({
        ok: false,
        message: "Forbidden: Only administrators can modify commission settings.",
      });
    }

    const { percentage, isEnabled, note = "" } = request.body;

    if (percentage !== undefined) {
      const numRate = Number(percentage);
      if (isNaN(numRate) || numRate < 0 || numRate > 100) {
        return response.status(400).json({
          ok: false,
          message: "Commission percentage must be a number between 0 and 100.",
        });
      }
    }

    const settings = await CommissionSetting.getSettings();

    const previousRate = settings.percentage;
    const previousEnabled = settings.isEnabled;

    const newRate =
      percentage !== undefined ? Number(percentage) : settings.percentage;
    const newEnabled =
      isEnabled !== undefined ? Boolean(isEnabled) : settings.isEnabled;

    const changeNote =
      note.trim() ||
      `Commission updated from ${previousRate}% (${
        previousEnabled ? "Enabled" : "Disabled"
      }) to ${newRate}% (${newEnabled ? "Enabled" : "Disabled"}) by ${
        user.name
      }`;

    settings.percentage = newRate;
    settings.isEnabled = newEnabled;

    settings.history.unshift({
      percentage: newRate,
      isEnabled: newEnabled,
      note: changeNote,
      updatedBy: user._id,
      updatedAt: new Date(),
    });

    await settings.save();
    await settings.populate("history.updatedBy", "name email");

    return response.json({
      ok: true,
      message: `Global commission successfully updated to ${newRate}% (${
        newEnabled ? "Active" : "Disabled"
      }).`,
      settings: {
        _id: settings._id,
        percentage: settings.percentage,
        isEnabled: settings.isEnabled,
        updatedAt: settings.updatedAt,
        history: settings.history,
      },
    });
  } catch (error) {
    console.error("updateCommissionSettings error:", error);
    return response.status(500).json({
      ok: false,
      message: error.message || "Failed to update commission settings.",
    });
  }
}

/**
 * GET /api/commission/admin/overview
 * Admin only: Complete commission analytics, vendor breakdown, and filterable ledger
 */
export async function getAdminCommissionOverview(request, response) {
  try {
    const {
      startDate = "",
      endDate = "",
      vendorId = "",
      orderNumber = "",
      status = "all", // 'all' | 'active' | 'reversed'
      page = 1,
      limit = 50,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

    // Fetch all vendors for the dropdown filter and summary map
    const allVendors = await Vendor.find()
      .populate("userId", "name email")
      .lean();

    const vendorMap = {};
    allVendors.forEach((v) => {
      vendorMap[v._id.toString()] = {
        vendorId: v._id.toString(),
        businessName: v.businessName || "Unnamed Studio",
        category: v.category || "Traditional Crafts",
        ownerName: v.userId?.name || "Artisan",
        ownerEmail: v.userId?.email || "",
        grossSales: 0,
        activeSales: 0,
        commissionEarned: 0,
        commissionReversed: 0,
        netEarnings: 0,
        totalItemsCount: 0,
        ordersSet: new Set(),
      };
    });

    // Query all orders to compile complete platform financials
    const allOrders = await Order.find()
      .populate("customerId", "name email phone")
      .populate("items.vendorId", "businessName category")
      .sort({ createdAt: -1 })
      .lean();

    let totalGrossSales = 0;
    let totalActiveSales = 0;
    let totalCommissionEarned = 0;
    let totalCommissionReversed = 0;
    let totalVendorNetEarnings = 0;
    let totalActiveItemsCount = 0;
    let totalCancelledItemsCount = 0;

    const allTransactions = [];

    // Parse transactions and compile vendor metrics
    allOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const isOrderRefunded = order.paymentStatus === "refunded";

      (order.items || []).forEach((item, itemIdx) => {
        const vId =
          item.vendorId?._id?.toString() ||
          item.vendorId?.toString() ||
          "unknown";
        const isCancelled = item.orderStatus === "cancelled" || isOrderRefunded;

        const subtotal = Number(item.subtotal) || 0;
        const commRate = Number(item.commissionPercentage) || 0;
        const commAmount =
          item.commissionAmount !== undefined
            ? Number(item.commissionAmount)
            : Math.round(((subtotal * commRate) / 100) * 100) / 100;
        const netEarning =
          item.vendorEarning !== undefined
            ? Number(item.vendorEarning)
            : Math.round((subtotal - commAmount) * 100) / 100;

        // Platform global stats
        totalGrossSales += subtotal;
        if (isCancelled) {
          totalCommissionReversed += commAmount;
          totalCancelledItemsCount += 1;
        } else {
          totalActiveSales += subtotal;
          totalCommissionEarned += commAmount;
          totalVendorNetEarnings += netEarning;
          totalActiveItemsCount += 1;
        }

        // Vendor aggregation
        if (vendorMap[vId]) {
          const vSummary = vendorMap[vId];
          vSummary.grossSales += subtotal;
          vSummary.totalItemsCount += Number(item.quantity) || 1;
          vSummary.ordersSet.add(order._id.toString());

          if (isCancelled) {
            vSummary.commissionReversed += commAmount;
          } else {
            vSummary.activeSales += subtotal;
            vSummary.commissionEarned += commAmount;
            vSummary.netEarnings += netEarning;
          }
        }

        // Ledger transaction record
        allTransactions.push({
          transactionId: `${order._id.toString()}-${item._id?.toString() || itemIdx}`,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber || "N/A",
          createdAt: order.createdAt,
          customerName:
            order.deliveryAddress?.fullName ||
            order.customerId?.name ||
            "Customer",
          customerEmail: order.customerId?.email || "",
          vendorId: vId,
          vendorName:
            item.vendorId?.businessName ||
            vendorMap[vId]?.businessName ||
            "Artisan Workshop",
          productId: item.productId?.toString() || "",
          productName: item.productName || "Handmade Craft",
          productImage: item.productImage || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          subtotal,
          commissionPercentage: commRate,
          commissionAmount: commAmount,
          vendorEarning: netEarning,
          orderStatus: item.orderStatus || "placed",
          paymentStatus: order.paymentStatus || "pending",
          isReversed: isCancelled,
          cancellationReason:
            item.cancellationReason || order.cancellationReason || "",
        });
      });
    });

    // Format vendor summaries array
    const vendorSummaries = Object.values(vendorMap).map((v) => ({
      vendorId: v.vendorId,
      businessName: v.businessName,
      category: v.category,
      ownerName: v.ownerName,
      ownerEmail: v.ownerEmail,
      grossSales: Math.round(v.grossSales * 100) / 100,
      activeSales: Math.round(v.activeSales * 100) / 100,
      commissionEarned: Math.round(v.commissionEarned * 100) / 100,
      commissionReversed: Math.round(v.commissionReversed * 100) / 100,
      netEarnings: Math.round(v.netEarnings * 100) / 100,
      totalOrders: v.ordersSet.size,
      totalItemsCount: v.totalItemsCount,
    }));

    // Filter transactions based on query
    let filteredTransactions = allTransactions;

    if (vendorId && vendorId !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.vendorId === vendorId
      );
    }

    if (orderNumber.trim()) {
      const q = orderNumber.trim().toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.orderNumber.toLowerCase().includes(q) ||
          t.productName.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q)
      );
    }

    if (status === "active") {
      filteredTransactions = filteredTransactions.filter((t) => !t.isReversed);
    } else if (status === "reversed") {
      filteredTransactions = filteredTransactions.filter((t) => t.isReversed);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) <= end
      );
    }

    // Pagination for transactions
    const totalTransactions = filteredTransactions.length;
    const paginatedTransactions = filteredTransactions.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum
    );

    const settings = await CommissionSetting.getSettings();

    return response.json({
      ok: true,
      currentSettings: {
        percentage: settings.percentage,
        isEnabled: settings.isEnabled,
        updatedAt: settings.updatedAt,
      },
      metrics: {
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        totalActiveSales: Math.round(totalActiveSales * 100) / 100,
        totalCommissionEarned: Math.round(totalCommissionEarned * 100) / 100,
        totalCommissionReversed: Math.round(totalCommissionReversed * 100) / 100,
        totalVendorNetEarnings: Math.round(totalVendorNetEarnings * 100) / 100,
        totalActiveItemsCount,
        totalCancelledItemsCount,
        totalOrdersCount: allOrders.length,
      },
      vendorSummaries,
      transactions: paginatedTransactions,
      pagination: {
        total: totalTransactions,
        page: pageNum,
        pages: Math.ceil(totalTransactions / limitNum) || 1,
        limit: limitNum,
      },
      vendorsList: allVendors.map((v) => ({
        _id: v._id,
        businessName: v.businessName,
      })),
    });
  } catch (error) {
    console.error("getAdminCommissionOverview error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to load commission overview data.",
    });
  }
}

/**
 * GET /api/commission/vendor/overview
 * Vendor only: View own earnings, commission deductions, and order breakdown (Read-only)
 */
export async function getVendorCommissionOverview(request, response) {
  try {
    const vendor = request.vendor;
    if (!vendor) {
      return response.status(403).json({
        ok: false,
        message: "Artisan vendor account required.",
      });
    }

    const {
      startDate = "",
      endDate = "",
      orderNumber = "",
      status = "all", // 'all' | 'active' | 'reversed'
      page = 1,
      limit = 50,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

    const settings = await CommissionSetting.getSettings();

    // Query orders that contain items belonging to this vendor
    const orders = await Order.find({ "items.vendorId": vendor._id })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    let totalGrossSales = 0;
    let totalActiveSales = 0;
    let totalCommissionDeducted = 0;
    let totalCommissionReversed = 0;
    let totalNetEarnings = 0;
    let activeItemsCount = 0;
    let reversedItemsCount = 0;
    const ordersSet = new Set();

    const transactions = [];

    orders.forEach((order) => {
      const isOrderRefunded = order.paymentStatus === "refunded";

      (order.items || []).forEach((item, itemIdx) => {
        const itemVendorId =
          item.vendorId?._id?.toString() || item.vendorId?.toString();
        if (itemVendorId !== vendor._id.toString()) return;

        ordersSet.add(order._id.toString());
        const isCancelled = item.orderStatus === "cancelled" || isOrderRefunded;

        const subtotal = Number(item.subtotal) || 0;
        const commRate = Number(item.commissionPercentage) || 0;
        const commAmount =
          item.commissionAmount !== undefined
            ? Number(item.commissionAmount)
            : Math.round(((subtotal * commRate) / 100) * 100) / 100;
        const netEarning =
          item.vendorEarning !== undefined
            ? Number(item.vendorEarning)
            : Math.round((subtotal - commAmount) * 100) / 100;

        totalGrossSales += subtotal;
        if (isCancelled) {
          totalCommissionReversed += commAmount;
          reversedItemsCount += 1;
        } else {
          totalActiveSales += subtotal;
          totalCommissionDeducted += commAmount;
          totalNetEarnings += netEarning;
          activeItemsCount += 1;
        }

        transactions.push({
          transactionId: `${order._id.toString()}-${item._id?.toString() || itemIdx}`,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber || "N/A",
          createdAt: order.createdAt,
          customerName:
            order.deliveryAddress?.fullName ||
            order.customerId?.name ||
            "Customer",
          productId: item.productId?.toString() || "",
          productName: item.productName || "Handmade Craft",
          productImage: item.productImage || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          subtotal,
          commissionPercentage: commRate,
          commissionAmount: commAmount,
          vendorEarning: netEarning,
          orderStatus: item.orderStatus || "placed",
          paymentStatus: order.paymentStatus || "pending",
          isReversed: isCancelled,
          cancellationReason:
            item.cancellationReason || order.cancellationReason || "",
        });
      });
    });

    // Filter transactions
    let filteredTransactions = transactions;

    if (orderNumber.trim()) {
      const q = orderNumber.trim().toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.orderNumber.toLowerCase().includes(q) ||
          t.productName.toLowerCase().includes(q)
      );
    }

    if (status === "active") {
      filteredTransactions = filteredTransactions.filter((t) => !t.isReversed);
    } else if (status === "reversed") {
      filteredTransactions = filteredTransactions.filter((t) => t.isReversed);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) <= end
      );
    }

    const totalCount = filteredTransactions.length;
    const paginated = filteredTransactions.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum
    );

    return response.json({
      ok: true,
      currentSettings: {
        percentage: settings.percentage,
        isEnabled: settings.isEnabled,
      },
      metrics: {
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        totalActiveSales: Math.round(totalActiveSales * 100) / 100,
        totalCommissionDeducted:
          Math.round(totalCommissionDeducted * 100) / 100,
        totalCommissionReversed:
          Math.round(totalCommissionReversed * 100) / 100,
        totalNetEarnings: Math.round(totalNetEarnings * 100) / 100,
        totalOrdersCount: ordersSet.size,
        activeItemsCount,
        reversedItemsCount,
      },
      transactions: paginated,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("getVendorCommissionOverview error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to load vendor earnings and commission overview.",
    });
  }
}
