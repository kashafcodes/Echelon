import { useState } from "react";

const STAGES = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Handcrafting / Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function getStageIndex(status) {
  switch (status) {
    case "placed": return 0;
    case "confirmed": return 1;
    case "processing": return 2;
    case "shipped": return 3;
    case "delivered": return 4;
    default: return -1;
  }
}

export default function OrderTrackingTimeline({ currentStatus, isCancelled, cancellationReason }) {
  if (isCancelled || currentStatus === "cancelled") {
    return (
      <div className="rounded border border-vermilion/30 bg-vermilion/10 p-3 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-vermilion text-ivory text-xs font-bold shrink-0">
          ✕
        </span>
        <div>
          <span className="text-xs font-bold text-vermilion uppercase tracking-wider block">
            Item / Order Cancelled
          </span>
          <p className="text-xs text-charcoal/70">
            {cancellationReason ? `Reason: ${cancellationReason}` : "This order item has been cancelled."}
          </p>
        </div>
      </div>
    );
  }

  const activeIdx = getStageIndex(currentStatus);

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-charcoal/15 z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-teal transition-all duration-300 z-0"
          style={{ width: `${Math.max(0, (activeIdx / (STAGES.length - 1)) * 100)}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx <= activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border-2 transition-all ${
                  isCurrent
                    ? "bg-teal border-ivory text-ivory ring-2 ring-teal shadow-xs scale-110"
                    : isDone
                    ? "bg-teal border-teal text-ivory"
                    : "bg-ivory border-charcoal/30 text-charcoal/40"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold mt-1.5 text-center max-w-[70px] sm:max-w-none leading-tight ${
                  isCurrent ? "text-teal font-bold" : isDone ? "text-charcoal" : "text-charcoal/40"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
