import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import AddressForm from "../components/auth/AddressForm.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const CATEGORIES = [
  "Mithila Art",
  "Bamboo Crafts",
  "Pottery & Clay Work",
  "Handmade Jewelry",
  "Leaf Crafts",
  "Handmade Decor",
  "Paintings and Sketches",
  "Traditional Crafts",
  "Crochet & Weaving",
  "Custom Creations",
];

export default function VendorDashboard() {
  const { user, vendor, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState(vendor?.businessName || "");
  const [description, setDescription] = useState(vendor?.description || "");
  const [category, setCategory] = useState(vendor?.category || CATEGORIES[0]);
  const [businessAddress, setBusinessAddress] = useState(
    vendor?.businessAddress || user?.address || {},
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const status = vendor?.verificationStatus || "pending";
  const isApproved = status === "approved";
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile({
        businessName,
        description,
        category,
        businessAddress,
      });
      setMessage("Vendor business profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update vendor profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col justify-between bg-ivory">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-vermilion px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-ivory">
                Artisan Studio
              </span>
              {isApproved ? (
                <span className="rounded bg-teal/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal">
                  Verified Partner
                </span>
              ) : isPending ? (
                <span className="rounded bg-terai/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-terai">
                  Verification Pending
                </span>
              ) : (
                <span className="rounded bg-vermilion/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-vermilion">
                  Application Rejected
                </span>
              )}
            </div>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              {vendor?.businessName || user?.name + " Studio"}
            </h1>
            <p className="mt-1 text-sm text-charcoal/80">
              Artisan partner portal for managing traditional crafts, verification and workshop orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#products"
              className="border border-charcoal/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Public Marketplace
            </a>
            <button
              type="button"
              onClick={logout}
              className="border border-charcoal/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="mt-6">
          {isPending ? (
            <div className="rounded border-2 border-terai bg-terai/10 p-5 text-charcoal shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none text-terai">⚠️</span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Vendor Verification Status: Pending Admin Review
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/85 leading-relaxed">
                    Your artisan application has been submitted to LokArt administrators. To maintain
                    authentic Terai craftsmanship and prevent unauthorized listings,{" "}
                    <strong>a pending vendor must not publish products until verified and approved</strong>.
                    Our team in Parsa will review your craft details shortly.
                  </p>
                </div>
              </div>
            </div>
          ) : isApproved ? (
            <div className="rounded border border-teal/40 bg-teal/10 p-5 text-charcoal shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none text-teal">✓</span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-teal">
                    Verification Approved — Verified Artisan Partner
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/85 leading-relaxed">
                    Your craft studio is officially verified on LokArt. You can publish authenticated
                    creations, set prices, and receive direct cash-on-delivery orders from customers.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-vermilion/40 bg-vermilion/10 p-5 text-charcoal shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none text-vermilion">✕</span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-vermilion">
                    Verification Status: Application Rejected
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/85 leading-relaxed">
                    Your vendor application could not be verified with the provided information. Please
                    update your business description or contact us at{" "}
                    <a href="mailto:support@lokart.com" className="underline font-semibold">
                      support@lokart.com
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {message ? (
          <div className="mt-4 rounded border border-teal/30 bg-teal/10 p-4 text-sm text-teal">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded border border-vermilion/30 bg-vermilion/10 p-4 text-sm text-vermilion">
            {error}
          </div>
        ) : null}

        {/* Dashboard Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Left Column: Vendor Profile */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/40 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-xl text-charcoal">Studio Details</h3>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-teal font-semibold hover:underline uppercase tracking-wider"
                  >
                    Edit
                  </button>
                ) : null}
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Artisan Contact
                  </span>
                  <p className="font-medium text-charcoal">{user?.name}</p>
                  <p className="text-xs text-charcoal/70">{user?.phone}</p>
                  <p className="text-xs text-charcoal/70">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Product Category
                  </span>
                  <p className="font-medium text-charcoal">{vendor?.category || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Craft Description
                  </span>
                  <p className="text-xs text-charcoal/80 leading-relaxed mt-1">
                    {vendor?.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Workshop Address Card */}
            <div className="rounded border border-charcoal/15 bg-sand/30 p-6 shadow-xs">
              <h4 className="font-serif text-lg text-charcoal">Workshop Location</h4>
              <div className="mt-3 text-xs text-charcoal/80 space-y-1">
                <p className="font-medium text-sm text-charcoal">
                  {vendor?.businessAddress?.street}, Ward {vendor?.businessAddress?.ward}
                </p>
                <p>{vendor?.businessAddress?.municipality}</p>
                <p>
                  {vendor?.businessAddress?.district}, {vendor?.businessAddress?.province}
                </p>
                {vendor?.businessAddress?.landmark ? (
                  <p className="text-charcoal/60 italic">
                    Near: {vendor?.businessAddress?.landmark}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column: Creations Management or Edit Form */}
          <div className="md:col-span-2 space-y-6">
            {isEditing ? (
              <form
                onSubmit={handleSave}
                className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                  <h3 className="font-serif text-2xl text-charcoal">Edit Studio Profile</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-charcoal/60 hover:text-charcoal"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Business / Shop Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Primary Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Description & Craft Heritage
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-none"
                  />
                </div>

                <AddressForm
                  title="Workshop Address"
                  subtitle="Physical location where creations are crafted"
                  value={businessAddress}
                  onChange={setBusinessAddress}
                  disabled={saving}
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-vermilion px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Studio Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Product Publishing Section */}
                <div className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/10 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl text-charcoal">Your Craft Catalog</h3>
                      <p className="text-xs text-charcoal/70">
                        Manage products listed under {vendor?.businessName}.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!isApproved}
                      className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors ${
                        isApproved
                          ? "bg-vermilion hover:bg-charcoal cursor-pointer"
                          : "bg-charcoal/40 cursor-not-allowed"
                      }`}
                      title={
                        !isApproved
                          ? "Publishing is disabled until your artisan account is approved by admin"
                          : ""
                      }
                    >
                      + Add New Creation
                    </button>
                  </div>

                  {!isApproved ? (
                    <div className="mt-8 border border-dashed border-terai/40 bg-sand/40 p-8 text-center rounded">
                      <p className="text-sm font-semibold text-charcoal">
                        Product Publishing Locked
                      </p>
                      <p className="mt-1 text-xs text-charcoal/70 max-w-md mx-auto leading-relaxed">
                        To protect traditional artisans and ensure genuine creations, only verified
                        vendors can list products. Once an administrator approves your studio, you will
                        be able to add photos, descriptions, and prices.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-8 border border-dashed border-charcoal/20 p-8 text-center rounded">
                      <p className="text-sm text-charcoal/80">No creations listed yet.</p>
                      <p className="mt-1 text-xs text-charcoal/60">
                        Click &ldquo;+ Add New Creation&rdquo; above to list your first traditional handcrafted
                        product.
                      </p>
                    </div>
                  )}
                </div>

                {/* Sales Analytics Preview */}
                <div className="rounded border border-charcoal/15 bg-sand/30 p-6 shadow-xs">
                  <h4 className="font-serif text-xl text-charcoal">Studio Analytics</h4>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="rounded border border-charcoal/10 bg-ivory p-4">
                      <span className="text-xs uppercase text-charcoal/60 tracking-wider">
                        Active Listings
                      </span>
                      <p className="font-serif text-2xl text-charcoal mt-1">0</p>
                    </div>
                    <div className="rounded border border-charcoal/10 bg-ivory p-4">
                      <span className="text-xs uppercase text-charcoal/60 tracking-wider">
                        Pending Orders
                      </span>
                      <p className="font-serif text-2xl text-teal mt-1">0</p>
                    </div>
                    <div className="rounded border border-charcoal/10 bg-ivory p-4">
                      <span className="text-xs uppercase text-charcoal/60 tracking-wider">
                        Total Revenue
                      </span>
                      <p className="font-serif text-2xl text-vermilion mt-1">Rs. 0</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
