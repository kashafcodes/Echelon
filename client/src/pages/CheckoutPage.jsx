import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { orderApi } from "../services/api.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

/* ─── tiny helpers ─────────────────────────────────────────────── */
const navigate = (hash) => {
  window.location.hash = hash;
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-ivory inline-block mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* ─── field component ───────────────────────────────────────────── */
function Field({ label, id, required, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-charcoal/70 uppercase tracking-wider">
        {label}
        {required && <span className="text-vermilion ml-0.5">*</span>}
      </label>
      <input
        id={id}
        className={[
          "border rounded px-3 py-2 text-sm text-charcoal bg-ivory placeholder:text-charcoal/40",
          "focus:outline-none focus:ring-2 focus:ring-teal/40 transition",
          error ? "border-vermilion" : "border-charcoal/20",
          inputProps.readOnly ? "opacity-60 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...inputProps}
      />
      {error && (
        <p className="text-xs text-vermilion mt-0.5">{error}</p>
      )}
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, openLogin } = useAuth();

  /* ── auth guard ── */
  useEffect(() => {
    if (!user) {
      navigate("top");
      openLogin?.();
    }
  }, [user, openLogin]);

  /* ── delivery address state ── */
  const addr = user?.address || {};
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    country: "Nepal",
    province: addr.province || "",
    district: addr.district || "",
    municipality: addr.municipality || "",
    ward: addr.ward || "",
    street: addr.street || "",
    landmark: addr.landmark || "",
  });
  const [errors, setErrors] = useState({});

  /* ── payment ── */
  const [paymentMethod] = useState("COD");

  /* ── submission ── */
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  /* ── keep form in sync if user loads async ── */
  useEffect(() => {
    if (!user) return;
    const a = user.address || {};
    setForm((prev) => ({
      fullName: prev.fullName || user.name || "",
      phone: prev.phone || user.phone || "",
      country: "Nepal",
      province: prev.province || a.province || "",
      district: prev.district || a.district || "",
      municipality: prev.municipality || a.municipality || "",
      ward: prev.ward || a.ward || "",
      street: prev.street || a.street || "",
      landmark: prev.landmark || a.landmark || "",
    }));
  }, [user]);

  if (!user) return null; // redirect in-flight

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const required = ["fullName", "phone", "province", "district", "municipality", "ward", "street"];
    const next = {};
    required.forEach((key) => {
      if (!form[key]?.trim()) {
        const labels = {
          fullName: "Full name",
          phone: "Phone number",
          province: "Province",
          district: "District",
          municipality: "Municipality / Rural Municipality",
          ward: "Ward number",
          street: "Street / Tole / Area",
        };
        next[key] = `${labels[key]} is required.`;
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async () => {
    setApiError("");
    if (!validate()) return;

    const payload = {
      items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })),
      deliveryAddress: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        country: form.country,
        province: form.province.trim(),
        district: form.district.trim(),
        municipality: form.municipality.trim(),
        ward: form.ward.trim(),
        street: form.street.trim(),
        landmark: form.landmark.trim(),
      },
      paymentMethod: "COD",
    };

    try {
      setSubmitting(true);
      const data = await orderApi.placeOrder(payload);
      clearCart();
      navigate(`order-confirmation?orderId=${data.order?._id || data._id}`);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── empty cart ───────────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-20 w-20 text-charcoal/20" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1.2}>
              <path d="M8 8h6l6 32h28l4-20H18" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="26" cy="52" r="3" />
              <circle cx="44" cy="52" r="3" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Your cart is empty</h2>
          <p className="text-sm text-charcoal/70 max-w-sm mb-8">
            Browse our artisan marketplace to discover unique handcrafted items.
          </p>
          <a
            href="#products"
            className="inline-block bg-vermilion text-ivory px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition rounded"
          >
            Explore Products
          </a>
        </main>
        <SiteFooter />
      </div>
    );
  }

  /* ─── main layout ──────────────────────────────────────────────── */
  const subtotal = cartTotal;

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* page title */}
        <h1 className="font-serif text-3xl text-charcoal mb-8 tracking-tight">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* ══════════════════ LEFT COLUMN ══════════════════ */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* ── API error banner ── */}
            {apiError && (
              <div className="flex items-start gap-3 bg-vermilion/8 border border-vermilion/30 rounded px-4 py-3">
                <svg className="h-4 w-4 text-vermilion mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V7h2v2H9zm0 4v-2h2v2H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-vermilion">{apiError}</p>
              </div>
            )}

            {/* ─── DELIVERY ADDRESS ─────────────────────────── */}
            <section>
              <h2 className="font-serif text-xl text-charcoal mb-5">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field
                    label="Full Name"
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Ramesh Kumar Thapa"
                    required
                    error={errors.fullName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Phone Number"
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    required
                    error={errors.phone}
                  />
                </div>

                <Field
                  label="Country"
                  id="country"
                  name="country"
                  value={form.country}
                  readOnly
                />

                <Field
                  label="Province"
                  id="province"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  placeholder="e.g. Bagmati"
                  required
                  error={errors.province}
                />

                <Field
                  label="District"
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu"
                  required
                  error={errors.district}
                />

                <Field
                  label="Municipality / Rural Municipality"
                  id="municipality"
                  name="municipality"
                  value={form.municipality}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu Metropolitan"
                  required
                  error={errors.municipality}
                />

                <Field
                  label="Ward Number"
                  id="ward"
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  required
                  error={errors.ward}
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Street / Tole / Area"
                    id="street"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="e.g. New Baneshwor, Opposite to …"
                    required
                    error={errors.street}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Landmark (optional)"
                    id="landmark"
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="e.g. Near Pashupatinath Temple"
                  />
                </div>
              </div>
            </section>

            {/* ─── PAYMENT METHOD ───────────────────────────── */}
            <section className="border-t border-charcoal/10 pt-8">
              <h2 className="font-serif text-xl text-charcoal mb-5">Payment Method</h2>

              {/* single COD card */}
              <label
                htmlFor="cod"
                className="flex items-start gap-4 border-2 border-teal bg-teal/5 rounded-lg px-5 py-4 cursor-pointer select-none"
              >
                {/* custom radio dot */}
                <span className="mt-0.5 h-4 w-4 rounded-full border-2 border-teal flex items-center justify-center shrink-0">
                  <span className="h-2 w-2 rounded-full bg-teal block" />
                </span>
                <input id="cod" type="radio" name="payment" value="COD" defaultChecked className="sr-only" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">Cash on Delivery</p>
                  <p className="text-xs text-charcoal/70 mt-0.5">Pay when your order arrives at your door.</p>
                  <p className="text-xs text-charcoal/60 mt-0.5">Accepted across Nepal.</p>
                </div>
              </label>

              <p className="mt-3 text-xs text-charcoal/50 italic">
                LokArt currently supports Cash on Delivery. Online payment coming soon.
              </p>
            </section>
          </div>

          {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-6 bg-white border border-charcoal/10 rounded-xl shadow-sm overflow-hidden">
              {/* header */}
              <div className="px-6 py-4 border-b border-charcoal/10">
                <h2 className="font-serif text-lg text-charcoal">Order Summary</h2>
                <p className="text-xs text-charcoal/50 mt-0.5">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </p>
              </div>

              {/* items list */}
              <ul className="divide-y divide-charcoal/8 max-h-72 overflow-y-auto">
                {cart.map((item) => (
                  <li key={item._id} className="flex gap-3 px-6 py-3 items-start">
                    {/* thumbnail */}
                    <div className="h-10 w-10 rounded shrink-0 overflow-hidden bg-sand border border-charcoal/10">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-charcoal/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-charcoal truncate">{item.name}</p>
                      {item.artisanName && (
                        <p className="text-xs text-charcoal/50 truncate">{item.artisanName}</p>
                      )}
                      <p className="text-xs text-charcoal/70 mt-0.5">
                        {item.quantity} × NPR {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* subtotal */}
                    <p className="text-xs font-semibold text-charcoal shrink-0 ml-2 mt-0.5">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>

              {/* totals */}
              <div className="px-6 py-4 border-t border-charcoal/10 space-y-2">
                <div className="flex justify-between text-sm text-charcoal/70">
                  <span>Subtotal</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-charcoal/70">
                  <span>Delivery Fee</span>
                  <span className="text-teal font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-charcoal border-t border-charcoal/10 pt-3 mt-1">
                  <span>Grand Total</span>
                  <span className="text-vermilion text-base">NPR {subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full bg-vermilion text-ivory py-4 text-xs font-semibold uppercase tracking-widest hover:opacity-90 active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed rounded flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Spinner />
                      Placing Order…
                    </>
                  ) : (
                    `Place Order — NPR ${subtotal.toLocaleString()}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
