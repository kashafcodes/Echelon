import { useState, useEffect } from "react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { orderApi } from "../services/api.js";

/* ─── Helpers ─────────────────────────────────────────────── */
function getOrderIdFromHash() {
  const hash = window.location.hash; // e.g. "#order-confirmation?orderId=abc123"
  const qIdx = hash.indexOf("?");
  if (qIdx === -1) return null;
  return new URLSearchParams(hash.slice(qIdx + 1)).get("orderId");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAddress(addr) {
  if (!addr) return "—";
  const parts = [
    addr.street,
    addr.landmark,
    addr.ward ? `Ward ${addr.ward}` : null,
    addr.municipality,
    addr.district,
    addr.province,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}

/* ─── Skeleton ────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-charcoal/10 ${className}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-12 w-64 rounded-lg" />
      </div>

      {/* Card */}
      <div className="border border-charcoal/10 rounded-xl p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="border border-charcoal/10 rounded-xl p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function OrderConfirmationPage() {
  const { user, openLogin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = getOrderIdFromHash();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!orderId) {
      setError("No order ID found in the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    orderApi
      .getOrderById(orderId)
      .then((res) => {
        if (res?.ok && res.order) {
          setOrder(res.order);
        } else {
          setError(
            res?.message ||
              "Order not found. It may have been removed or you may not have permission to view it."
          );
        }
      })
      .catch(() =>
        setError(
          "Order not found. It may have been removed or you may not have permission to view it."
        )
      )
      .finally(() => setLoading(false));
  }, [orderId, user]);

  /* ── Not authenticated ── */
  if (!user && !loading) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="font-serif text-3xl text-charcoal mb-3">
            Please sign in
          </h1>
          <p className="text-sm text-charcoal/70 mb-8 max-w-sm">
            You need to be logged in to view your order confirmation.
          </p>
          <button
            onClick={openLogin}
            className="bg-vermilion text-ivory font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            Sign In
          </button>
        </main>
        <SiteFooter />
      </>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-ivory">
          <LoadingSkeleton />
        </main>
        <SiteFooter />
      </>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="text-5xl mb-6">📦</div>
          <h1 className="font-serif text-2xl text-charcoal mb-3">
            Order Not Found
          </h1>
          <p className="text-sm text-charcoal/70 mb-8 max-w-sm">{error}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#products"
              className="bg-vermilion text-ivory font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition text-sm"
            >
              Continue Shopping
            </a>
            <a
              href="#profile"
              className="border border-charcoal text-charcoal font-semibold px-5 py-2.5 rounded-lg hover:bg-charcoal/5 transition text-sm"
            >
              View My Orders
            </a>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  /* ── Derived values ── */
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1),
    0
  );
  const deliveryFee = 0; // Free delivery
  const total = order.totalAmount ?? subtotal + deliveryFee;

  /* ── Build display order number ── */
  const rawId = (order._id || orderId || "").toString();
  const shortId = rawId.slice(-8).toUpperCase();
  const displayOrderNumber =
    order.orderNumber ||
    `LK-${shortId.slice(0, 4)}-${shortId.slice(4, 8)}`;

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-ivory pb-20">
        <div className="max-w-2xl mx-auto px-4 pt-14">

          {/* ── Success Hero ──────────────────────────────── */}
          <section className="flex flex-col items-center text-center mb-10">
            {/* Checkmark circle */}
            <div className="w-20 h-20 rounded-full bg-teal flex items-center justify-center mb-6 shadow-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-ivory"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 className="font-serif text-3xl text-charcoal mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-sm text-charcoal/70 mb-6">
              Thank you for supporting local artisans.
            </p>

            {/* Order number highlight box */}
            <div className="bg-terai/20 border border-terai/40 rounded-xl px-6 py-3">
              <p className="text-xs text-charcoal/60 uppercase tracking-widest mb-1 font-sans">
                Order Number
              </p>
              <p className="font-mono text-xl font-semibold text-charcoal tracking-wider">
                {displayOrderNumber}
              </p>
            </div>
          </section>

          {/* ── Order Details Card ────────────────────────── */}
          <section className="border border-charcoal/10 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/10 bg-sand/40">
              <h2 className="font-serif text-lg text-charcoal">Order Details</h2>
            </div>
            <dl className="divide-y divide-charcoal/8">
              <div className="flex justify-between items-center px-5 py-3">
                <dt className="text-sm text-charcoal/60">Order Number</dt>
                <dd className="font-mono text-sm text-charcoal font-medium">
                  {displayOrderNumber}
                </dd>
              </div>
              <div className="flex justify-between items-center px-5 py-3">
                <dt className="text-sm text-charcoal/60">Order Date</dt>
                <dd className="text-sm text-charcoal">
                  {formatDate(order.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between items-center px-5 py-3">
                <dt className="text-sm text-charcoal/60">Order Status</dt>
                <dd>
                  <span className="bg-teal/15 text-teal text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {order.status ?? "Placed"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between items-center px-5 py-3">
                <dt className="text-sm text-charcoal/60">Payment Method</dt>
                <dd className="text-sm text-charcoal">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : order.paymentMethod ?? "Cash on Delivery"}
                </dd>
              </div>
              <div className="flex justify-between items-center px-5 py-3">
                <dt className="text-sm text-charcoal/60">Payment Status</dt>
                <dd>
                  <span className="bg-terai/20 text-charcoal/70 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {order.paymentStatus ?? "Pending"}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          {/* ── Items Ordered ─────────────────────────────── */}
          <section className="border border-charcoal/10 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-charcoal/10 bg-sand/40">
              <h2 className="font-serif text-lg text-charcoal">Items Ordered</h2>
            </div>

            <ul className="divide-y divide-charcoal/8">
              {items.map((item, idx) => {
                const unitPrice = item.unitPrice ?? item.price ?? 0;
                const qty = item.quantity ?? 1;
                const lineTotal = unitPrice * qty;
                const imgSrc =
                  (item.images && item.images[0]) ||
                  item.image ||
                  item.product?.images?.[0] ||
                  null;
                const productName =
                  item.name ||
                  item.productName ||
                  item.product?.name ||
                  "Product";
                const artisanName =
                  item.artisanName ||
                  item.vendor?.businessName ||
                  item.product?.artisanName ||
                  null;

                return (
                  <li key={item._id ?? idx} className="flex gap-4 px-5 py-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-sand flex-shrink-0 overflow-hidden border border-charcoal/10">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🎨
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal leading-tight truncate">
                        {productName}
                      </p>
                      {artisanName && (
                        <p className="text-xs text-charcoal/55 mt-0.5">
                          by {artisanName}
                        </p>
                      )}
                      <p className="text-xs text-charcoal/60 mt-1.5">
                        {qty} × NPR {unitPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Line total */}
                    <div className="text-sm font-semibold text-charcoal whitespace-nowrap self-center">
                      NPR {lineTotal.toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* ── Price Summary ── */}
            <div className="border-t border-charcoal/10 px-5 py-4 bg-sand/20 space-y-2">
              <div className="flex justify-between text-sm text-charcoal/70">
                <span>Subtotal</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-charcoal/70">
                <span>Delivery Fee</span>
                <span className="text-teal font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-charcoal border-t border-charcoal/10 pt-2 mt-1">
                <span>Total Amount</span>
                <span className="text-vermilion">
                  NPR {total.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* ── Delivery Address ──────────────────────────── */}
          {order.deliveryAddress && (
            <section className="border border-charcoal/10 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
              <div className="px-5 py-4 border-b border-charcoal/10 bg-sand/40">
                <h2 className="font-serif text-lg text-charcoal">
                  Delivery Address
                </h2>
              </div>
              <div className="px-5 py-4">
                {/* Recipient name */}
                {order.deliveryAddress.name && (
                  <p className="text-sm font-semibold text-charcoal mb-1">
                    {order.deliveryAddress.name}
                  </p>
                )}
                {order.deliveryAddress.phone && (
                  <p className="text-xs text-charcoal/60 mb-2">
                    📞 {order.deliveryAddress.phone}
                  </p>
                )}
                <p className="text-sm text-charcoal/75 leading-relaxed">
                  {formatAddress(order.deliveryAddress)}
                </p>
              </div>
            </section>
          )}

          {/* ── CTA Buttons ───────────────────────────────── */}
          <section className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href="#products"
              className="flex-1 text-center bg-vermilion text-ivory font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition text-sm"
            >
              Continue Shopping
            </a>
            <a
              href="#profile"
              className="flex-1 text-center border border-charcoal text-charcoal font-semibold px-5 py-3 rounded-lg hover:bg-charcoal/5 transition text-sm"
            >
              View My Orders
            </a>
          </section>

          {/* ── Support Note ──────────────────────────────── */}
          <section className="border-t border-charcoal/10 pt-6 text-center">
            <p className="text-xs text-charcoal/55">
              For any questions about your order, contact us at{" "}
              <a
                href="mailto:support@lokart.com"
                className="text-teal underline underline-offset-2 hover:opacity-80 transition"
              >
                support@lokart.com
              </a>
            </p>
          </section>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}
