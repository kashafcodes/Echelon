import { useState } from "react";
import CraftVisual from "./CraftVisual.jsx";

export default function CraftStoryModal({ product, onClose, onRegisterClick }) {
  const [ordered, setOrdered] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Birgunj / Parsa");

  if (!product) return null;

  function handleOrderSubmit(e) {
    e.preventDefault();
    if (!deliveryPhone.trim()) return;
    setOrdered(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-3xl overflow-hidden rounded-none border border-charcoal/20 bg-ivory shadow-2xl text-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-charcoal/15 bg-sand px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-vermilion"></span>
            <span className="text-xs font-semibold tracking-[0.16em] uppercase text-charcoal/70">
              LokArt Verified Heritage Craft
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-charcoal/60 hover:bg-charcoal/10 hover:text-charcoal transition-colors text-xl font-bold leading-none px-2.5 py-1"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 max-h-[80vh] overflow-y-auto">
          {/* Visual Side */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-charcoal/15 bg-sand/50 p-6">
            <CraftVisual
              type={product.iconType}
              title={product.title}
              className="h-64 w-full shadow-inner border border-charcoal/10"
            />

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-teal">
                  Craft Artisan
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">
                  ✓ Verified Creator
                </span>
              </div>
              <p className="font-serif text-2xl font-bold text-charcoal">{product.artisanName}</p>
              <p className="text-sm text-charcoal/75">
                📍 {product.village}, {product.district} District, Terai
              </p>

              <div className="pt-3 border-t border-charcoal/10 text-xs space-y-2 text-charcoal/80">
                <p>
                  <strong className="text-charcoal">Dimensions:</strong> {product.dimensions}
                </p>
                <p>
                  <strong className="text-charcoal">Making Time:</strong> {product.makingTime}
                </p>
                <p>
                  <strong className="text-charcoal">Indigenous Materials:</strong> {product.materials}
                </p>
              </div>
            </div>
          </div>

          {/* Details & Story Side */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-terai/20 px-2.5 py-1 text-xs font-semibold tracking-wider uppercase text-charcoal">
                  {product.categoryLabel}
                </span>
                <span className="font-serif text-2xl font-bold text-vermilion">
                  रू {product.price.toLocaleString("en-NP")}
                </span>
              </div>

              <h2 className="mt-3 font-serif text-2xl leading-snug text-charcoal">
                {product.title}
              </h2>
              {product.nepaliTitle && (
                <p className="mt-1 text-sm font-serif text-charcoal/70">{product.nepaliTitle}</p>
              )}

              <div className="mt-5 rounded bg-sand/70 p-4 border-l-4 border-teal text-sm leading-relaxed text-charcoal/85">
                <p className="font-semibold text-xs tracking-wider uppercase text-teal mb-1">
                  The Story of This Piece
                </p>
                <p>{product.fullStory}</p>
              </div>

              <div className="mt-4 rounded border border-charcoal/10 bg-ivory p-3 text-xs leading-5 text-charcoal/80">
                <p className="font-medium text-charcoal">🌟 LokArt Transparent Promise:</p>
                <p className="mt-1">
                  100% of this artisan's asking price goes directly to {product.artisanName}. All deliveries are fulfilled via Cash on Delivery (COD) across Nepal.
                </p>
              </div>
            </div>

            {/* Ordering or Confirmation Box */}
            <div className="mt-6 pt-5 border-t border-charcoal/15">
              {ordered ? (
                <div className="rounded bg-teal/10 p-4 text-center border border-teal/30">
                  <p className="font-serif text-lg font-bold text-teal">
                    Order Inquired for Cash on Delivery!
                  </p>
                  <p className="mt-1 text-xs text-charcoal/80">
                    Thank you, {customerName || "Patron"}! Our Parsa dispatch desk will call {deliveryPhone} to confirm your address before dispatch.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOrdered(false)}
                    className="mt-3 text-xs font-semibold text-vermilion hover:underline"
                  >
                    Place another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-charcoal/75 mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Thapa"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-charcoal/20 bg-ivory px-2.5 py-1.5 focus:border-vermilion focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-charcoal/75 mb-1">Phone Number (COD)</label>
                      <input
                        type="tel"
                        required
                        placeholder="98XXXXXXXX"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="w-full border border-charcoal/20 bg-ivory px-2.5 py-1.5 focus:border-vermilion focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-vermilion px-4 py-2.5 text-center text-sm font-semibold text-ivory hover:bg-charcoal transition-colors cursor-pointer"
                    >
                      Request with Cash on Delivery
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="border border-charcoal/30 px-4 py-2.5 text-sm hover:bg-charcoal/5 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-[11px] text-center text-charcoal/60">
                    Pay only when the package reaches your hands. Free inspection on delivery.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
