export default function CraftVisual({ type, title, className = "h-48 w-full" }) {
  if (type === "painting") {
    return (
      <div className={`relative overflow-hidden bg-sand flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 320 200" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="sunGrad" cx="70%" cy="30%" r="40%">
              <stop offset="0%" stopColor="#f28c28" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b9382b" stopOpacity="0.9" />
            </radialGradient>
            <pattern id="fishScale" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 Q 10 0 20 10 Q 10 20 0 10" fill="none" stroke="#b9382b" strokeWidth="1" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="320" height="200" fill="#f8f4ee" />
          {/* Border traditional frame */}
          <rect x="10" y="10" width="300" height="180" fill="none" stroke="#b9382b" strokeWidth="3" />
          <rect x="16" y="16" width="288" height="168" fill="none" stroke="#17665d" strokeWidth="1" strokeDasharray="4,4" />
          
          {/* Mithila Sun / Mandala */}
          <circle cx="160" cy="100" r="44" fill="url(#sunGrad)" opacity="0.85" />
          <circle cx="160" cy="100" r="54" fill="none" stroke="#f28c28" strokeWidth="2" strokeDasharray="3,3" />
          
          {/* Traditional Mithila Fish Motifs */}
          <g transform="translate(100, 100) scale(0.7)">
            <path d="M -50 0 C -20 -25 20 -25 50 0 C 20 25 -20 25 -50 0 Z" fill="#17665d" opacity="0.9" />
            <circle cx="30" cy="-5" r="4" fill="#fff5e8" />
            <circle cx="30" cy="-5" r="2" fill="#292522" />
            <path d="M 50 0 L 70 -15 L 60 0 L 70 15 Z" fill="#b9382b" />
          </g>

          <g transform="translate(220, 100) scale(0.7) rotate(180)">
            <path d="M -50 0 C -20 -25 20 -25 50 0 C 20 25 -20 25 -50 0 Z" fill="#b9382b" opacity="0.9" />
            <circle cx="30" cy="-5" r="4" fill="#fff5e8" />
            <circle cx="30" cy="-5" r="2" fill="#292522" />
            <path d="M 50 0 L 70 -15 L 60 0 L 70 15 Z" fill="#17665d" />
          </g>

          {/* Lotus Petals */}
          <g transform="translate(160, 100)">
            <path d="M 0 -35 Q 12 -20 0 -10 Q -12 -20 0 -35" fill="#fff5e8" stroke="#b9382b" strokeWidth="1.5" />
            <path d="M 0 35 Q 12 20 0 10 Q -12 20 0 35" fill="#fff5e8" stroke="#b9382b" strokeWidth="1.5" />
            <path d="M -35 0 Q -20 12 -10 0 Q -20 -12 -35 0" fill="#fff5e8" stroke="#b9382b" strokeWidth="1.5" />
            <path d="M 35 0 Q 20 12 10 0 Q 20 -12 35 0" fill="#fff5e8" stroke="#b9382b" strokeWidth="1.5" />
          </g>

          {/* Native corner floral flourishes */}
          <path d="M 16 16 Q 40 40 60 20" stroke="#b9382b" strokeWidth="2" fill="none" />
          <path d="M 304 16 Q 280 40 260 20" stroke="#b9382b" strokeWidth="2" fill="none" />
          <path d="M 16 184 Q 40 160 60 180" stroke="#b9382b" strokeWidth="2" fill="none" />
          <path d="M 304 184 Q 280 160 260 180" stroke="#b9382b" strokeWidth="2" fill="none" />
        </svg>
        <span className="sr-only">{title}</span>
      </div>
    );
  }

  if (type === "basket" || type === "bamboo") {
    return (
      <div className={`relative overflow-hidden bg-sand flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 320 200" className="w-full h-full object-cover">
          <rect width="320" height="200" fill="#e8dfd3" />
          {/* Bamboo weave grid pattern */}
          <g stroke="#9c784e" strokeWidth="4" opacity="0.35">
            <line x1="20" y1="0" x2="320" y2="180" />
            <line x1="60" y1="0" x2="320" y2="150" />
            <line x1="100" y1="0" x2="320" y2="120" />
            <line x1="0" y1="20" x2="300" y2="200" />
            <line x1="0" y1="60" x2="260" y2="200" />
            <line x1="0" y1="100" x2="220" y2="200" />
            
            <line x1="0" y1="180" x2="300" y2="0" stroke="#7a5b35" />
            <line x1="0" y1="140" x2="260" y2="0" stroke="#7a5b35" />
            <line x1="0" y1="100" x2="220" y2="0" stroke="#7a5b35" />
            <line x1="40" y1="200" x2="320" y2="20" stroke="#7a5b35" />
            <line x1="80" y1="200" x2="320" y2="60" stroke="#7a5b35" />
          </g>
          {/* Stylized Bamboo Basket Shape */}
          <ellipse cx="160" cy="115" rx="75" ry="38" fill="#cbb38e" stroke="#5d4224" strokeWidth="3" />
          <ellipse cx="160" cy="100" rx="72" ry="24" fill="#a4845b" stroke="#5d4224" strokeWidth="2.5" />
          <path d="M 88 115 C 88 150 115 168 160 168 C 205 168 232 150 232 115" fill="#b99d75" stroke="#5d4224" strokeWidth="3" />
          {/* Bamboo Rim Bindings */}
          <path d="M 88 100 Q 160 120 232 100" fill="none" stroke="#3b2b18" strokeWidth="4" />
          <line x1="105" y1="103" x2="105" y2="114" stroke="#fff5e8" strokeWidth="2" />
          <line x1="130" y1="106" x2="130" y2="118" stroke="#fff5e8" strokeWidth="2" />
          <line x1="160" y1="108" x2="160" y2="120" stroke="#fff5e8" strokeWidth="2" />
          <line x1="190" y1="106" x2="190" y2="118" stroke="#fff5e8" strokeWidth="2" />
          <line x1="215" y1="103" x2="215" y2="114" stroke="#fff5e8" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (type === "textile" || type === "crochet") {
    return (
      <div className={`relative overflow-hidden bg-sand flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 320 200" className="w-full h-full object-cover">
          <rect width="320" height="200" fill="#f6efe5" />
          {/* Delicate lace rings */}
          <g stroke="#f28c28" strokeWidth="1.5" fill="none" opacity="0.5">
            <circle cx="160" cy="100" r="70" strokeDasharray="3,3" />
            <circle cx="160" cy="100" r="50" strokeWidth="2" />
            <circle cx="160" cy="100" r="30" strokeDasharray="2,2" />
          </g>
          {/* Crochet Floral Mandala */}
          <g transform="translate(160, 100)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <path
                key={angle}
                transform={`rotate(${angle})`}
                d="M 0 0 C 15 -25 35 -15 25 0 C 35 15 15 25 0 0"
                fill="#f28c28"
                fillOpacity="0.4"
                stroke="#b9382b"
                strokeWidth="1.5"
              />
            ))}
            <circle cx="0" cy="0" r="14" fill="#17665d" />
            <circle cx="0" cy="0" r="6" fill="#fff5e8" />
          </g>
          {/* Knitted stitch fringe */}
          <path d="M 30 180 Q 40 170 50 180 Q 60 170 70 180 Q 80 170 90 180 Q 100 170 110 180 Q 120 170 130 180 Q 140 170 150 180 Q 160 170 170 180 Q 180 170 190 180 Q 200 170 210 180 Q 220 170 230 180 Q 240 170 250 180 Q 260 170 270 180 Q 280 170 290 180" fill="none" stroke="#17665d" strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  if (type === "grass" || type === "leaf") {
    return (
      <div className={`relative overflow-hidden bg-sand flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 320 200" className="w-full h-full object-cover">
          <rect width="320" height="200" fill="#f7f2ea" />
          {/* Coiled Sikki Box Top View */}
          <circle cx="160" cy="100" r="75" fill="#e5b842" stroke="#966b16" strokeWidth="3" />
          <circle cx="160" cy="100" r="62" fill="#d8a62a" stroke="#b9382b" strokeWidth="2.5" strokeDasharray="5,2" />
          <circle cx="160" cy="100" r="48" fill="#e5b842" stroke="#17665d" strokeWidth="2" />
          <circle cx="160" cy="100" r="34" fill="#d8a62a" stroke="#966b16" strokeWidth="2" strokeDasharray="4,2" />
          <circle cx="160" cy="100" r="20" fill="#e5b842" stroke="#b9382b" strokeWidth="2" />
          <circle cx="160" cy="100" r="8" fill="#88241b" />
          {/* Geometric Grass Stitch Radials */}
          <g stroke="#fff5e8" strokeWidth="2" opacity="0.8">
            <line x1="160" y1="25" x2="160" y2="52" />
            <line x1="160" y1="148" x2="160" y2="175" />
            <line x1="85" y1="100" x2="112" y2="100" />
            <line x1="208" y1="100" x2="235" y2="100" />
          </g>
        </svg>
      </div>
    );
  }

  if (type === "lamp") {
    return (
      <div className={`relative overflow-hidden bg-sand flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 320 200" className="w-full h-full object-cover">
          <rect width="320" height="200" fill="#292522" />
          {/* Warm Lamp Glow */}
          <circle cx="160" cy="95" r="70" fill="#f28c28" opacity="0.3" filter="blur(10px)" />
          {/* Bamboo Lamp Body */}
          <rect x="120" y="45" width="80" height="110" rx="4" fill="#f3ede5" stroke="#7a5b35" strokeWidth="3" />
          {/* Lattice slats */}
          <g stroke="#5d4224" strokeWidth="3">
            <line x1="120" y1="65" x2="200" y2="65" />
            <line x1="120" y1="85" x2="200" y2="85" />
            <line x1="120" y1="105" x2="200" y2="105" />
            <line x1="120" y1="125" x2="200" y2="125" />
            <line x1="120" y1="145" x2="200" y2="145" />

            <line x1="136" y1="45" x2="136" y2="155" />
            <line x1="152" y1="45" x2="152" y2="155" />
            <line x1="168" y1="45" x2="168" y2="155" />
            <line x1="184" y1="45" x2="184" y2="155" />
          </g>
          {/* Base */}
          <rect x="110" y="155" width="100" height="12" rx="2" fill="#5d4224" />
        </svg>
      </div>
    );
  }

  // Fallback Terracotta / Ceramic / Decor
  return (
    <div className={`relative overflow-hidden bg-sand flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 320 200" className="w-full h-full object-cover">
        <rect width="320" height="200" fill="#f3ede5" />
        {/* Pot / Vessel */}
        <ellipse cx="160" cy="55" rx="35" ry="10" fill="#a84332" stroke="#682116" strokeWidth="2" />
        <path d="M 125 55 C 110 80 100 120 120 150 C 130 165 190 165 200 150 C 220 120 210 80 195 55 Z" fill="#b9382b" stroke="#682116" strokeWidth="3" />
        {/* Traditional Engraved bands */}
        <path d="M 112 110 Q 160 125 208 110" fill="none" stroke="#f28c28" strokeWidth="3" />
        <path d="M 116 125 Q 160 140 204 125" fill="none" stroke="#17665d" strokeWidth="2.5" strokeDasharray="3,3" />
        <ellipse cx="160" cy="155" rx="30" ry="7" fill="#682116" />
      </svg>
    </div>
  );
}
