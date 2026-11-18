import { useState, useEffect, useCallback } from "react";
import { commissionApi } from "../../services/api.js";

export default function AdminCommissionSection() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Commission Settings State
  const [settings, setSettings] = useState({
    percentage: 10,
    isEnabled: true,
    history: [],
  });
  const [newPercentage, setNewPercentage] = useState("10");
  const [isEnabledState, setIsEnabledState] = useState(true);
  const [updateNote, setUpdateNote] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Overview Data State
  const [metrics, setMetrics] = useState({
    totalGrossSales: 0,
    totalActiveSales: 0,
    totalCommissionEarned: 0,
    totalCommissionReversed: 0,
    totalVendorNetEarnings: 0,
    totalActiveItemsCount: 0,
    totalCancelledItemsCount: 0,
    totalOrdersCount: 0,
  });
  const [vendorSummaries, setVendorSummaries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filter State
  const [vendorFilter, setVendorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'reversed'
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Active view toggle: 'ledger' | 'vendors'
  const [activeSubView, setActiveSubView] = useState("ledger");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Load Settings & Financial Overview
  const loadOverviewData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const [settingsRes, overviewRes] = await Promise.all([
        commissionApi.getSettings(),
        commissionApi.getAdminOverview({
          vendorId: vendorFilter,
          status: statusFilter,
          orderNumber: searchQuery,
          startDate,
          endDate,
          page,
          limit: 25,
        }),
      ]);

      if (settingsRes?.ok && settingsRes.settings) {
        setSettings(settingsRes.settings);
        setNewPercentage(String(settingsRes.settings.percentage));
        setIsEnabledState(settingsRes.settings.isEnabled);
      }

      if (overviewRes?.ok) {
        setMetrics(overviewRes.metrics || {});
        setVendorSummaries(overviewRes.vendorSummaries || []);
        setTransactions(overviewRes.transactions || []);
        setVendorsList(overviewRes.vendorsList || []);
        setPagination(overviewRes.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error("Failed to load admin commission overview:", err);
      setError(err.message || "Failed to load commission data.");
    } finally {
      setLoading(false);
    }
  }, [vendorFilter, statusFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    loadOverviewData(currentPage);
  }, [loadOverviewData, currentPage]);

  // Handle Commission Rate & Status Update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const rateVal = parseFloat(newPercentage);
    if (isNaN(rateVal) || rateVal < 0 || rateVal > 100) {
      setError("Commission percentage must be between 0 and 100.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await commissionApi.updateSettings({
        percentage: rateVal,
        isEnabled: isEnabledState,
        note: updateNote.trim() || undefined,
      });

      if (res?.ok && res.settings) {
        setSettings(res.settings);
        setNewPercentage(String(res.settings.percentage));
        setIsEnabledState(res.settings.isEnabled);
        setUpdateNote("");
        showToast(res.message || "Commission settings successfully saved!");
        loadOverviewData(currentPage);
      }
    } catch (err) {
      setError(err.message || "Failed to update commission settings.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setVendorFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-lg border border-teal/40 bg-teal px-5 py-3 text-sm font-semibold text-ivory shadow-xl animate-bounce">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-vermilion/30 bg-vermilion/10 p-4 text-sm font-semibold text-vermilion flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")} className="hover:text-charcoal font-bold">✕</button>
        </div>
      )}

      {/* ── Section 1: Global Commission Settings & Policy Control ── */}
      <div className="rounded-xl border border-charcoal/15 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-teal/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-teal">
                Marketplace Commission Core
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                settings.isEnabled ? "bg-teal/15 text-teal" : "bg-charcoal/15 text-charcoal/60"
              }`}>
                <span className={`h-2 w-2 rounded-full ${settings.isEnabled ? "bg-teal animate-pulse" : "bg-charcoal/40"}`} />
                {settings.isEnabled ? "System Active" : "System Disabled"}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold text-charcoal">
              Global Commission Configuration
            </h2>
            <p className="mt-0.5 text-xs text-charcoal/70">
              The platform commission percentage applies globally to all authentic Terai craft creations and artisan vendors. Once applied to an order, the rate snapshot remains permanently fixed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 self-start md:self-auto rounded-lg border border-charcoal/20 bg-sand/40 px-3.5 py-2 text-xs font-bold text-charcoal hover:bg-sand transition-colors"
          >
            <svg className="h-4 w-4 text-charcoal/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rate Change History ({settings.history?.length || 0})
          </button>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSaveSettings} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {/* Rate Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
              Commission Percentage (%) <span className="text-vermilion">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-charcoal/20 bg-ivory/60 px-3.5 py-2.5 text-sm font-bold text-charcoal focus:border-teal focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-sm font-bold text-charcoal/40">%</span>
            </div>
            <p className="mt-1 text-[11px] text-charcoal/60">
              Current live rate: <strong className="text-teal">{settings.percentage}%</strong>
            </p>
          </div>

          {/* System Enabled / Disabled Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
              Commission State
            </label>
            <div className="mt-1.5 flex items-center gap-3 h-[42px]">
              <button
                type="button"
                onClick={() => setIsEnabledState(!isEnabledState)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabledState ? "bg-teal" : "bg-charcoal/30"
                }`}
                role="switch"
                aria-checked={isEnabledState}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isEnabledState ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-charcoal">
                {isEnabledState ? "Enabled (Apply rate)" : "Disabled (0% commission)"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-charcoal/60">
              When disabled, artisans receive 100% of sales.
            </p>
          </div>

          {/* Reason / Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
              Audit Reason / Note (Optional)
            </label>
            <input
              type="text"
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              placeholder="e.g., Festive season support for artisans"
              className="mt-1.5 w-full rounded-lg border border-charcoal/20 bg-ivory/60 px-3 py-2.5 text-xs text-charcoal focus:border-teal focus:bg-white focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-charcoal/60">Recorded in the rate audit ledger.</p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ivory hover:bg-charcoal transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {submitting ? "Applying Changes..." : "Save Commission Policy"}
            </button>
            <p className="mt-1 text-[11px] text-center text-charcoal/60">
              New orders will snapshot this rate.
            </p>
          </div>
        </form>
      </div>

      {/* ── Section 2: Financial Analytics Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Commission Earned (Platform Revenue) */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              Platform Commission Earned
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/15 text-teal text-sm font-bold">
              ₨
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-teal">
            ₨{Number(metrics.totalCommissionEarned || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>From active fulfilled orders</span>
            <span className="font-semibold text-teal">{metrics.totalActiveItemsCount} items</span>
          </div>
        </div>

        {/* Total Vendor Net Earnings */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-vermilion">
              Artisan Net Earnings
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vermilion/15 text-vermilion text-sm font-bold">
              👥
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-vermilion">
            ₨{Number(metrics.totalVendorNetEarnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Net payable to artisans</span>
            <span className="font-semibold text-vermilion">{vendorSummaries.length} Studios</span>
          </div>
        </div>

        {/* Total Active Marketplace Sales */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Active Marketplace Sales
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-charcoal text-sm font-bold">
              🛒
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-charcoal">
            ₨{Number(metrics.totalActiveSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Across all craft categories</span>
            <span className="font-semibold text-charcoal">{metrics.totalOrdersCount} Orders</span>
          </div>
        </div>

        {/* Commission Reversed / Cancelled */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-terai">
              Commission Reversed
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terai/15 text-terai text-sm font-bold">
              ↺
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-terai">
            ₨{Number(metrics.totalCommissionReversed || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Cancellations & refunds</span>
            <span className="font-semibold text-terai">{metrics.totalCancelledItemsCount} items</span>
          </div>
        </div>
      </div>

      {/* ── Section 3: Sub-Views Switcher (Ledger vs Vendor Summaries) ── */}
      <div className="rounded-xl border border-charcoal/15 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSubView("ledger")}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeSubView === "ledger"
                  ? "border-b-2 border-teal text-teal"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              Commission Transaction Ledger ({pagination.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("vendors")}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeSubView === "vendors"
                  ? "border-b-2 border-teal text-teal"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              Artisan Vendor Summaries ({vendorSummaries.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadOverviewData(currentPage)}
            className="flex items-center gap-1.5 text-xs font-bold text-teal hover:text-charcoal self-start sm:self-auto"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Ledger
          </button>
        </div>

        {/* ── SUB-VIEW A: Transaction Ledger & Filters ── */}
        {activeSubView === "ledger" ? (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 rounded-lg border border-charcoal/10 bg-sand/30 p-3.5">
              {/* Search */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Order #, craft, customer..."
                  className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-teal focus:outline-none"
                />
              </div>

              {/* Vendor Dropdown */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
                  Artisan Studio
                </label>
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:outline-none"
                >
                  <option value="all">All Artisans ({vendorsList.length})</option>
                  {vendorsList.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.businessName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
                  Commission Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:outline-none"
                >
                  <option value="all">All Transactions</option>
                  <option value="active">Active (Earned)</option>
                  <option value="reversed">Reversed (Cancelled)</option>
                </select>
              </div>

              {/* Date Start */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1 text-xs text-charcoal focus:border-teal focus:outline-none"
                />
              </div>

              {/* Date End & Reset */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1 text-xs text-charcoal focus:border-teal focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded border border-charcoal/25 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal hover:bg-sand transition-colors"
                  title="Reset Filters"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            {loading ? (
              <div className="py-16 text-center text-xs font-semibold text-charcoal/60">
                Loading commission transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-charcoal/20 p-12 text-center text-xs text-charcoal/60">
                No commission transactions found matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-charcoal/10">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-charcoal/15 bg-sand/60 font-serif text-[11px] uppercase tracking-wider text-charcoal">
                      <th className="py-3 px-3">Order # / Date</th>
                      <th className="py-3 px-3">Artisan Workshop</th>
                      <th className="py-3 px-3">Craft Product</th>
                      <th className="py-3 px-3 text-right">Selling Price</th>
                      <th className="py-3 px-3 text-center">Rate</th>
                      <th className="py-3 px-3 text-right">Commission</th>
                      <th className="py-3 px-3 text-right">Artisan Net</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10">
                    {transactions.map((tx) => (
                      <tr
                        key={tx.transactionId}
                        className={`transition-colors ${
                          tx.isReversed
                            ? "bg-vermilion/5 hover:bg-vermilion/10 text-charcoal/70"
                            : "hover:bg-sand/30"
                        }`}
                      >
                        {/* Order & Date */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-bold text-charcoal block">{tx.orderNumber}</span>
                          <span className="text-[10px] text-charcoal/50">
                            {new Date(tx.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Artisan */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-charcoal block truncate max-w-[150px]">
                            {tx.vendorName}
                          </span>
                          <span className="text-[10px] text-charcoal/50 truncate block max-w-[150px]">
                            Customer: {tx.customerName}
                          </span>
                        </td>

                        {/* Craft Product */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {tx.productImage ? (
                              <img
                                src={tx.productImage}
                                alt=""
                                className="h-7 w-7 rounded object-cover border border-charcoal/15 shrink-0"
                              />
                            ) : null}
                            <div className="min-w-0">
                              <span className="font-medium text-charcoal block truncate max-w-[160px]">
                                {tx.productName}
                              </span>
                              <span className="text-[10px] text-charcoal/50">
                                {tx.quantity} × ₨{Number(tx.unitPrice).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-3 text-right font-bold text-charcoal whitespace-nowrap">
                          ₨{Number(tx.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Commission Rate */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="rounded bg-sand px-2 py-0.5 font-bold text-teal text-[11px]">
                            {tx.commissionPercentage}%
                          </span>
                        </td>

                        {/* Commission Amount */}
                        <td className="py-3 px-3 text-right font-bold text-teal whitespace-nowrap">
                          {tx.isReversed ? (
                            <span className="line-through text-charcoal/40">
                              ₨{Number(tx.commissionAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span>₨{Number(tx.commissionAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>

                        {/* Artisan Net Earning */}
                        <td className="py-3 px-3 text-right font-bold text-vermilion whitespace-nowrap">
                          {tx.isReversed ? (
                            <span className="line-through text-charcoal/40">
                              ₨{Number(tx.vendorEarning).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span>₨{Number(tx.vendorEarning).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {tx.isReversed ? (
                            <span className="inline-flex items-center gap-1 rounded bg-vermilion/15 px-2 py-0.5 text-[10px] font-bold text-vermilion" title={tx.cancellationReason || "Cancelled/Refunded"}>
                              <span>↺</span> Reversed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-teal/15 px-2 py-0.5 text-[10px] font-bold text-teal uppercase">
                              {tx.orderStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                <span className="text-xs text-charcoal/60">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} transactions)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded border border-charcoal/20 px-3 py-1 text-xs font-semibold text-charcoal hover:bg-sand disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= pagination.pages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded border border-charcoal/20 px-3 py-1 text-xs font-semibold text-charcoal hover:bg-sand disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── SUB-VIEW B: Artisan Vendor Commission Summaries Table ── */
          <div className="space-y-4">
            <p className="text-xs text-charcoal/70">
              Aggregated sales, platform commissions retained, and net payouts for each registered artisan workshop.
            </p>

            <div className="overflow-x-auto rounded-lg border border-charcoal/10">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal/15 bg-sand/60 font-serif text-[11px] uppercase tracking-wider text-charcoal">
                    <th className="py-3 px-3">Artisan Workshop</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Orders</th>
                    <th className="py-3 px-3 text-center">Items Sold</th>
                    <th className="py-3 px-3 text-right">Gross Sales</th>
                    <th className="py-3 px-3 text-right">Platform Commission</th>
                    <th className="py-3 px-3 text-right">Net Artisan Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10">
                  {vendorSummaries.map((v) => (
                    <tr key={v.vendorId} className="hover:bg-sand/30 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-charcoal block">{v.businessName}</span>
                        <span className="text-[10px] text-charcoal/50">
                          {v.ownerName} {v.ownerEmail ? `(${v.ownerEmail})` : ""}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-charcoal/80 font-medium">
                        {v.category}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-charcoal">
                        {v.totalOrders}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-charcoal">
                        {v.totalItemsCount}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-charcoal whitespace-nowrap">
                        ₨{Number(v.activeSales).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        {v.commissionReversed > 0 && (
                          <span className="block text-[10px] text-terai font-normal">
                            ↺ ₨{v.commissionReversed} reversed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-teal whitespace-nowrap">
                        ₨{Number(v.commissionEarned).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-vermilion whitespace-nowrap">
                        ₨{Number(v.netEarnings).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Rate Change History Modal ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-ivory p-6 shadow-2xl border border-charcoal/15 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Commission Policy Change History
                </h3>
                <p className="text-xs text-charcoal/60">
                  Full immutable audit trail of marketplace rate updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-full p-1.5 text-charcoal/50 hover:bg-sand hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {(!settings.history || settings.history.length === 0) ? (
                <p className="text-center text-xs text-charcoal/60 py-8">
                  No rate change records available.
                </p>
              ) : (
                settings.history.map((h, idx) => (
                  <div
                    key={h._id || idx}
                    className="rounded-lg border border-charcoal/10 bg-white p-4 shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-black text-teal">
                          {h.percentage}%
                        </span>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          h.isEnabled ? "bg-teal/15 text-teal" : "bg-charcoal/15 text-charcoal/60"
                        }`}>
                          {h.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <span className="text-[11px] text-charcoal/50">
                        {new Date(h.updatedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal/85">
                      {h.note || "Commission policy revised by administrator."}
                    </p>

                    {h.updatedBy && (
                      <p className="text-[10px] text-charcoal/50">
                        Updated by: <strong>{h.updatedBy.name || h.updatedBy.email}</strong>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-charcoal/10 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg bg-charcoal px-5 py-2 text-xs font-bold uppercase tracking-wider text-ivory hover:bg-charcoal/80 transition-colors"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
