import { useState, useEffect, useCallback } from "react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import OrderTrackingTimeline from "../components/customer/OrderTrackingTimeline.jsx";
import { orderApi } from "../services/api.js";

const STATUS_BADGES = {
  placed: "bg-charcoal/10 text-charcoal border-charcoal/20",
  confirmed: "bg-teal/15 text-teal border-teal/30",
  processing: "bg-terai/15 text-terai border-terai/30",
  shipped: "bg-teal/20 text-teal border-teal/40",
  delivered: "bg-teal text-ivory border-teal",
  cancelled: "bg-vermilion/15 text-vermilion border-vermilion/30",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cancellingItemId, setCancellingItemId] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await orderApi.getMyOrders();
      if (res?.ok) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenCancelModal = (order, item = null) => {
    setCancelModalOrder(order);
    setCancellingItemId(item ? item._id : null);
    setCancelReason("");
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    try {
      setActionLoading(true);
      setError("");
      const res = await orderApi.cancelOrder(cancelModalOrder._id, {
        itemId: cancellingItemId,
        reason: cancelReason || "Customer cancellation request",
      });
      if (res?.ok) {
        setSuccessMsg(res.message);
        setCancelModalOrder(null);
        setCancellingItemId(null);
        loadOrders();
      }
    } catch (err) {
      setError(err.message || "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        {/* Breadcrumb & Header */}
        <div className="border-b border-charcoal/15 pb-6">
          <div className="flex items-center gap-2 text-xs text-charcoal/60 uppercase tracking-wider mb-2">
            <a href="#top" className="hover:text-teal transition-colors">Home</a>
            <span>/</span>
            <span className="text-charcoal font-bold">My Orders & Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Your Artisan Order History
          </h1>
          <p className="mt-1 text-sm text-charcoal/70">
            Real-time fulfillment tracking for traditional handcrafted creations from Terai makers.
          </p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-6 rounded border border-teal/40 bg-teal/10 p-4 text-xs font-semibold text-teal flex items-center justify-between">
            <span>{successMsg}</span>
            <button type="button" onClick={() => setSuccessMsg("")} className="font-bold">✕</button>
          </div>
        )}
        {error && (
          <div className="mt-6 rounded border border-vermilion/40 bg-vermilion/10 p-4 text-xs font-semibold text-vermilion flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="font-bold">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center">
              <span className="text-3xl">🏺</span>
              <p className="mt-3 font-semibold uppercase tracking-wider text-xs text-charcoal/60 animate-pulse">
                Loading your orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded border border-dashed border-charcoal/20 bg-sand/30 py-20 text-center">
              <span className="text-5xl">🛍️</span>
              <h3 className="font-serif text-xl font-bold text-charcoal mt-3">
                No orders placed yet
              </h3>
              <p className="text-xs text-charcoal/70 max-w-md mx-auto mt-1">
                Explore authentic Mithila paintings, bamboo work, and heritage crafts directly from verified artisans.
              </p>
              <a
                href="#products"
                className="mt-6 inline-block bg-vermilion px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors shadow-2xs"
              >
                Explore Crafts Catalog
              </a>
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const overallBadge = STATUS_BADGES[order.orderStatus] || STATUS_BADGES.placed;
              const canCancelOrder = ["placed", "confirmed"].includes(order.orderStatus);

              return (
                <div
                  key={order._id}
                  className="rounded border border-charcoal/15 bg-sand/30 hover:border-charcoal/30 transition-all overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="bg-sand/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-bold text-charcoal bg-ivory px-3 py-1 rounded border border-charcoal/15">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-charcoal/70">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${overallBadge}`}>
                        Overall: {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif text-lg font-bold text-vermilion">
                        Rs. {order.totalAmount?.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="border border-charcoal/20 bg-ivory px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand rounded"
                      >
                        {isExpanded ? "Hide Details" : "Track & View Items"}
                      </button>
                    </div>
                  </div>

                  {/* Multi-Vendor Items List */}
                  <div className="p-4 sm:p-5 space-y-6">
                    {order.items.map((item) => {
                      const vendorName = item.vendorId?.businessName || "Artisan Workshop";
                      const itemBadge = STATUS_BADGES[item.orderStatus] || STATUS_BADGES.placed;
                      const canCancelItem = ["placed", "confirmed"].includes(item.orderStatus);

                      return (
                        <div
                          key={item._id}
                          className="rounded border border-charcoal/10 bg-ivory p-4 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={item.productImage || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300"}
                                alt={item.productName}
                                className="h-16 w-16 rounded object-cover border border-charcoal/15 bg-sand shrink-0"
                              />
                              <div>
                                <h4 className="font-serif text-base font-bold text-charcoal">
                                  {item.productName}
                                </h4>
                                <p className="text-xs text-charcoal/60 mt-0.5">
                                  Sold & fulfilled by: <strong className="text-teal font-medium">{vendorName}</strong>
                                </p>
                                <p className="text-xs text-charcoal/80 font-medium mt-1">
                                  Qty: {item.quantity} × Rs. {item.unitPrice?.toLocaleString()} = <span className="font-bold text-vermilion">Rs. {item.subtotal?.toLocaleString()}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${itemBadge}`}>
                                Item Status: {item.orderStatus}
                              </span>
                              {canCancelItem && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCancelModal(order, item)}
                                  className="text-[11px] font-semibold text-vermilion hover:underline"
                                >
                                  Cancel this item
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Visual Order Timeline for This Specific Product */}
                          <div className="pt-2 border-t border-charcoal/8">
                            <OrderTrackingTimeline
                              currentStatus={item.orderStatus}
                              isCancelled={item.orderStatus === "cancelled"}
                              cancellationReason={item.cancellationReason}
                            />
                          </div>

                          {/* Status History Logs */}
                          {item.statusHistory && item.statusHistory.length > 0 && isExpanded && (
                            <div className="mt-3 p-3 rounded bg-sand/40 border border-charcoal/10 text-xs space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-charcoal/60 tracking-wider block">
                                Artisan Fulfillment Log
                              </span>
                              {item.statusHistory.map((hist, hIdx) => (
                                <div key={hIdx} className="flex items-baseline justify-between text-charcoal/80">
                                  <span className="font-semibold uppercase text-teal">
                                    • {hist.status}: {hist.note || "Status updated"}
                                  </span>
                                  <span className="text-[10px] text-charcoal/50">
                                    {new Date(hist.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(hist.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Extended Order Details (Delivery Address, Payment) */}
                    {isExpanded && (
                      <div className="mt-4 p-4 rounded bg-sand/50 border border-charcoal/15 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
                        <div>
                          <h6 className="font-semibold uppercase tracking-wider text-charcoal/70 mb-2">
                            Delivery Address
                          </h6>
                          <p className="text-charcoal font-medium">{order.deliveryAddress?.fullName}</p>
                          <p className="text-charcoal leading-relaxed mt-0.5">
                            {order.deliveryAddress?.street}, Ward {order.deliveryAddress?.ward},{" "}
                            {order.deliveryAddress?.municipality}, {order.deliveryAddress?.district},{" "}
                            {order.deliveryAddress?.province}, {order.deliveryAddress?.country}
                          </p>
                          <p className="text-charcoal/70 mt-1">Phone: {order.deliveryAddress?.phone}</p>
                        </div>

                        <div>
                          <h6 className="font-semibold uppercase tracking-wider text-charcoal/70 mb-2">
                            Payment & Order Summary
                          </h6>
                          <p className="text-charcoal">
                            Payment Method: <strong className="text-teal">{order.paymentMethod} (Cash on Delivery)</strong>
                          </p>
                          <p className="text-charcoal mt-1">
                            Payment Status: <span className="font-semibold capitalize text-terai">{order.paymentStatus}</span>
                          </p>
                          <p className="text-xs text-charcoal/60 mt-1 leading-relaxed">
                            Payment is verified and collected in cash at your doorstep by courier personnel upon safe delivery.
                          </p>
                          {canCancelOrder && (
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(order, null)}
                              className="mt-3 inline-block border border-vermilion/30 text-vermilion px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-vermilion hover:text-ivory transition-colors rounded"
                            >
                              Cancel Entire Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Cancellation Dialog Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="bg-ivory border border-charcoal/20 max-w-md w-full p-6 rounded shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-charcoal">
              Confirm Cancellation
            </h3>
            <p className="text-xs text-charcoal/80 leading-relaxed">
              {cancellingItemId
                ? "Are you sure you want to cancel this craft item from your order?"
                : "Are you sure you want to cancel this entire order? Reserved items will be returned to the artisan's studio inventory."}
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed mind / Ordered by mistake"
                  className="w-full border border-charcoal/20 bg-ivory p-2 text-xs text-charcoal focus:border-vermilion focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setCancelModalOrder(null)}
                  className="border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-vermilion px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
