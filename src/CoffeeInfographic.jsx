import { useState, useEffect } from "react";
import { coffees } from "./coffeeData";

const DIMS = ["Fruity", "Floral", "Sweet", "Nutty", "Spicy", "Earthy"];
const NUM = DIMS.length;

const DIM_COLORS = [
  "#E8735A", // Fruity  — coral red
  "#A98BC7", // Floral  — muted violet/lavender
  "#D4A843", // Sweet   — amber gold
  "#C4956A", // Nutty   — warm tan
  "#C46A3A", // Spicy   — terracotta
  "#7A9B6A", // Earthy  — sage olive
];

const COLORS = {
  grid: "#3A2A14",
  gridOuter: "#8B6F4E",
  label: "#C4A882",
  sub: "#8B6F4E",
  bg: "#1A1008",
  cardBg: "#1F1409",
  cardBorder: "#2A1A08",
};

// ─── Radar Chart ────────────────────────────────────────────────────────────

function RadarChart({ scores, size = 110, onDotClick, activeDim }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38;
  const LEVELS = 4;
  const uid = size;

  function toXY(angle, r) {
    return {
      x: cx + r * Math.cos(angle - Math.PI / 2),
      y: cy + r * Math.sin(angle - Math.PI / 2),
    };
  }

  const polyPoints = scores
    .map((s, i) => {
      const angle = (2 * Math.PI * i) / NUM;
      const r = (s / 10) * R;
      const { x, y } = toXY(angle, r);
      return `${x},${y}`;
    })
    .join(" ");

  const levelGrids = Array.from({ length: LEVELS }, (_, li) => {
    const r = ((li + 1) / LEVELS) * R;
    return Array.from({ length: NUM }, (__, i) => {
      const angle = (2 * Math.PI * i) / NUM;
      const { x, y } = toXY(angle, r);
      return `${x},${y}`;
    }).join(" ");
  });

  const dimLabelPos = DIMS.map((_, i) => {
    const angle = (2 * Math.PI * i) / NUM;
    return toXY(angle, R + 13);
  });

  const dimTickPos = DIMS.map((_, i) => {
    const angle = (2 * Math.PI * i) / NUM;
    return toXY(angle, R);
  });

  const dotPositions = scores.map((s, i) => {
    const angle = (2 * Math.PI * i) / NUM;
    const r = (s / 10) * R;
    return toXY(angle, r);
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`rg-${uid}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#D4A843" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#A98BC7" stopOpacity="0.12" />
        </radialGradient>
        <filter id={`glow-${uid}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid levels */}
      {levelGrids.map((pts, li) => (
        <polygon
          key={li}
          points={pts}
          fill="none"
          stroke={li === LEVELS - 1 ? COLORS.gridOuter : COLORS.grid}
          strokeWidth={li === LEVELS - 1 ? 0.8 : 0.5}
          strokeOpacity={li === LEVELS - 1 ? 0.8 : 0.5}
        />
      ))}

      {/* Axis lines */}
      {dimTickPos.map(({ x, y }, i) => (
        <line
          key={i}
          x1={cx} y1={cy} x2={x} y2={y}
          stroke={DIM_COLORS[i]}
          strokeWidth={0.6}
          strokeOpacity={0.4}
        />
      ))}

      {/* Filled area */}
      <polygon
        points={polyPoints}
        fill={`url(#rg-${uid})`}
        stroke="#C4A882"
        strokeWidth={0.8}
        strokeOpacity={0.6}
        filter={`url(#glow-${uid})`}
      />

      {/* Dots — clickable, r=3.5, with hover pulse ring */}
      {dotPositions.map(({ x, y }, i) => {
        const isActive = activeDim === i;
        return (
          <g
            key={i}
            className="radar-dot-group"
            onClick={(e) => { e.stopPropagation(); onDotClick(i); }}
            style={{ cursor: "pointer" }}
          >
            {/* Pulse ring */}
            <circle
              cx={x} cy={y} r={7}
              fill="none"
              stroke={DIM_COLORS[i]}
              strokeWidth={1.2}
              className={isActive ? "dot-ring dot-ring-active" : "dot-ring"}
            />
            {/* Dot */}
            <circle
              cx={x} cy={y} r={3.5}
              fill={DIM_COLORS[i]}
              stroke={COLORS.bg}
              strokeWidth={0.8}
              className="radar-dot"
            />
          </g>
        );
      })}

      {/* Dim labels */}
      {DIMS.map((d, i) => (
        <text
          key={i}
          x={dimLabelPos[i].x}
          y={dimLabelPos[i].y + 3}
          textAnchor="middle"
          fill={DIM_COLORS[i]}
          fontSize="6.5"
          fontFamily="Georgia, serif"
          letterSpacing="0.03em"
          opacity={0.9}
        >
          {d}
        </text>
      ))}

      <circle cx={cx} cy={cy} r={1.5} fill={COLORS.gridOuter} opacity={0.5} />
    </svg>
  );
}

