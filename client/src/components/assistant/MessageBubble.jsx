// ══════════════════════════════════════════
//  LokArt AI Assistant — Message Bubble
// ══════════════════════════════════════════

import ProductResultCard from "./ProductResultCard.jsx";

function formatTime(ts) {
  if (!ts) return "";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function OrderItem({ order }) {
  const id = order._id || "";
  const status = order.status || "pending";
  const total = order.totalAmount ?? order.total ?? 0;
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "";
  const itemCount = order.items?.length || order.orderItems?.length || 0;

  const statusColors = {
    pending: "bg-terai/20 text-terai",
    confirmed: "bg-teal/15 text-teal",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-vermilion/10 text-vermilion",
    processing: "bg-purple-100 text-purple-700",
  };
  const colorClass = statusColors[status.toLowerCase()] || "bg-sand text-charcoal";

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-sand p-2.5">
      <div className="w-9 h-9 rounded-lg bg-sand flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-charcoal/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-charcoal">#{id.slice(-8).toUpperCase()}</p>
        <p className="text-xs text-charcoal/50">{itemCount} item{itemCount !== 1 ? "s" : ""} · {date}</p>
        <p className="text-xs font-semibold text-vermilion mt-0.5 font-serif">Rs. {Number(total).toLocaleString()}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colorClass}`}>
        {status}
      </span>
    </div>
  );
}

function ConfirmPrompt({ data, onConfirm, onDeny }) {
  return (
    <div className="flex gap-2 mt-1">
      <button
        onClick={onConfirm}
        className="flex-1 py-2 rounded-xl bg-vermilion text-white text-sm font-medium hover:bg-vermilion/85 transition-colors"
      >
        ✓ Yes, confirm
      </button>
      <button
        onClick={onDeny}
        className="flex-1 py-2 rounded-xl bg-sand text-charcoal text-sm font-medium hover:bg-sand/80 transition-colors"
      >
        ✕ Cancel
      </button>
    </div>
  );
}

export default function MessageBubble({ message, onAddToCart, onAddToWishlist, onConfirm, onDeny }) {
  const isUser = message.role === "user";
  const { text, type, data } = message;

  if (isUser) {
    return (
      <div className="flex justify-end mb-2">
        <div className="max-w-[80%]">
          <div className="bg-vermilion text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {text}
          </div>
          <p className="text-right text-xs text-charcoal/40 mt-1 pr-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex gap-2.5 mb-3">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-vermilion flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">L</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Text bubble */}
        {text && (
          <div className="bg-sand rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-charcoal leading-relaxed mb-2 whitespace-pre-line">
            {/* Render **bold** markdown */}
            <BoldText text={text} />
          </div>
        )}

        {/* Product list */}
        {type === "product_list" && Array.isArray(data) && (
          <div className="space-y-2">
            {data.slice(0, 5).map((product, i) => (
              <ProductResultCard
                key={product._id || i}
                product={product}
                index={i}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            ))}
          </div>
        )}

        {/* Cart items */}
        {type === "cart_items" && Array.isArray(data) && (
          <div className="space-y-2">
            {data.map((item, i) => (
              <div key={item._id || i} className="flex items-center gap-2 bg-white rounded-xl border border-sand p-2.5">
                <div className="w-10 h-10 rounded-lg bg-sand overflow-hidden flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                  <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-vermilion font-serif flex-shrink-0">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Order list */}
        {type === "order_list" && Array.isArray(data) && (
          <div className="space-y-2">
            {data.slice(0, 5).map((order, i) => (
              <OrderItem key={order._id || i} order={order} />
            ))}
            {data.length > 5 && (
              <p className="text-xs text-charcoal/50 text-center">
                ...and {data.length - 5} more order{data.length - 5 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* Confirm prompt */}
        {type === "confirm_prompt" && (
          <ConfirmPrompt data={data} onConfirm={onConfirm} onDeny={onDeny} />
        )}

        <p className="text-xs text-charcoal/40 mt-1 pl-1">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}

// Renders **bold** markdown inline
function BoldText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
