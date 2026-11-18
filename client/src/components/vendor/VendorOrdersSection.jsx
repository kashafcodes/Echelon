import { useState } from "react";

const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-charcoal/10 text-charcoal border-charcoal/20",
    dot: "bg-charcoal",
    step: 1,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-teal/15 text-teal border-teal/30",
    dot: "bg-teal",
    step: 2,
  },
  processing: {
    label: "Processing",
    color: "bg-terai/15 text-terai border-terai/30",
    dot: "bg-terai",
    step: 3,
  },
  shipped: {
    label: "Shipped",
    color: "bg-teal/20 text-teal border-teal/40",
    dot: "bg-teal",
    step: 4,
  },
  delivered: {
    label: "Delivered",
    color: "bg-teal text-ivory border-teal",
    dot: "bg-ivory",
    step: 5,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-vermilion/15 text-vermilion border-vermilion/30",
    dot: "bg-vermilion",
    step: 0,
  },
};

const NEXT_STATUS_OPTIONS = {
  placed: [
    { value: "confirmed", label: "Confirm Order", icon: "✓", variant: "teal" },
    { value: "cancelled", label: "Decline / Cancel", icon: "✕", variant: "danger" },
  ],
  confirmed: [
    { value: "processing", label: "Start Processing", icon: "🔨", variant: "primary" },
    { value: "shipped", label: "Mark as Shipped", icon: "🚚", variant: "teal" },
    { value: "cancelled", label: "Cancel Order", icon: "✕", variant: "danger" },
  ],
  processing: [
    { value: "shipped", label: "Mark as Shipped", icon: "🚚", variant: "teal" },
    { value: "cancelled", label: "Cancel Order", icon: "✕", variant: "danger" },
  ],
  shipped: [
    { value: "delivered", label: "Mark as Delivered (Verified)", icon: "📦", variant: "teal" },
  ],
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

const PROFESSIONAL_CANCEL_REASONS = [
  {
    category: "material_shortage",
    label: "Raw Material or Craft Supply Shortage",
    template:
      "Dear Customer, we sincerely apologize that the traditional materials required to craft this authentic piece are currently out of supply. Your order item has been released.",
  },
  {
    category: "production_timeframe",
    label: "Artisan Production Timeframe Delay",
    template:
      "Dear Customer, handcrafting this traditional piece to our authentic standards requires more time than the scheduled delivery timeframe allows. We have cancelled this item with our apologies.",
  },
  {
    category: "delivery_unreachable",
    label: "Delivery Address Beyond Courier Reach",
    template:
      "Dear Customer, our regional courier partners are currently unable to service delivery of delicate handicrafts to this destination address.",
  },
  {
    category: "quality_assurance",
    label: "Artisan Quality Inspection Discrepancy",
    template:
      "Dear Customer, during our workshop quality audit, this handcrafted creation did not meet our high cultural standards. We have cancelled the item rather than dispatch a compromised piece.",
  },
  {
    category: "customer_requested",
    label: "Customer Requested Prior to Dispatch",
    template:
      "Dear Customer, as requested via direct inquiry prior to courier dispatch, your order item has been safely cancelled.",
  },
  {
    category: "custom_specification",
    label: "Custom Specifications Cannot Be Fulfilled",
    template:
      "Dear Customer, our artisan workshop is unable to accurately fulfill the custom notes and bespoke modifications requested for this item.",
  },
  {
    category: "other",
    label: "Other Studio Workshop Reason",
    template:
      "Dear Customer, our artisan studio is unable to fulfill this order item at this time.",
  },
];

export default function VendorOrdersSection({
  orders = [],
  counts = {},
  onUpdateStatus,
  loading,
}) {
  // Detail page view state storing IDs so it stays 100% reactive to updated orders
  const [detailViewIds, setDetailViewIds] = useState(null); // { orderId, itemId }

  // Optimistic overrides for instant 0ms UI reactions
  const [optimisticOverrides, setOptimisticOverrides] = useState({});

  // Optional custom tracking/note input in detail view
  const [detailNote, setDetailNote] = useState("");

  // Modals
  const [cancellationTarget, setCancellationTarget] = useState(null); // { order, item }

  // Form states inside cancellation modal
  const [selectedReasonCat, setSelectedReasonCat] = useState("material_shortage");
  const [cancellationMessage, setCancellationMessage] = useState(
    PROFESSIONAL_CANCEL_REASONS[0].template
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [quickUpdateLoadingId, setQuickUpdateLoadingId] = useState(null);

  // Helper to show temporary toast
  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4500);
  };

  // Find active order & item dynamically from orders state + optimistic overrides
  const activeOrder = detailViewIds
    ? orders.find((o) => String(o._id) === String(detailViewIds.orderId))
    : null;
  const rawActiveItem = activeOrder
    ? activeOrder.vendorItems.find((i) => String(i._id) === String(detailViewIds.itemId))
    : null;
  const activeItem = rawActiveItem
    ? {
        ...rawActiveItem,
        _id: String(rawActiveItem._id),
        ...(optimisticOverrides[String(rawActiveItem._id)] || {}),
      }
    : null;

  // Open professional cancellation dialog
  const openCancellationModal = (order, item) => {
    const defaultReason = PROFESSIONAL_CANCEL_REASONS[0];
    setCancellationTarget({ order, item });
    setSelectedReasonCat(defaultReason.category);
    setCancellationMessage(defaultReason.template);
    setErrorMsg("");
  };

  // Handle reason category change in cancellation modal
  const handleReasonCatChange = (catKey) => {
    setSelectedReasonCat(catKey);
    const found = PROFESSIONAL_CANCEL_REASONS.find((r) => r.category === catKey);
    if (found) {
      setCancellationMessage(found.template);
    }
  };

  // Automatic Immediate Status Change (applies instantly without extra modal confirmation)
  const applyAutoStatusChange = async (order, item, newStatus, customNote = "") => {
    if (!newStatus || newStatus === item.orderStatus) return;

    // Always coerce IDs to strings to avoid ObjectId → undefined issues
    const orderId = String(order._id);
    const itemId = String(item._id);

    if (!itemId || itemId === "undefined" || itemId === "null") {
      setErrorMsg("Cannot update: item ID is missing. Please refresh and try again.");
      return;
    }

    // If changing to cancelled, open the professional cancellation modal
    if (newStatus === "cancelled") {
      openCancellationModal(order, item);
      return;
    }

    try {
      setQuickUpdateLoadingId(itemId);
      setErrorMsg("");

      const noteText =
        customNote.trim() ||
        (newStatus === "shipped"
          ? "Dispatched and shipped to delivery address by artisan"
          : newStatus === "delivered"
          ? "Delivered safely to recipient and verified"
          : newStatus === "processing"
          ? "Artisan studio processing and crafting in progress"
          : newStatus === "confirmed"
          ? "Order confirmed by artisan workshop"
          : `Status updated to ${newStatus} by artisan`);

      // Optimistic update — UI changes IMMEDIATELY at 0ms
      setOptimisticOverrides((prev) => ({
        ...prev,
        [itemId]: {
          orderStatus: newStatus,
          statusHistory: [
            ...(item.statusHistory || []),
            {
              status: newStatus,
              updatedAt: new Date().toISOString(),
              note: noteText,
            },
          ],
        },
      }));

      // Call API
      await onUpdateStatus(orderId, itemId, {
        status: newStatus,
        note: noteText,
      });

      showToast(`Status updated to "${newStatus.toUpperCase()}" automatically.`);
    } catch (err) {
      // Revert optimistic override on failure
      setOptimisticOverrides((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      setErrorMsg(err.message || "Failed to update status automatically.");
    } finally {
      setQuickUpdateLoadingId(null);
    }
  };

  // Confirm Professional Cancellation
  const handleConfirmCancellation = async (e) => {
    e.preventDefault();
    if (!cancellationTarget) return;
    const { order, item } = cancellationTarget;

    // Always coerce IDs to strings
    const orderId = String(order._id);
    const itemId = String(item._id);

    if (!itemId || itemId === "undefined" || itemId === "null") {
      setErrorMsg("Cannot cancel: item ID is missing. Please refresh and try again.");
      return;
    }

    const reasonObj = PROFESSIONAL_CANCEL_REASONS.find(
      (r) => r.category === selectedReasonCat
    );
    const formalReason = reasonObj?.label || "Artisan Workshop Cancellation";

    try {
      setSubmitting(true);
      setErrorMsg("");

      // Optimistic override for instant cancellation display
      setOptimisticOverrides((prev) => ({
        ...prev,
        [itemId]: {
          orderStatus: "cancelled",
          cancellationReason: formalReason,
          statusHistory: [
            ...(item.statusHistory || []),
            {
              status: "cancelled",
              updatedAt: new Date().toISOString(),
              note: cancellationMessage.trim() || formalReason,
            },
          ],
        },
      }));

      await onUpdateStatus(orderId, itemId, {
        status: "cancelled",
        cancellationReason: formalReason,
        note: cancellationMessage.trim() || formalReason,
      });

      showToast(`Item cancelled professionally. Customer response recorded.`);
      setCancellationTarget(null);
    } catch (err) {
      // Revert optimistic override on failure
      setOptimisticOverrides((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      setErrorMsg(err.message || "Failed to process cancellation.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Detailed Product Order Fulfillment View (When product is clicked)
  // ─────────────────────────────────────────────────────────────────────────────
  if (detailViewIds && activeOrder && activeItem) {
    const order = activeOrder;
    const item = activeItem;
    const statusInfo = STATUS_CONFIG[item.orderStatus] || STATUS_CONFIG.placed;
    const nextOptions = NEXT_STATUS_OPTIONS[item.orderStatus] || [];
    const isTerminal = item.orderStatus === "delivered" || item.orderStatus === "cancelled";
    const isItemUpdating = quickUpdateLoadingId === item._id;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/15 pb-4">
          <button
            type="button"
            onClick={() => setDetailViewIds(null)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal hover:text-charcoal bg-sand/40 hover:bg-sand px-3.5 py-2 rounded transition-all cursor-pointer shadow-2xs"
          >
            <span>← Back to Orders List</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-charcoal/60">Order Reference:</span>
            <span className="font-mono font-bold text-charcoal bg-ivory px-2.5 py-1 border border-charcoal/15 rounded">
              {order.orderNumber}
            </span>
            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="rounded border border-teal/30 bg-teal/10 p-3 text-xs text-teal font-semibold flex items-center justify-between animate-fade-in">
            <span>✓ {successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast("")}
              className="text-teal hover:text-charcoal text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="rounded border border-vermilion/30 bg-vermilion/10 p-3 text-xs text-vermilion font-semibold flex items-center justify-between animate-fade-in">
            <span>✕ {errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-vermilion hover:text-charcoal text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Grid: Product & Lifecycle (Left) + Customer & Delivery (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ════════ LEFT COLUMN: Product & Lifecycle & Actions (7 Cols) ════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Product Card */}
            <div className="rounded-lg border border-charcoal/15 bg-ivory p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal">
                  Ordered Craft Creation
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img
                  src={
                    item.productImage ||
                    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300"
                  }
                  alt={item.productName}
                  className="h-28 w-28 object-cover rounded-lg border border-charcoal/15 bg-sand shrink-0 shadow-2xs"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-teal uppercase tracking-wider block">
                    {item.productId?.category || "Authentic Craft"}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-charcoal leading-snug mt-0.5">
                    {item.productName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal/70 mt-2">
                    <span>
                      Unit Price: <strong className="text-charcoal">Rs. {item.unitPrice.toLocaleString()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Quantity: <strong className="text-charcoal">{item.quantity}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Subtotal:{" "}
                      <strong className="text-vermilion text-sm font-bold">
                        Rs. {item.subtotal.toLocaleString()}
                      </strong>
                    </span>
                  </div>

                  {item.productId?._id && (
                    <a
                      href={`#product?id=${item.productId._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-xs text-teal hover:underline font-semibold"
                    >
                      View Live Store Page ↗
                    </a>
                  )}
                </div>
              </div>

              {item.cancellationReason && (
                <div className="rounded border border-vermilion/30 bg-vermilion/8 p-3 text-xs text-vermilion space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[10px]">Cancellation Record:</p>
                  <p>{item.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Visual Life-Cycle Stepper (Immediately Reflects Auto-Changes) */}
            <div className="rounded-lg border border-charcoal/15 bg-sand/30 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-charcoal">
                  Fulfillment Pipeline
                </h4>
                <span className="text-xs font-semibold text-charcoal/60">
                  Current Status: <strong className="text-charcoal uppercase">{item.orderStatus}</strong>
                </span>
              </div>

              {/* 5-Step Visual Flow */}
              <div className="relative pt-2 pb-4">
                <div className="flex items-center justify-between relative z-1">
                  {[
                    { key: "placed", label: "Placed", icon: "1" },
                    { key: "confirmed", label: "Confirmed", icon: "2" },
                    { key: "processing", label: "Processing", icon: "3" },
                    { key: "shipped", label: "Shipped", icon: "4" },
                    { key: "delivered", label: "Delivered", icon: "5" },
                  ].map((step, idx) => {
                    const stepNum = idx + 1;
                    const currentStepNum = STATUS_CONFIG[item.orderStatus]?.step || 1;
                    const isPassed = currentStepNum >= stepNum && item.orderStatus !== "cancelled";
                    const isCurrent = currentStepNum === stepNum && item.orderStatus !== "cancelled";

                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 text-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? "bg-vermilion text-ivory ring-4 ring-terai/30 shadow-md scale-110"
                              : isPassed
                              ? "bg-teal text-ivory"
                              : "bg-sand border border-charcoal/20 text-charcoal/50"
                          }`}
                        >
                          {isPassed && !isCurrent ? "✓" : step.icon}
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider mt-1.5 ${
                            isCurrent
                              ? "text-vermilion"
                              : isPassed
                              ? "text-teal"
                              : "text-charcoal/40"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status Change Action Panel (Auto Changes On Select) */}
            <div className="rounded-lg border border-charcoal/15 bg-ivory p-5 shadow-xs space-y-4">
              <div className="border-b border-charcoal/15 pb-2.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif text-base font-bold text-charcoal">
                    Update Craft Status
                  </h4>
                  <p className="text-xs text-charcoal/60 mt-0.5">
                    Select an option below to automatically update this order item
                  </p>
                </div>

                {!isTerminal && (
                  <div className="flex items-center gap-2 text-xs text-charcoal/70 bg-sand/40 px-3 py-1.5 rounded border border-charcoal/15">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-teal">
                      Select Option (Auto-Changes):
                    </span>
                    <select
                      disabled={isItemUpdating}
                      value={item.orderStatus}
                      onChange={(e) => applyAutoStatusChange(order, item, e.target.value, detailNote)}
                      className="bg-ivory border border-charcoal/20 rounded px-2 py-0.5 font-bold text-charcoal focus:border-teal focus:outline-none cursor-pointer"
                    >
                      {ALL_POSSIBLE_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Optional Tracking / Courier Input */}
              {!isTerminal && (
                <div className="bg-sand/30 p-3 rounded border border-charcoal/10 space-y-1">
                  <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">
                    Optional Courier / Tracking Note (Applied with next status):
                  </label>
                  <input
                    type="text"
                    value={detailNote}
                    onChange={(e) => setDetailNote(e.target.value)}
                    placeholder="e.g. Dispatched via Sundar Courier, Tracking #LK-9021"
                    className="w-full border border-charcoal/20 bg-ivory p-2 text-xs text-charcoal focus:border-teal focus:outline-none rounded"
                  />
                </div>
              )}

              {/* Action Buttons for Next Steps (Auto Changes On Click) */}
              {isTerminal ? (
                <div className="p-4 rounded bg-sand/30 border border-charcoal/15 text-center text-xs text-charcoal/70 font-semibold">
                  {item.orderStatus === "delivered" ? (
                    <span className="text-teal flex items-center justify-center gap-1.5 font-bold">
                      <span>✓</span> This craft has been fully delivered and verified. Fulfillment is completed.
                    </span>
                  ) : (
                    <span className="text-vermilion flex items-center justify-center gap-1.5 font-bold">
                      <span>✕</span> This craft order item has been cancelled. Reserved stock has been restored.
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
                    One-Click Auto Status Progression:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {nextOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isItemUpdating}
                        onClick={() => applyAutoStatusChange(order, item, opt.value, detailNote)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 ${
                          opt.variant === "danger"
                            ? "bg-transparent border border-vermilion/40 text-vermilion hover:bg-vermilion hover:text-ivory"
                            : "bg-teal hover:bg-charcoal text-ivory"
                        }`}
                      >
                        {isItemUpdating ? (
                          <span>Updating...</span>
                        ) : (
                          <>
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status History Audit Log (Live Updated) */}
            {item.statusHistory && item.statusHistory.length > 0 && (
              <div className="rounded-lg border border-charcoal/15 bg-sand/20 p-5 shadow-xs space-y-3">
                <h5 className="font-serif text-sm font-bold text-charcoal">
                  Fulfillment History & Status Log
                </h5>
                <div className="space-y-2.5 divide-y divide-charcoal/10">
                  {item.statusHistory.map((hist, idx) => (
                    <div key={idx} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold uppercase tracking-wider text-charcoal">
                          {hist.status}
                        </span>
                        {hist.note && (
                          <p className="text-charcoal/80 text-xs mt-0.5 leading-relaxed">
                            {hist.note}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-charcoal/50 shrink-0 font-mono">
                        {new Date(hist.updatedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════════ RIGHT COLUMN: Customer & Delivery Address Spotlight (5 Cols) ════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Customer Card */}
            <div className="rounded-lg border border-charcoal/15 bg-ivory p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-charcoal/10 pb-2">
                <span className="text-lg">👤</span>
                <h4 className="font-serif text-base font-bold text-charcoal">
                  Customer Information
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-charcoal/50 uppercase tracking-wider text-[10px] font-bold block">
                    Full Name
                  </span>
                  <span className="font-serif text-sm font-bold text-charcoal">
                    {order.customerName}
                  </span>
                </div>

                <div>
                  <span className="text-charcoal/50 uppercase tracking-wider text-[10px] font-bold block">
                    Contact Phone Number
                  </span>
                  {order.customerPhone ? (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="font-mono text-xs font-bold text-teal hover:underline inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <span>📞</span>
                      <span>{order.customerPhone}</span>
                      <span className="text-[10px] text-charcoal/40">(Click to Call)</span>
                    </a>
                  ) : (
                    <span className="text-charcoal/50 italic">Not provided</span>
                  )}
                </div>

                {order.customerEmail && (
                  <div>
                    <span className="text-charcoal/50 uppercase tracking-wider text-[10px] font-bold block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-xs text-charcoal/80 hover:text-teal underline"
                    >
                      {order.customerEmail}
                    </a>
                  </div>
                )}

                {order.orderNotes && (
                  <div className="pt-2 border-t border-charcoal/10">
                    <span className="text-charcoal/50 uppercase tracking-wider text-[10px] font-bold block">
                      Customer Instructions / Notes
                    </span>
                    <p className="text-charcoal/80 italic mt-0.5 leading-relaxed bg-sand/40 p-2 rounded">
                      "{order.orderNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Delivery Address Card */}
            <div className="rounded-lg border-2 border-teal/20 bg-teal/5 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-teal/20 pb-2">
                <span className="text-lg">📍</span>
                <h4 className="font-serif text-base font-bold text-charcoal">
                  Delivery Destination
                </h4>
              </div>

              <div className="space-y-2.5 text-xs text-charcoal">
                <div>
                  <span className="text-teal uppercase tracking-wider text-[10px] font-bold block">
                    Recipient
                  </span>
                  <p className="font-semibold">{order.deliveryAddress?.fullName || order.customerName}</p>
                  <p className="text-charcoal/70 font-mono">{order.deliveryAddress?.phone || order.customerPhone}</p>
                </div>

                <div>
                  <span className="text-teal uppercase tracking-wider text-[10px] font-bold block">
                    Street & Ward Address
                  </span>
                  <p className="font-semibold text-charcoal">
                    {order.deliveryAddress?.street}, Ward {order.deliveryAddress?.ward}
                  </p>
                </div>

                <div>
                  <span className="text-teal uppercase tracking-wider text-[10px] font-bold block">
                    Municipality & District
                  </span>
                  <p className="font-semibold text-charcoal">
                    {order.deliveryAddress?.municipality}, {order.deliveryAddress?.district}
                  </p>
                  <p className="text-charcoal/70">
                    {order.deliveryAddress?.province}, {order.deliveryAddress?.country || "Nepal"}
                  </p>
                </div>

                {order.deliveryAddress?.landmark && (
                  <div className="bg-sand/80 border border-charcoal/15 p-2 rounded">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-terai block">
                      Prominent Landmark
                    </span>
                    <p className="font-serif text-xs font-semibold text-charcoal mt-0.5">
                      {order.deliveryAddress.landmark}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Payment Info Card */}
            <div className="rounded-lg border border-charcoal/15 bg-ivory p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-charcoal/10 pb-2">
                <span className="text-lg">💵</span>
                <h4 className="font-serif text-base font-bold text-charcoal">
                  Payment Details
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal/70">Payment Method:</span>
                  <span className="font-bold text-charcoal bg-sand/60 px-2 py-0.5 rounded border border-charcoal/15">
                    {order.paymentMethod} (Cash On Delivery)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal/70">Payment Status:</span>
                  <span className="font-bold text-teal capitalize">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-charcoal/10 pt-2 font-bold">
                  <span className="text-charcoal font-serif">Item Subtotal:</span>
                  <span className="text-vermilion font-serif text-base">
                    Rs. {item.subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Orders Listing View
  // ─────────────────────────────────────────────────────────────────────────────
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

      {/* Success Toast */}
      {successToast && (
        <div className="rounded border border-teal/30 bg-teal/10 p-3 text-xs text-teal font-semibold flex items-center justify-between animate-fade-in">
          <span>✓ {successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast("")}
            className="text-teal hover:text-charcoal text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded border border-vermilion/30 bg-vermilion/10 p-3 text-xs text-vermilion font-semibold flex items-center justify-between animate-fade-in">
          <span>✕ {errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-vermilion hover:text-charcoal text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
                className={`rounded-lg border transition-all p-4 sm:p-5 space-y-4 ${
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
                        🔔 New Order
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
                  </div>
                </div>

                {/* Prominent Customer & Delivery Address Summary Card */}
                <div className="p-3 sm:p-3.5 rounded bg-ivory/80 border border-charcoal/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                      Customer
                    </span>
                    <p className="font-serif font-bold text-charcoal mt-0.5">
                      {order.customerName}
                    </p>
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-teal hover:underline font-mono font-semibold block mt-0.5"
                      >
                        📞 {order.customerPhone}
                      </a>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal block">
                      📍 Delivery Address
                    </span>
                    <p className="font-semibold text-charcoal mt-0.5">
                      {order.deliveryAddress?.street}, Ward {order.deliveryAddress?.ward},{" "}
                      {order.deliveryAddress?.municipality}, {order.deliveryAddress?.district}
                    </p>
                    {order.deliveryAddress?.landmark && (
                      <p className="text-[11px] text-charcoal/70 mt-0.5">
                        Landmark: <em>{order.deliveryAddress.landmark}</em>
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items from This Artisan Workshop */}
                <div className="space-y-3">
                  {order.vendorItems.map((rawItem, rawIdx) => {
                    // Always coerce _id to string to prevent ObjectId issues
                    const itemId = rawItem._id ? String(rawItem._id) : `item-${rawIdx}`;
                    const item = {
                      ...rawItem,
                      _id: itemId,
                      ...(optimisticOverrides[itemId] || {}),
                    };
                    const statusInfo = STATUS_CONFIG[item.orderStatus] || STATUS_CONFIG.placed;
                    const nextOptions = NEXT_STATUS_OPTIONS[item.orderStatus] || [];
                    const isItemUpdating = quickUpdateLoadingId === itemId;

                    return (
                      <div
                        key={itemId}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 rounded-lg bg-ivory border border-charcoal/10 hover:border-charcoal/25 transition-all"
                      >
                        {/* Clickable Product Info: Clicking Opens Detail Page */}
                        <div
                          onClick={() => setDetailViewIds({ orderId: String(order._id), itemId })}
                          className="flex items-center gap-3.5 cursor-pointer group flex-1 min-w-0"
                          title="Click to open full fulfillment details and change status"
                        >
                          <img
                            src={
                              item.productImage ||
                              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200"
                            }
                            alt={item.productName}
                            className="h-16 w-16 rounded object-cover border border-charcoal/15 shrink-0 bg-sand group-hover:opacity-90 group-hover:scale-105 transition-all shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-teal uppercase tracking-wider block">
                              Click to Inspect Details & Timeline ↗
                            </span>
                            <h5 className="font-serif text-sm font-bold text-charcoal group-hover:text-vermilion transition-colors truncate mt-0.5">
                              {item.productName}
                            </h5>
                            <p className="text-xs text-charcoal/70 mt-0.5">
                              Qty: <strong className="text-charcoal">{item.quantity}</strong> × Rs.{" "}
                              {item.unitPrice.toLocaleString()} ={" "}
                              <strong className="text-vermilion">
                                Rs. {item.subtotal.toLocaleString()}
                              </strong>
                            </p>
                            {item.cancellationReason && (
                              <p className="text-xs text-vermilion italic mt-0.5 truncate">
                                Cancelled: {item.cancellationReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Dual Control: Quick Dropdown Selector + Step Transition Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          {/* Current Status Pill */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusInfo.color}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                          </span>

                          {/* Inspect & Manage Order Button */}
                          <button
                            type="button"
                            onClick={() => setDetailViewIds({ orderId: order._id, itemId: item._id })}
                            className="border border-charcoal/20 bg-ivory hover:bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-wider text-charcoal rounded transition-colors cursor-pointer"
                          >
                            Inspect & Manage →
                          </button>

                          {/* Quick Dropdown Selector (Auto Changes On Selection) */}
                          {item.orderStatus !== "delivered" && item.orderStatus !== "cancelled" && (
                            <div className="flex items-center gap-1 border border-charcoal/20 bg-sand/30 rounded px-2 py-0.5">
                              <span className="text-[10px] font-semibold text-charcoal/60 uppercase">
                                Set:
                              </span>
                              <select
                                disabled={isItemUpdating}
                                value={item.orderStatus}
                                onChange={(e) => applyAutoStatusChange(order, item, e.target.value)}
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

                          {/* Direct Next Step Action Buttons (Auto Changes On Click) */}
                          {nextOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isItemUpdating}
                              onClick={() => applyAutoStatusChange(order, item, opt.value)}
                              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-50 ${
                                opt.variant === "danger"
                                  ? "border border-vermilion/30 text-vermilion hover:bg-vermilion hover:text-ivory"
                                  : "bg-teal hover:bg-charcoal text-ivory shadow-2xs"
                              }`}
                            >
                              {opt.icon} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: Professional Cancellation & Rejection Dialog                       */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {cancellationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-ivory border border-charcoal/20 max-w-lg w-full p-6 rounded-lg shadow-2xl space-y-4 animate-scale-up">
            {/* Modal Header */}
            <div className="border-b border-charcoal/15 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-vermilion">
                Artisan Order Cancellation
              </span>
              <h3 className="font-serif text-xl font-bold text-charcoal mt-1">
                Decline & Cancel Craft Item
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                For order <strong className="font-mono">{cancellationTarget.order.orderNumber}</strong> •{" "}
                {cancellationTarget.item.productName}
              </p>
            </div>

            {/* Customer & Delivery Context Preview */}
            <div className="rounded bg-sand/40 border border-charcoal/10 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Customer:</span>
                <span className="font-bold text-charcoal">{cancellationTarget.order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Phone:</span>
                <span className="font-mono text-charcoal">{cancellationTarget.order.customerPhone || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Destination:</span>
                <span className="text-charcoal font-medium text-right truncate max-w-[220px]">
                  {cancellationTarget.order.deliveryAddress?.municipality},{" "}
                  {cancellationTarget.order.deliveryAddress?.district}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded border border-vermilion/30 bg-vermilion/10 p-2.5 text-xs text-vermilion font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleConfirmCancellation} className="space-y-4">
              {/* Structured Reason Category */}
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Standard Cancellation Reason *
                </label>
                <select
                  value={selectedReasonCat}
                  onChange={(e) => handleReasonCatChange(e.target.value)}
                  className="w-full border border-charcoal/20 bg-ivory p-2.5 text-xs text-charcoal focus:border-vermilion focus:outline-none rounded font-medium"
                >
                  {PROFESSIONAL_CANCEL_REASONS.map((r) => (
                    <option key={r.category} value={r.category}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Polite Professional Message to Customer */}
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Professional Artisan Response to Customer *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationMessage}
                  onChange={(e) => setCancellationMessage(e.target.value)}
                  placeholder="Provide a polite explanation to the customer..."
                  className="w-full border border-charcoal/20 bg-ivory p-2.5 text-xs text-charcoal focus:border-vermilion focus:outline-none rounded leading-relaxed"
                />
                <p className="text-[11px] text-charcoal/60 mt-1">
                  This courteous note will be recorded on the customer's order tracking page.
                </p>
              </div>

              {/* Consequence Alert */}
              <div className="rounded border border-terai/40 bg-terai/10 p-3 text-[11px] text-charcoal/80 space-y-1">
                <span className="font-bold text-terai block uppercase tracking-wider">
                  ⚠️ Inventory & Order Impact:
                </span>
                <p>
                  • Reserved stock (Qty: {cancellationTarget.item.quantity}) will be immediately restored to your catalog.
                </p>
                <p>• The customer will be informed that this specific craft item could not be fulfilled.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setCancellationTarget(null)}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal/70 hover:text-charcoal border border-charcoal/20 rounded cursor-pointer"
                >
                  Keep Order Active
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-vermilion px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors rounded disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
