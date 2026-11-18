import { useState, useEffect, useCallback } from "react";
import { commissionApi } from "../../services/api.js";

export default function VendorCommissionSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentSettings, setCurrentSettings] = useState({
    percentage: 10,
    isEnabled: true,
  });

  const [metrics, setMetrics] = useState({
    totalGrossSales: 0,
    totalActiveSales: 0,
    totalCommissionDeducted: 0,
    totalCommissionReversed: 0,
    totalNetEarnings: 0,
    totalOrdersCount: 0,
    activeItemsCount: 0,
    reversedItemsCount: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'reversed'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadVendorData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await commissionApi.getVendorOverview({
        orderNumber: searchQuery,
        status: statusFilter,
        startDate,
        endDate,
        page,
        limit: 25,
      });

      if (res?.ok) {
        setCurrentSettings(res.currentSettings || { percentage: 10, isEnabled: true });
        setMetrics(res.metrics || {});
        setTransactions(res.transactions || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error("Failed to load vendor commission data:", err);
      setError(err.message || "Failed to load commission and earnings data.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, startDate, endDate]);

  useEffect(() => {
    loadVendorData(currentPage);
  }, [loadVendorData, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error alert */}
      {error && (
        <div className="rounded-lg border border-vermilion/30 bg-vermilion/10 p-4 text-xs font-semibold text-vermilion flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="font-bold hover:text-charcoal">✕</button>
        </div>
      )}

      {/* ── Policy Information Banner (Read-Only) ── */}
      <div className="rounded-xl border border-teal/30 bg-teal/5 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-ivory text-xl font-bold">
            ℹ️
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-teal/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal">
                Marketplace Commission Policy
              </span>
              <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
                Read-Only
              </span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold text-charcoal">
              Global Platform Commission: {currentSettings.isEnabled ? `${currentSettings.percentage}%` : "0% (Temporarily Waived)"}
            </h3>
            <p className="mt-0.5 text-xs text-charcoal/80 max-w-2xl leading-relaxed">
              LokArt applies this global rate to sustain platform marketing, customer delivery coordination, and artisan technology. Your commission percentage is locked into each order item at the moment of purchase and never retroactively recalculated.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-teal/20 bg-white p-3 self-start md:self-auto min-w-[180px] text-center shadow-2xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/60 block">
            Current Rate Applied
          </span>
          <span className="font-serif text-2xl font-black text-teal">
            {currentSettings.isEnabled ? `${currentSettings.percentage}%` : "0%"}
          </span>
          <span className="block text-[10px] text-charcoal/50 mt-0.5">
            {currentSettings.isEnabled ? "Global Active Policy" : "Commission Paused"}
          </span>
        </div>
      </div>

      {/* ── Financial Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Net Earnings (Artisan Payout) */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              Net Artisan Earnings
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/15 text-teal text-xs font-bold">
              ₨
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-teal">
            ₨{Number(metrics.totalNetEarnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Your net earnings</span>
            <span className="font-semibold text-teal">{metrics.activeItemsCount} items fulfilled</span>
          </div>
        </div>

        {/* Total Platform Commission Deducted */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-vermilion">
              Commission Deducted
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-vermilion/15 text-vermilion text-xs font-bold">
              %
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-vermilion">
            ₨{Number(metrics.totalCommissionDeducted || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Platform fee deducted</span>
            <span className="font-semibold text-vermilion">{metrics.totalOrdersCount} orders</span>
          </div>
        </div>

        {/* Total Active Sales */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Total Craft Sales (Active)
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-charcoal text-xs font-bold">
              🏷️
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-charcoal">
            ₨{Number(metrics.totalActiveSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Gross active merchandise</span>
            <span className="font-semibold text-charcoal">{metrics.totalOrdersCount} Customer Orders</span>
          </div>
        </div>

        {/* Reversed / Cancelled Commission */}
        <div className="rounded-xl border border-charcoal/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-terai">
              Reversals on Cancellation
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terai/15 text-terai text-xs font-bold">
              ↺
            </span>
          </div>
          <p className="mt-2 font-serif text-3xl font-black text-terai">
            ₨{Number(metrics.totalCommissionReversed || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal/60 border-t border-charcoal/5 pt-2">
            <span>Cancelled items</span>
            <span className="font-semibold text-terai">{metrics.reversedItemsCount} items</span>
          </div>
        </div>
      </div>

      {/* ── Order-wise and Product-wise Commission Breakdown ── */}
      <div className="rounded-xl border border-charcoal/15 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Order & Product Commission Breakdown
            </h3>
            <p className="text-xs text-charcoal/60">
              Detailed line-item record of every sale, commission percentage snapshot, deduction, and your net payout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadVendorData(currentPage)}
            className="flex items-center gap-1.5 text-xs font-bold text-teal hover:text-charcoal self-start sm:self-auto"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Ledger
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-lg border border-charcoal/10 bg-sand/30 p-3.5">
          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order # or craft title..."
              className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-teal focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:border-teal focus:outline-none"
            >
              <option value="all">All Sales</option>
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
            Loading your commission and earnings breakdown...
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-charcoal/20 p-12 text-center text-xs text-charcoal/60">
            No sales or commission transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-charcoal/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal/15 bg-sand/60 font-serif text-[11px] uppercase tracking-wider text-charcoal">
                  <th className="py-3 px-3">Order # / Date</th>
                  <th className="py-3 px-3">Craft Creation</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-center">Comm. Rate</th>
                  <th className="py-3 px-3 text-right">Platform Fee</th>
                  <th className="py-3 px-3 text-right">Your Net Payout</th>
                  <th className="py-3 px-3 text-center">Order Status</th>
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

                    {/* Product */}
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
                          <span className="font-medium text-charcoal block truncate max-w-[180px]">
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

                    {/* Commission Rate Snapshot */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="rounded bg-sand px-2 py-0.5 font-bold text-teal text-[11px]">
                        {tx.commissionPercentage}%
                      </span>
                    </td>

                    {/* Platform Commission Deducted */}
                    <td className="py-3 px-3 text-right font-bold text-vermilion whitespace-nowrap">
                      {tx.isReversed ? (
                        <span className="line-through text-charcoal/40">
                          ₨{Number(tx.commissionAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span>-₨{Number(tx.commissionAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      )}
                    </td>

                    {/* Net Artisan Earning */}
                    <td className="py-3 px-3 text-right font-bold text-teal whitespace-nowrap">
                      {tx.isReversed ? (
                        <span className="line-through text-charcoal/40">
                          ₨{Number(tx.vendorEarning).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-sm font-black">₨{Number(tx.vendorEarning).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {tx.isReversed ? (
                        <span className="inline-flex items-center gap-1 rounded bg-vermilion/15 px-2 py-0.5 text-[10px] font-bold text-vermilion" title={tx.cancellationReason || "Order item cancelled"}>
                          <span>↺</span> Cancelled
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
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} sales items)
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
    </div>
  );
}