// ─── Popover ─────────────────────────────────────────────────────────────────

function Popover({ coffee, dimIndex, onClose }) {
  const dim = DIMS[dimIndex];
  const color = DIM_COLORS[dimIndex];
  const highlight = coffee.highlights[dimIndex];
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.55)",
          }}
        />
        {/* Bottom sheet */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            zIndex: 1000,
            background: "#1F1409",
            borderTop: `1px solid ${color}99`,
            borderRadius: "12px 12px 0 0",
            padding: "16px 20px 36px",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
            fontFamily: "Georgia, serif",
            animation: "slideUp 0.2s ease both",
          }}
        >
          <PopoverContent dim={dim} color={color} highlight={highlight} onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 8, left: 8, right: 8,
        zIndex: 100,
        background: "#1F1409",
        border: `1px solid ${color}99`,
        borderRadius: 8,
        padding: "10px 12px 10px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.65), 0 0 14px ${color}1A`,
        fontFamily: "Georgia, serif",
        animation: "popoverIn 0.15s ease both",
      }}
    >
      <PopoverContent dim={dim} color={color} highlight={highlight} onClose={onClose} />
    </div>
  );
}

function PopoverContent({ dim, color, highlight, onClose }) {
  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: highlight ? 8 : 6,
      }}>
        <span style={{
          fontSize: 10,
          color,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          {dim}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none",
            color: COLORS.sub, fontSize: 16,
            cursor: "pointer", padding: "0 0 0 10px",
            lineHeight: 1, fontFamily: "Georgia, serif",
          }}
        >
          ×
        </button>
      </div>

      {highlight ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
            {highlight.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9,
                  color,
                  background: `${color}30`,
                  border: `1px solid ${color}55`,
                  borderRadius: 20,
                  padding: "2px 8px",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p style={{
            margin: 0,
            fontSize: 10,
            color: COLORS.label,
            fontStyle: "italic",
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}>
            {highlight.note}
          </p>
        </>
      ) : (
        <p style={{
          margin: 0,
          fontSize: 10,
          color: COLORS.sub,
          fontStyle: "italic",
          lineHeight: 1.55,
        }}>
          Not a prominent characteristic for this origin.
        </p>
      )}
    </>
  );
}

// ─── Coffee Card ──────────────────────────────────────────────────────────────

