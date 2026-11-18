import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import AddressForm from "../components/auth/AddressForm.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import ProductFormModal from "../components/ProductFormModal.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import VendorOrdersSection from "../components/vendor/VendorOrdersSection.jsx";
import VendorCommissionSection from "../components/vendor/VendorCommissionSection.jsx";
import VendorStoriesSection from "../components/vendor/VendorStoriesSection.jsx";
import { vendorProductApi, orderApi } from "../services/api.js";

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

  // Profile Edit State
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

  // Product Management State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const status = vendor?.verificationStatus || "pending";
  const isApproved = status === "approved";
  const isPending = status === "pending";

  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'orders'

  // Vendor Orders State
  const [orders, setOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSort, setOrderSort] = useState("newest");

  // Fetch Vendor Orders
  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await orderApi.getVendorOrders({
        status: orderStatusFilter,
        search: orderSearch,
        sort: orderSort,
      });
      if (res?.ok) {
        setOrders(res.orders || []);
        setOrderCounts(res.counts || {});
      }
    } catch (err) {
      console.warn("Failed to load vendor orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [orderStatusFilter, orderSearch, orderSort]);

  // Initial and periodic fetch of orders to power new order notification alerts
  useEffect(() => {
    loadOrders();
    // Poll every 30 seconds for new customer orders
    const timer = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const handleUpdateItemStatus = async (orderId, itemId, payload) => {
    const res = await orderApi.updateVendorItemStatus(orderId, itemId, payload);
    if (res?.ok) {
      setMessage(res.message);
      loadOrders();
    }
  };

  // Fetch Vendor Products
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await vendorProductApi.getProducts();
      if (res?.ok) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.warn("Failed to load vendor products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSaveProfile = async (e) => {
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

  // Toggle publish state
  const handleTogglePublish = async (productId) => {
    try {
      setMessage("");
      const res = await vendorProductApi.togglePublish(productId);
      if (res?.ok) {
        setMessage(res.message);
        loadProducts();
      }
    } catch (err) {
      setError(err.message || "Failed to change publication status.");
    }
  };

  // Delete product confirmation
  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    try {
      setMessage("");
      const res = await vendorProductApi.deleteProduct(deletingProductId);
      if (res?.ok) {
        setMessage("Product deleted from your catalog.");
        loadProducts();
      }
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  // Inventory Metrics
  const activeCount = products.filter((p) => p.isPublished && p.status === "published").length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  return (
    <div id="top" className="min-h-screen flex flex-col justify-between bg-ivory">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex-1">
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
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              {vendor?.businessName || user?.name + " Studio"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-charcoal/80">
              Artisan partner portal for managing traditional crafts, inventory quantity, and workshop listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {vendor?._id && (
              <a
                href={`#artisan?id=${vendor._id}`}
                className="border border-teal/40 bg-teal/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal hover:bg-teal hover:text-ivory transition-colors"
              >
                View Public Studio
              </a>
            )}
            <a
              href="#products"
              className="border border-charcoal/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Public Marketplace
            </a>
            <button
              type="button"
              onClick={logout}
              className="border border-charcoal/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Verification Alert Banners */}
        <div className="mt-6">
          {isPending ? (
            <div className="rounded border-2 border-terai bg-terai/10 p-5 text-charcoal shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none text-terai">⚠️</span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Vendor Verification: Under Administrator Review
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/85 leading-relaxed">
                    Your artisan application has been submitted to LokArt administrators. To maintain
                    authentic Terai craftsmanship, products you create remain in <strong>Pending Status</strong> until your studio is approved.
                  </p>
                </div>
              </div>
            </div>
          ) : isApproved ? (
            <div className="rounded border border-teal/40 bg-teal/10 p-4 text-charcoal shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl text-teal">✓</span>
                <div>
                  <h4 className="font-serif text-sm font-bold text-teal">
                    Verified LokArt Artisan Studio
                  </h4>
                  <p className="text-xs text-charcoal/80">
                    Your workshop is verified. You can list creations, upload photos, manage inventory, and publish pieces directly to the public homepage.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Status Messages */}
        {message ? (
          <div className="mt-4 rounded border border-teal/30 bg-teal/10 p-3.5 text-xs font-semibold text-teal flex items-center justify-between">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="text-teal/70 hover:text-teal font-bold">✕</button>
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded border border-vermilion/30 bg-vermilion/10 p-3.5 text-xs font-semibold text-vermilion flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="text-vermilion/70 hover:text-vermilion font-bold">✕</button>
          </div>
        ) : null}

        {/* Real-time New Orders Alert Banner */}
        {orderCounts.placed > 0 && (
          <div className="mt-6 rounded border-2 border-vermilion bg-vermilion/10 p-4 text-charcoal shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vermilion text-ivory text-xl font-bold animate-bounce">
                🔔
              </span>
              <div>
                <h4 className="font-serif text-base font-bold text-vermilion">
                  You have {orderCounts.placed} new customer order{orderCounts.placed > 1 ? "s" : ""} awaiting confirmation!
                </h4>
                <p className="text-xs text-charcoal/80">
                  Customers have purchased items crafted by your studio. Please review and confirm them to commence processing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                setOrderStatusFilter("placed");
              }}
              className="bg-vermilion hover:bg-charcoal text-ivory px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              Review New Orders ({orderCounts.placed})
            </button>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="mt-8 flex items-center gap-4 border-b border-charcoal/15 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "catalog"
                ? "border-b-2 border-vermilion text-vermilion font-bold"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Craft Creations Catalog ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-b-2 border-vermilion text-vermilion font-bold"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            <span>Customer Orders</span>
            {orderCounts.placed > 0 ? (
              <span className="rounded-full bg-vermilion px-2 py-0.5 text-[10px] font-bold text-ivory animate-pulse">
                {orderCounts.placed} NEW
              </span>
            ) : orderCounts.total > 0 ? (
              <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-ivory">
                {orderCounts.total}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commission")}
            className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "commission"
                ? "border-b-2 border-vermilion text-vermilion font-bold"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            <span>Artisan Earnings & Commission</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stories")}
            className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "stories"
                ? "border-b-2 border-vermilion text-vermilion font-bold"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            <span>Craft Stories</span>
          </button>
        </div>

        {/* Tab 1: Orders Management View */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-6">
            {/* Orders Filter & Search Controls */}
            <div className="rounded border border-charcoal/15 bg-sand/30 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order number..."
                  className="rounded border border-charcoal/20 bg-ivory px-3 py-1.5 text-xs text-charcoal focus:border-teal focus:outline-none w-56"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="rounded border border-charcoal/20 bg-ivory px-3 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="placed">Placed (New)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={orderSort}
                  onChange={(e) => setOrderSort(e.target.value)}
                  className="rounded border border-charcoal/20 bg-ivory px-3 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:outline-none"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>

              <button
                type="button"
                onClick={loadOrders}
                className="border border-charcoal/20 bg-ivory hover:bg-sand px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors rounded"
              >
                Refresh Orders
              </button>
            </div>

            <VendorOrdersSection
              orders={orders}
              counts={orderCounts}
              onUpdateStatus={handleUpdateItemStatus}
              loading={loadingOrders}
            />
          </div>
        )}

        {/* Tab 3: Commission & Earnings View */}
        {activeTab === "commission" && (
          <div className="mt-6">
            <VendorCommissionSection />
          </div>
        )}

        {/* Tab 4: Craft Stories View */}
        {activeTab === "stories" && (
          <div className="mt-6">
            <VendorStoriesSection products={products} />
          </div>
        )}

        {/* Tab 2: Catalog & Studio Profile (Original View) */}
        {activeTab === "catalog" && (
          <>
            {/* Inventory & Analytics Cards */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded border border-charcoal/15 bg-sand/40 p-4">
            <span className="text-[10px] uppercase font-bold text-charcoal/60 tracking-wider">
              Total Creations
            </span>
            <p className="font-serif text-2xl font-bold text-charcoal mt-1">
              {products.length}
            </p>
          </div>
          <div className="rounded border border-charcoal/15 bg-sand/40 p-4">
            <span className="text-[10px] uppercase font-bold text-teal tracking-wider">
              Live in Store
            </span>
            <p className="font-serif text-2xl font-bold text-teal mt-1">
              {activeCount}
            </p>
          </div>
          <div className="rounded border border-charcoal/15 bg-sand/40 p-4">
            <span className="text-[10px] uppercase font-bold text-terai tracking-wider">
              Low Stock Alerts
            </span>
            <p className="font-serif text-2xl font-bold text-terai mt-1">
              {lowStockCount}
            </p>
          </div>
          <div className="rounded border border-charcoal/15 bg-sand/40 p-4">
            <span className="text-[10px] uppercase font-bold text-vermilion tracking-wider">
              Out of Stock
            </span>
            <p className="font-serif text-2xl font-bold text-vermilion mt-1">
              {outOfStockCount}
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Left Column: Studio Details */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded border border-charcoal/15 bg-sand/40 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                <h3 className="font-serif text-xl font-bold text-charcoal">Studio Details</h3>
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

              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block font-bold">
                    Lead Artisan
                  </span>
                  <p className="font-medium text-charcoal">{user?.name}</p>
                  <p className="text-xs text-charcoal/70">{user?.phone}</p>
                  <p className="text-xs text-charcoal/70">{user?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block font-bold">
                    Primary Craft Discipline
                  </span>
                  <p className="font-medium text-charcoal">{vendor?.category || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal/60 uppercase tracking-wider block font-bold">
                    Craft Mission & Description
                  </span>
                  <p className="text-xs text-charcoal/80 leading-relaxed mt-1">
                    {vendor?.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Workshop Address Card */}
            <div className="rounded border border-charcoal/15 bg-sand/30 p-6 shadow-xs">
              <h4 className="font-serif text-lg font-bold text-charcoal">Workshop Location</h4>
              <div className="mt-3 text-xs text-charcoal/80 space-y-1">
                <p className="font-medium text-sm text-charcoal">
                  {vendor?.businessAddress?.street}, Ward {vendor?.businessAddress?.ward}
                </p>
                <p>{vendor?.businessAddress?.municipality}</p>
                <p>
                  {vendor?.businessAddress?.district}, {vendor?.businessAddress?.province}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Catalog Management or Profile Form */}
          <div className="md:col-span-2 space-y-6">
            {isEditing ? (
              <form
                onSubmit={handleSaveProfile}
                className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
                  <h3 className="font-serif text-2xl font-bold text-charcoal">Edit Studio Profile</h3>
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
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
                    Primary Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
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
                    className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2 text-sm text-charcoal focus:border-teal focus:outline-hidden"
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
              /* Products Management Section */
              <div className="rounded border border-charcoal/15 bg-ivory p-6 shadow-xs space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/10 pb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Your Craft Catalog</h3>
                    <p className="text-xs text-charcoal/70">
                      Manage inventory quantities, photos, and public visibility.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductFormOpen(true);
                    }}
                    className="bg-vermilion hover:bg-charcoal text-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    + Add New Creation
                  </button>
                </div>

                {/* Product Items List */}
                {loadingProducts ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-sand/40 animate-pulse rounded border border-charcoal/10" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="border border-dashed border-charcoal/20 p-8 text-center rounded bg-sand/20">
                    <span className="text-3xl">🎨</span>
                    <p className="text-sm font-semibold text-charcoal mt-2">No creations listed yet</p>
                    <p className="mt-1 text-xs text-charcoal/60 max-w-sm mx-auto">
                      Click &ldquo;+ Add New Creation&rdquo; above to list your first traditional handcrafted product.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-charcoal/10">
                    {products.map((p) => {
                      const isOutOfStock = p.quantity === 0;
                      return (
                        <div key={p._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                          {/* Image & Basic Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop&q=80"}
                              alt={p.name}
                              className="h-16 w-16 rounded object-cover border border-charcoal/15 bg-sand shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold text-teal uppercase tracking-wider">
                                  {p.category}
                                </span>
                                {/* Publication Status Pill */}
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                    p.isPublished && p.status === "published"
                                      ? "bg-teal/15 text-teal"
                                      : p.status === "pending"
                                        ? "bg-terai/20 text-terai"
                                        : p.status === "rejected"
                                          ? "bg-vermilion/15 text-vermilion"
                                          : "bg-charcoal/10 text-charcoal/70"
                                  }`}
                                >
                                  {p.isPublished && p.status === "published"
                                    ? "● Live in Store"
                                    : p.status === "pending"
                                      ? "⏳ Pending Approval"
                                      : p.status === "rejected"
                                        ? "✕ Rejected"
                                        : "Unpublished"}
                                </span>

                                {/* Stock Quantity Pill */}
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                    isOutOfStock
                                      ? "bg-vermilion/20 text-vermilion"
                                      : p.quantity <= 5
                                        ? "bg-terai/20 text-terai"
                                        : "bg-charcoal/10 text-charcoal/70"
                                  }`}
                                >
                                  Stock: {p.quantity} ({p.stockStatus || (isOutOfStock ? "Out of Stock" : "In Stock")})
                                </span>
                              </div>

                              <h4 className="font-serif text-sm font-semibold text-charcoal truncate mt-0.5 max-w-xs">
                                {p.name}
                              </h4>
                              <p className="text-xs font-bold text-vermilion mt-0.5">
                                Rs. {p.price?.toLocaleString()}
                              </p>

                              {/* Rejection Reason display if rejected */}
                              {p.status === "rejected" && p.rejectionReason && (
                                <p className="text-[11px] text-vermilion mt-1 bg-vermilion/5 p-1 rounded">
                                  Reason: {p.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* Publish / Unpublish Toggle (only enabled if vendor is approved) */}
                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(p._id)}
                                className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                                  p.isPublished
                                    ? "border border-charcoal/20 text-charcoal hover:bg-sand"
                                    : "bg-teal text-ivory hover:bg-charcoal"
                                }`}
                                title={p.isPublished ? "Hide from public homepage" : "Make visible on homepage"}
                              >
                                {p.isPublished ? "Unpublish" : "Publish"}
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(p);
                                setProductFormOpen(true);
                              }}
                              className="border border-charcoal/20 bg-ivory px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand transition-colors rounded"
                            >
                              Edit
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(p._id)}
                              className="border border-vermilion/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-vermilion hover:bg-vermilion hover:text-ivory transition-colors rounded"
                              title="Delete creation"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={productFormOpen}
        product={editingProduct}
        onClose={() => {
          setProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={(msg) => {
          setMessage(typeof msg === "string" ? msg : "Product saved successfully!");
          loadProducts();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingProductId)}
        title="Delete Craft Creation"
        message="Are you sure you want to delete this creation from your catalog? This action will remove it from the public marketplace and cannot be undone."
        confirmText="Yes, Delete Product"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProductId(null)}
      />

      <SiteFooter />
    </div>
  );
}
