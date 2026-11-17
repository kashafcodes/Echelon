import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi, adminProductApi } from "../services/api.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState({ users: [], vendors: [], counts: {} });
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [activeTab, setActiveTab] = useState("vendors"); // 'vendors' | 'users' | 'products'

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      const [res, prodRes] = await Promise.all([
        authApi.getAdminUsers(),
        adminProductApi.getPending().catch(() => ({ ok: true, products: [] })),
      ]);

      if (res?.ok) {
        setData({
          users: res.users || [],
          vendors: res.vendors || [],
          counts: res.counts || {},
        });
      }
      if (prodRes?.ok) {
        setPendingProducts(prodRes.products || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load administrative data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (vendorId, status) => {
    try {
      setActionLoadingId(vendorId);
      setActionMessage("");
      const res = await authApi.updateVendorStatus(vendorId, status);
      if (res?.ok) {
        setActionMessage(
          `Vendor verification status updated to '${status.toUpperCase()}'.`,
        );
        // Refresh local vendor list
        setData((prev) => ({
          ...prev,
          vendors: prev.vendors.map((v) =>
            v._id === vendorId ? { ...v, verificationStatus: status } : v,
          ),
          counts: {
            ...prev.counts,
            pendingVendors:
              status === "approved" || status === "rejected"
                ? Math.max(0, (prev.counts.pendingVendors || 1) - 1)
                : prev.counts.pendingVendors,
            approvedVendors:
              status === "approved"
                ? (prev.counts.approvedVendors || 0) + 1
                : prev.counts.approvedVendors,
          },
        }));
      }
    } catch (err) {
      setError(err.message || "Failed to update vendor status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      setActionLoadingId(productId);
      setActionMessage("");
      const res = await adminProductApi.approve(productId);
      if (res?.ok) {
        setActionMessage(res.message);
        setPendingProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (err) {
      setError(err.message || "Failed to approve product.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectProduct = async (productId) => {
    const reason = window.prompt("Enter rejection reason for the artisan:", "Does not meet authentic Terai craftsmanship guidelines");
    if (!reason || !reason.trim()) return;

    try {
      setActionLoadingId(productId);
      setActionMessage("");
      const res = await adminProductApi.reject(productId, reason.trim());
      if (res?.ok) {
        setActionMessage(res.message);
        setPendingProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (err) {
      setError(err.message || "Failed to reject product.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col justify-between bg-ivory">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/15 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-charcoal px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ivory">
                Admin Control Room
              </span>
              <span className="text-xs text-charcoal/60">
                Logged in as {user?.name}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              Platform Administration
            </h1>
            <p className="mt-1 text-sm text-charcoal/80">
              Review artisan applications, verify local makers, and oversee registered users.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAdminData}
              className="border border-charcoal/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Refresh Data
            </button>
            <button
              type="button"
              onClick={logout}
              className="border border-charcoal/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded border border-charcoal/15 bg-sand/50 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
              Total Users
            </span>
            <p className="mt-2 font-serif text-3xl text-charcoal">
              {data.counts.totalUsers ?? 0}
            </p>
          </div>
          <div className="rounded border border-charcoal/15 bg-sand/50 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              Customers
            </span>
            <p className="mt-2 font-serif text-3xl text-teal">
              {data.counts.customers ?? 0}
            </p>
          </div>
          <div className="rounded border border-charcoal/15 bg-sand/50 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-terai">
              Pending Vendors
            </span>
            <p className="mt-2 font-serif text-3xl text-terai">
              {data.counts.pendingVendors ?? 0}
            </p>
          </div>
          <div className="rounded border border-charcoal/15 bg-sand/50 p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-vermilion">
              Approved Vendors
            </span>
            <p className="mt-2 font-serif text-3xl text-vermilion">
              {data.counts.approvedVendors ?? 0}
            </p>
          </div>
        </div>

        {actionMessage ? (
          <div className="mt-6 rounded border border-teal/40 bg-teal/10 p-4 text-sm text-teal">
            {actionMessage}
          </div>
        ) : null}
        {error ? (
          <div className="mt-6 rounded border border-vermilion/40 bg-vermilion/10 p-4 text-sm text-vermilion">
            {error}
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mt-10 flex border-b border-charcoal/15">
          <button
            type="button"
            onClick={() => setActiveTab("vendors")}
            className={`pb-3 pr-6 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "vendors"
                ? "border-b-2 border-vermilion text-vermilion"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Vendor Applications ({data.vendors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-6 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "users"
                ? "border-b-2 border-vermilion text-vermilion"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            Registered Users ({data.users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-6 text-sm font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              activeTab === "products"
                ? "border-b-2 border-vermilion text-vermilion"
                : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            <span>Creations Review</span>
            {pendingProducts.length > 0 && (
              <span className="rounded-full bg-vermilion px-2 py-0.2 text-[10px] font-bold text-ivory">
                {pendingProducts.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
            <p className="mt-3 text-sm text-charcoal/60">Loading administrative records...</p>
          </div>
        ) : activeTab === "vendors" ? (
          <div className="mt-6 overflow-x-auto rounded border border-charcoal/15 bg-ivory shadow-xs">
            <table className="w-full text-left text-sm text-charcoal">
              <thead className="bg-sand/60 text-xs uppercase tracking-wider text-charcoal/70 border-b border-charcoal/10">
                <tr>
                  <th className="px-5 py-3.5">Business & Artisan</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Workshop Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {data.vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-charcoal/60">
                      No vendor applications found.
                    </td>
                  </tr>
                ) : (
                  data.vendors.map((v) => (
                    <tr key={v._id} className="hover:bg-sand/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-charcoal">{v.businessName}</p>
                        <p className="text-xs text-charcoal/70">
                          {v.userId?.name} · {v.userId?.email}
                        </p>
                        <p className="text-xs text-charcoal/60 mt-0.5 line-clamp-1 max-w-xs">
                          {v.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium">
                        {v.category}
                      </td>
                      <td className="px-5 py-4 text-xs text-charcoal/80">
                        {v.businessAddress?.district}, {v.businessAddress?.province}
                        <span className="block text-charcoal/60">
                          {v.businessAddress?.street}, Ward {v.businessAddress?.ward}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {v.verificationStatus === "approved" ? (
                          <span className="inline-block rounded bg-teal/20 px-2 py-0.5 text-xs font-semibold text-teal uppercase tracking-wider">
                            Approved
                          </span>
                        ) : v.verificationStatus === "rejected" ? (
                          <span className="inline-block rounded bg-vermilion/20 px-2 py-0.5 text-xs font-semibold text-vermilion uppercase tracking-wider">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-terai/20 px-2 py-0.5 text-xs font-semibold text-terai uppercase tracking-wider">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {v.verificationStatus !== "approved" ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === v._id}
                              onClick={() => handleUpdateStatus(v._id, "approved")}
                              className="rounded bg-teal px-3 py-1.5 text-xs font-medium text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                          ) : null}
                          {v.verificationStatus !== "rejected" ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === v._id}
                              onClick={() => handleUpdateStatus(v._id, "rejected")}
                              className="rounded border border-vermilion px-3 py-1.5 text-xs font-medium text-vermilion hover:bg-vermilion hover:text-ivory transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "products" ? (
          <div className="mt-6 space-y-4">
            {pendingProducts.length === 0 ? (
              <div className="rounded border border-dashed border-charcoal/20 bg-sand/30 p-12 text-center">
                <span className="text-3xl">✓</span>
                <h4 className="mt-2 font-serif text-lg font-bold text-charcoal">
                  All creations reviewed!
                </h4>
                <p className="mt-1 text-xs text-charcoal/70">
                  There are no artisan products currently awaiting administrative review.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex flex-col justify-between rounded border border-charcoal/15 bg-ivory p-5 shadow-xs"
                  >
                    <div>
                      <div className="flex gap-4">
                        <img
                          src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="h-20 w-20 rounded object-cover border border-charcoal/15 shrink-0 bg-sand"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-teal uppercase tracking-wider block">
                            {p.category}
                          </span>
                          <h4 className="font-serif text-base font-bold text-charcoal truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-charcoal/70">
                            By {p.userId?.name || p.vendorId?.businessName || "Artisan"} • {p.origin}
                          </p>
                          <p className="font-serif text-sm font-bold text-vermilion mt-1">
                            Rs. {p.price?.toLocaleString()} • Stock: {p.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-charcoal/80 line-clamp-3 bg-sand/30 p-2.5 rounded">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        disabled={actionLoadingId === p._id}
                        onClick={() => handleRejectProduct(p._id)}
                        className="rounded border border-vermilion px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-vermilion hover:bg-vermilion hover:text-ivory transition-colors disabled:opacity-50"
                      >
                        Reject...
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === p._id}
                        onClick={() => handleApproveProduct(p._id)}
                        className="rounded bg-teal px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50"
                      >
                        {actionLoadingId === p._id ? "Approving..." : "Approve & Publish"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded border border-charcoal/15 bg-ivory shadow-xs">
            <table className="w-full text-left text-sm text-charcoal">
              <thead className="bg-sand/60 text-xs uppercase tracking-wider text-charcoal/70 border-b border-charcoal/10">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {data.users.map((u) => (
                  <tr key={u._id} className="hover:bg-sand/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{u.name}</td>
                    <td className="px-5 py-3.5 text-charcoal/80">{u.email}</td>
                    <td className="px-5 py-3.5 text-charcoal/70">{u.phone}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-charcoal text-ivory"
                            : u.role === "vendor"
                              ? "bg-terai/20 text-terai"
                              : "bg-teal/20 text-teal"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-charcoal/80">
                      {u.address?.district}, {u.address?.province}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-charcoal/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
