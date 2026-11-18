import { useState } from "react";

const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-charcoal/10 text-charcoal border-charcoal/20",
    dot: "bg-charcoal",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-teal/15 text-teal border-teal/30",
    dot: "bg-teal",
  },
  processing: {
    label: "Processing",
    color: "bg-terai/15 text-terai border-terai/30",
    dot: "bg-terai",
  },
  shipped: {
    label: "Shipped",
    color: "bg-teal/20 text-teal border-teal/40",
    dot: "bg-teal",
  },
  delivered: {
    label: "Delivered",
    color: "bg-teal text-ivory border-teal",
    dot: "bg-ivory",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-vermilion/15 text-vermilion border-vermilion/30",
    dot: "bg-vermilion",
  },
};

const NEXT_STATUS_OPTIONS = {
  placed: [
    { value: "confirmed", label: "Confirm Order" },
    { value: "cancelled", label: "Reject / Cancel" },
  ],
  confirmed: [
    { value: "processing", label: "Start Processing" },
    { value: "cancelled", label: "Cancel Order" },
  ],
  processing: [
    { value: "shipped", label: "Mark as Shipped" },
    { value: "cancelled", label: "Cancel Order" },
  ],
  shipped: [{ value: "delivered", label: "Mark as Delivered (Verified)" }],
  delivered: [],
  cancelled: [],
};