function CoffeeCard({ coffee, index, activePopoverDim, onDotClick, onClosePopover }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? "#231508" : COLORS.cardBg,
        border: `1px solid ${hovered ? "#5A3A18" : COLORS.cardBorder}`,
        borderRadius: 6,
        padding: "18px 14px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transition: "all 0.3s ease",
        boxShadow: hovered ? "0 4px 24px rgba(212,168,67,0.08)" : "none",
        cursor: "default",
        animation: `fadeIn 0.5s ease ${index * 0.06}s both`,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 9.5, letterSpacing: "0.22em", color: COLORS.sub,
          textTransform: "uppercase", marginBottom: 3,
        }}>
          {coffee.region}
        </div>
        <div style={{
          fontSize: 15, color: "#F0DEB8", fontFamily: "Georgia, serif",
          letterSpacing: "0.04em", lineHeight: 1.2,
        }}>
          {coffee.name}
        </div>
      </div>

      <RadarChart
        scores={coffee.scores}
        size={112}
        onDotClick={onDotClick}
        activeDim={activePopoverDim}
      />

      <div style={{
        fontSize: 9, color: COLORS.sub, fontStyle: "italic",
        fontFamily: "Georgia, serif", textAlign: "center",
        lineHeight: 1.5, letterSpacing: "0.03em",
      }}>
        {coffee.note}
      </div>

      {/* Score bars */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
        {DIMS.map((d, i) => (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              fontSize: 7.5, color: DIM_COLORS[i], width: 32,
              flexShrink: 0, letterSpacing: "0.05em", opacity: 0.85,
            }}>
              {d.slice(0, 5)}
            </div>
            <div style={{ flex: 1, height: 3, background: "#2A1A08", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${coffee.scores[i] * 10}%`,
                background: DIM_COLORS[i],
                borderRadius: 2, opacity: 0.85,
                transition: "width 0.8s ease",
              }} />
            </div>
            <div style={{
              fontSize: 7.5, color: DIM_COLORS[i], width: 14,
              textAlign: "right", opacity: 0.7,
            }}>
              {coffee.scores[i]}
            </div>
          </div>
        ))}
      </div>

      {/* Popover */}
      {activePopoverDim != null && (
        <Popover
          coffee={coffee}
          dimIndex={activePopoverDim}
          onClose={onClosePopover}
        />
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function CoffeeInfographic() {
  const [sortDim, setSortDim] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  // { coffeeName: string, dimIndex: number } | null
  const [activePopover, setActivePopover] = useState(null);

  function handleDimClick(i) {
    if (sortDim === i) {
      if (sortDir === "desc") {
        setSortDir("asc");
      } else {
        setSortDim(null);
        setSortDir("desc");
      }
    } else {
      setSortDim(i);
      setSortDir("desc");
    }
  }

  function handleDotClick(coffeeName, dimIndex) {
    setActivePopover((prev) =>
      prev?.coffeeName === coffeeName && prev?.dimIndex === dimIndex
        ? null
        : { coffeeName, dimIndex }
    );
  }

  // Click anywhere outside a popover closes it
  useEffect(() => {
    if (!activePopover) return;
    function onDocClick() { setActivePopover(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [activePopover]);

  const sortedCoffees =
    sortDim === null
      ? coffees
      : coffees.slice().sort((a, b) =>
          sortDir === "desc"
            ? b.scores[sortDim] - a.scores[sortDim]
            : a.scores[sortDim] - b.scores[sortDim]
        );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "40px 24px 56px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popoverIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { opacity: 0.75; }
          50%  { opacity: 0.2;  }
          100% { opacity: 0.75; }
        }
        .radar-dot-group .dot-ring {
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .radar-dot-group:hover .dot-ring {
          opacity: 0.7;
          animation: pulseRing 1.2s ease infinite;
        }
        .dot-ring-active {
          opacity: 0.8 !important;
          animation: pulseRing 1.2s ease infinite !important;
        }
        .radar-dot-group:hover .radar-dot {
          filter: brightness(1.25);
        }
        .coffee-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          transition: opacity 0.15s ease;
        }
        @media (max-width: 700px) {
          .coffee-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 701px) and (max-width: 960px) {
          .coffee-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      {/* Background radial */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 900, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(180,120,40,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.4em", color: COLORS.sub,
            textTransform: "uppercase", marginBottom: 14,
          }}>
            A Comparative Tasting Guide
          </div>
          <h1 style={{
            fontSize: "clamp(30px,5vw,48px)", fontWeight: "normal",
            color: "#F0DEB8", margin: 0, letterSpacing: "0.05em",
          }}>
            Coffees of the World
          </h1>
          <div style={{
            width: 56, height: 1, background: COLORS.gridOuter,
            margin: "18px auto", opacity: 0.7,
          }} />
          <p style={{
            fontSize: 12, color: COLORS.sub, margin: 0,
            letterSpacing: "0.08em", fontStyle: "italic",
          }}>
            Flavor profiles across six dimensions · Light-to-medium roast reference
          </p>

          {/* Legend / sort controls */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 20,
            marginTop: 20, flexWrap: "wrap",
          }}>
            {DIMS.map((d, i) => {
              const active = sortDim === i;
              return (
                <div
                  key={d}
                  onClick={() => handleDimClick(i)}
                  style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                >
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: DIM_COLORS[i],
                    opacity: active ? 1 : (sortDim === null ? 0.9 : 0.5),
                    transition: "opacity 0.2s",
                  }} />
                  <span style={{
                    fontSize: 9.5,
                    color: DIM_COLORS[i],
                    letterSpacing: "0.08em",
                    opacity: active ? 1 : (sortDim === null ? 0.9 : 0.5),
                    borderBottom: active ? `1px solid ${DIM_COLORS[i]}` : "1px solid transparent",
                    paddingBottom: 1,
                    transition: "opacity 0.2s",
                    userSelect: "none",
                  }}>
                    {d}{active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="coffee-grid">
          {sortedCoffees.map((coffee, i) => (
            <CoffeeCard
              key={coffee.name}
              coffee={coffee}
              index={i}
              activePopoverDim={
                activePopover?.coffeeName === coffee.name
                  ? activePopover.dimIndex
                  : null
              }
              onDotClick={(dimIndex) => handleDotClick(coffee.name, dimIndex)}
              onClosePopover={() => setActivePopover(null)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: 40,
          fontSize: 9.5, color: "#3A2A14",
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          Scores are illustrative averages across origins and processing methods
        </div>
      </div>
    </div>
  );
}
