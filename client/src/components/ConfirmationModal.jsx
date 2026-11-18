export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure? This action cannot be undone.",
  confirmText = "Delete",
  confirmColor = "vermilion",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onCancel} />

      <div className="relative w-full max-w-md rounded bg-ivory p-6 shadow-2xl border border-charcoal/20 z-10 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl text-vermilion">⚠️</span>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">{title}</h3>
            <p className="mt-1 text-xs text-charcoal/80 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal/10">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-charcoal/30 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-sand transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors ${
              confirmColor === "vermilion"
                ? "bg-vermilion hover:bg-charcoal"
                : "bg-charcoal hover:bg-vermilion"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