const ALL_POSSIBLE_STATUSES = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function VendorOrdersSection({ orders = [], counts = {}, onUpdateStatus, loading }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [statusToSet, setStatusToSet] = useState("");
  const [note, setNote] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [quickUpdateLoadingId, setQuickUpdateLoadingId] = useState(null);

  const openStatusModal = (order, item, nextStatus) => {
    setSelectedOrder(order);
    setUpdatingItemId(item._id);
    setStatusToSet(nextStatus);
    setNote("");
    setCancellationReason("");
    setErrorMsg("");
  };

  const handleQuickStatusChange = async (orderId, itemId, newStatus) => {
    if (!newStatus) return;
    if (newStatus === "cancelled") {
      const reason = window.prompt("Enter cancellation reason for the customer:", "Out of raw materials or craft cannot be completed");
      if (!reason || !reason.trim()) return;
      try {
        setQuickUpdateLoadingId(itemId);
        await onUpdateStatus(orderId, itemId, {
          status: "cancelled",
          cancellationReason: reason.trim(),
          note: `Cancelled by vendor: ${reason.trim()}`,
        });
      } catch (err) {
        alert(err.message || "Failed to update status");
      } finally {
        setQuickUpdateLoadingId(null);
      }
      return;
    }

    try {
      setQuickUpdateLoadingId(itemId);
      await onUpdateStatus(orderId, itemId, {
        status: newStatus,
        note: `Status updated to ${newStatus} directly by artisan`,
      });
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setQuickUpdateLoadingId(null);
    }
  };

  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !updatingItemId || !statusToSet) return;

    if (statusToSet === "cancelled" && !cancellationReason.trim()) {
      setErrorMsg("Please provide a reason for cancellation.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onUpdateStatus(selectedOrder._id, updatingItemId, {
        status: statusToSet,
        note,
        cancellationReason,
      });
      // Close modal
      setUpdatingItemId(null);
      setStatusToSet("");
      setNote("");
      setCancellationReason("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update item status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Status Count Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Orders", count: counts.total || 0, color: "text-charcoal" },
          { label: "New Placed", count: counts.placed || 0, color: "text-charcoal font-bold" },
          { label: "Confirmed", count: counts.confirmed || 0, color: "text-teal" },
          { label: "Processing", count: counts.processing || 0, color: "text-terai" },
          { label: "Shipped", count: counts.shipped || 0, color: "text-teal" },
          { label: "Delivered", count: counts.delivered || 0, color: "text-teal font-bold" },
          { label: "Cancelled", count: counts.cancelled || 0, color: "text-vermilion" },
        ].map((stat, idx) => (
          <div key={idx} className="rounded border border-charcoal/15 bg-sand/40 p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-charcoal/60 tracking-wider block">
              {stat.label}
            </span>
            <p className={`font-serif text-xl font-bold mt-1 ${stat.color}`}>
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* ── Orders Listing ── */}
      {loading ? (
        <div className="py-16 text-center text-xs text-charcoal/60 font-semibold uppercase tracking-wider animate-pulse">
          Loading workshop orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded border border-dashed border-charcoal/20 bg-sand/20 py-16 text-center">
          <span className="text-4xl">📦</span>
          <h4 className="font-serif text-lg font-bold text-charcoal mt-2">
            No artisan orders matching filters
          </h4>
          <p className="text-xs text-charcoal/60 mt-1 max-w-sm mx-auto">
            When customers purchase creations from your studio, your fulfillment orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const hasNewPlacedItems = order.vendorItems.some((i) => i.orderStatus === "placed");

            return (
              <div
                key={order._id}
                className={`rounded border transition-all p-5 space-y-4 ${
                  hasNewPlacedItems
                    ? "border-terai bg-terai/5 shadow-xs"
                    : "border-charcoal/15 bg-sand/30 hover:border-charcoal/30"
                }`}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal/10 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-charcoal bg-ivory px-2.5 py-1 rounded border border-charcoal/15">
                      {order.orderNumber}
                    </span>
                    {hasNewPlacedItems && (
                      <span className="rounded bg-terai px-2 py-0.5 text-[10px] font-bold text-ivory uppercase tracking-wider animate-pulse">
                        🔔 New Order Received
                      </span>
                    )}
                    <span className="text-xs text-charcoal/60">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-teal font-semibold">
                      Payment: {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-charcoal/70">Studio Total:</span>
                    <span className="font-serif text-base font-bold text-vermilion">
                      Rs. {order.vendorSubtotal?.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      className="border border-charcoal/20 bg-ivory px-3 py-1 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand rounded ml-2"
                    >
                      {selectedOrder?._id === order._id ? "Close Details" : "View Customer & Address"}
                    </button>
                  </div>
                </div>

                {/* Order Items from This Artisan Workshop */}
                <div className="space-y-3">
                  {order.vendorItems.map((item) => {
                    const statusInfo = STATUS_CONFIG[item.orderStatus] || STATUS_CONFIG.placed;
                    const nextOptions = NEXT_STATUS_OPTIONS[item.orderStatus] || [];
                    const isUpdatingThisItem = quickUpdateLoadingId === item._id;

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 rounded bg-ivory border border-charcoal/10"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productImage || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200"}
                            alt={item.productName}
                            className="h-14 w-14 rounded object-cover border border-charcoal/15 shrink-0 bg-sand"
                          />
                          <div>
                            <h5 className="font-serif text-sm font-bold text-charcoal">
                              {item.productName}
                            </h5>
                            <p className="text-xs text-charcoal/70 mt-0.5">
                              Qty: <strong className="text-charcoal">{item.quantity}</strong> × Rs. {item.unitPrice.toLocaleString()} = <strong className="text-vermilion">Rs. {item.subtotal.toLocaleString()}</strong>
                            </p>
                            {item.cancellationReason && (
                              <p className="text-xs text-vermilion italic mt-0.5">
                                Cancelled: {item.cancellationReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Dual Control: Quick Dropdown Selector + Step Transition Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Current Status Pill */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusInfo.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                          </span>

                          {/* Alternative Way 1: Direct Dropdown Selector to change status */}
                          {item.orderStatus !== "delivered" && item.orderStatus !== "cancelled" && (
                            <div className="flex items-center gap-1 border border-charcoal/20 bg-sand/30 rounded px-2 py-0.5">
                              <span className="text-[10px] font-semibold text-charcoal/60 uppercase">
                                Set:
                              </span>
                              <select
                                disabled={isUpdatingThisItem}
                                value={item.orderStatus}
                                onChange={(e) => handleQuickStatusChange(order._id, item._id, e.target.value)}
                                className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none cursor-pointer"
                              >
                                {ALL_POSSIBLE_STATUSES.map((st) => (
                                  <option key={st.value} value={st.value}>
                                    {st.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Alternative Way 2: Explicit Next Life-cycle Step Action Buttons */}
                          {nextOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isUpdatingThisItem}
                              onClick={() => openStatusModal(order, item, opt.value)}
                              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                                opt.value === "cancelled"
                                  ? "border border-vermilion/30 text-vermilion hover:bg-vermilion hover:text-ivory"
                                  : "bg-teal hover:bg-charcoal text-ivory shadow-2xs"
                              }`}
                            >
                              → {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible Customer and Delivery Address Details */}
                {selectedOrder?._id === order._id && (
                  <div className="mt-4 p-4 rounded bg-sand/60 border border-charcoal/15 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
                    <div>
                      <h6 className="font-semibold uppercase tracking-wider text-charcoal/70 mb-2">
                        Customer & Contact Details
                      </h6>
                      <p className="text-charcoal font-medium">Name: {order.customerName}</p>
                      <p className="text-charcoal font-medium mt-1">Phone: {order.customerPhone || "N/A"}</p>
                      <p className="text-charcoal/70 mt-1">
                        Payment: <span className="font-semibold text-teal">{order.paymentMethod}</span> (Status: {order.paymentStatus})
                      </p>
                    </div>
                    <div>
                      <h6 className="font-semibold uppercase tracking-wider text-charcoal/70 mb-2">
                        Fulfillment Delivery Address
                      </h6>
                      <p className="text-charcoal leading-relaxed">
                        {order.deliveryAddress?.street}, Ward {order.deliveryAddress?.ward},{" "}
                        {order.deliveryAddress?.municipality}, {order.deliveryAddress?.district},{" "}
                        {order.deliveryAddress?.province}, {order.deliveryAddress?.country}
                      </p>
                      {order.deliveryAddress?.landmark && (
                        <p className="text-charcoal/70 mt-1">
                          Landmark: <em>{order.deliveryAddress.landmark}</em>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Status Transition Modal (with Note / Reason) ── */}
      {updatingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="bg-ivory border border-charcoal/20 max-w-md w-full p-6 rounded shadow-2xl space-y-4 animate-scale-up">
            <div className="border-b border-charcoal/15 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal">
                Artisan Order Life Cycle
              </span>
              <h3 className="font-serif text-xl font-bold text-charcoal mt-1">
                Advance Status to: <span className="uppercase text-vermilion">{statusToSet}</span>
              </h3>
            </div>

            {errorMsg && (
              <div className="rounded border border-vermilion/30 bg-vermilion/10 p-2.5 text-xs text-vermilion">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              {statusToSet === "cancelled" ? (
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                    Cancellation Reason *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="e.g. Out of raw materials / Craft cannot be completed on time"
                    className="w-full border border-charcoal/20 bg-ivory p-2 text-xs text-charcoal focus:border-vermilion focus:outline-none"
                  />
                  <p className="text-[11px] text-vermilion mt-1">
                    Note: Cancelling will automatically return reserved stock back to your inventory.
                  </p>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Status Note / Fulfillment Comment (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Master artisan commenced moulding / dispatched via local Terai courier"
                  className="w-full border border-charcoal/20 bg-ivory p-2 text-xs text-charcoal focus:border-teal focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setUpdatingItemId(null);
                    setStatusToSet("");
                  }}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal/70 hover:text-charcoal border border-charcoal/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-vermilion px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
