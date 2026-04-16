import { useState, useEffect } from "react";
import { coffees } from "./coffeeData";

const DIMS = ["Fruity", "Floral", "Sweet", "Nutty", "Spicy", "Earthy"];
const DIM_DESCS = [
  "berries, citrus, stone fruit",
  "jasmine, rose, herbal",
  "caramel, honey, sugar",
  "hazelnut, almond, cocoa",
  "pepper, clove, cinnamon",
  "cedar, tobacco, soil",
];
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
          fontSize: 11, letterSpacing: "0.22em", color: COLORS.sub,
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
        fontSize: 11, color: COLORS.sub, fontStyle: "italic",
        fontFamily: "Georgia, serif", textAlign: "center",
        lineHeight: 1.5, letterSpacing: "0.03em",
      }}>
        {coffee.note}
      </div>

      {/* Score bars */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
        {DIMS.map((d, i) => (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              fontSize: 10, color: DIM_COLORS[i], width: 36,
              flexShrink: 0, letterSpacing: "0.04em", opacity: 0.85,
            }}>
              {d}
            </div>
            <div style={{ flex: 1, height: 2, background: "#2A1A08", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${coffee.scores[i] * 10}%`,
                background: DIM_COLORS[i],
                borderRadius: 2, opacity: 0.85,
                transition: "width 0.8s ease",
              }} />
            </div>
            <div style={{
              fontSize: 10, color: DIM_COLORS[i], width: 18,
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

// ─── Tag Index (inverted: tag → coffees, grouped by dimension) ───────────────
// Each entry: [ tag string, coffee[] ] sorted by number of coffees descending

const TAG_INDEX = DIMS.map((_, dimIdx) => {
  const map = new Map();
  coffees.forEach((coffee) => {
    const h = coffee.highlights[dimIdx];
    if (!h) return;
    h.tags.forEach((tag) => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(coffee);
    });
  });
  return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
});

// ─── Chip Radar Tooltip ───────────────────────────────────────────────────────

function ChipTooltip({ coffee, anchorRect, onClose }) {
  const TOOLTIP_WIDTH = 190;
  const isMobile = window.innerWidth < 640;

  if (isMobile) {
    return (
      <>
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            zIndex: 299, background: "rgba(0,0,0,0.55)",
          }}
        />
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            zIndex: 300,
            background: "#1F1409",
            borderTop: `1px solid ${COLORS.gridOuter}`,
            borderRadius: "12px 12px 0 0",
            padding: "16px 20px 36px",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
            fontFamily: "Georgia, serif",
            animation: "slideUp 0.2s ease both",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}
        >
          <button
            onClick={onClose}
            style={{
              alignSelf: "flex-end", background: "none", border: "none",
              color: COLORS.sub, fontSize: 18, cursor: "pointer",
              fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 4,
            }}
          >×</button>
          <ChipTooltipContent coffee={coffee} />
        </div>
      </>
    );
  }

  // Desktop: fixed card anchored near the chip, clamped to viewport
  const approxHeight = 260;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top = spaceBelow > approxHeight + 12
    ? anchorRect.bottom + 8
    : anchorRect.top - approxHeight - 8;
  const rawLeft = anchorRect.left + anchorRect.width / 2 - TOOLTIP_WIDTH / 2;
  const left = Math.max(8, Math.min(rawLeft, window.innerWidth - TOOLTIP_WIDTH - 8));

  return (
    <div
      style={{
        position: "fixed",
        top, left,
        width: TOOLTIP_WIDTH,
        zIndex: 300,
        background: "#1F1409",
        border: `1px solid ${COLORS.gridOuter}55`,
        borderRadius: 8,
        padding: "12px 12px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        fontFamily: "Georgia, serif",
        animation: "popoverIn 0.15s ease both",
        pointerEvents: "none",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}
    >
      <ChipTooltipContent coffee={coffee} />
    </div>
  );
}

function ChipTooltipContent({ coffee }) {
  return (
    <>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 9, color: COLORS.sub,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 2,
        }}>
          {coffee.region}
        </div>
        <div style={{
          fontSize: 14, color: "#F0DEB8",
          letterSpacing: "0.04em", lineHeight: 1.2,
        }}>
          {coffee.name}
        </div>
      </div>
      <RadarChart scores={coffee.scores} size={130} onDotClick={() => {}} activeDim={null} />
      <div style={{
        fontSize: 9.5, color: COLORS.sub, fontStyle: "italic",
        textAlign: "center", lineHeight: 1.5, letterSpacing: "0.03em",
      }}>
        {coffee.note}
      </div>
    </>
  );
}

// ─── Tag View ─────────────────────────────────────────────────────────────────

function TagView() {
  const [activeChip, setActiveChip] = useState(null);
  // { coffee, anchorRect }

  useEffect(() => {
    if (!activeChip) return;
    function onDocClick() { setActiveChip(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [activeChip]);

  function handleChipEnter(e, coffee) {
    if (window.innerWidth >= 640) {
      setActiveChip({ coffee, anchorRect: e.currentTarget.getBoundingClientRect() });
    }
  }

  function handleChipClick(e, coffee) {
    e.stopPropagation();
    if (window.innerWidth < 640) {
      setActiveChip((prev) =>
        prev?.coffee.name === coffee.name ? null : { coffee, anchorRect: e.currentTarget.getBoundingClientRect() }
      );
    }
  }

  return (
    <>
      <div className="tag-grid">
        {DIMS.map((dim, i) => (
          <div
            key={dim}
            style={{
              background: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 8,
              padding: "16px 16px 18px",
            }}
          >
            {/* Section header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 14, paddingBottom: 10,
              borderBottom: `1px solid ${DIM_COLORS[i]}33`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: DIM_COLORS[i], flexShrink: 0,
              }} />
              <span style={{
                fontSize: 11, color: DIM_COLORS[i],
                letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                {dim}
              </span>
              <span style={{
                fontSize: 9, color: COLORS.sub, fontStyle: "italic",
                fontFamily: "Georgia, serif", marginLeft: "auto",
                letterSpacing: "0.03em",
              }}>
                {DIM_DESCS[i]}
              </span>
            </div>

            {/* Tag rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TAG_INDEX[i].map(([tag, tagCoffees]) => (
                <div key={tag}>
                  <div style={{
                    fontSize: 10.5, color: DIM_COLORS[i],
                    fontFamily: "Georgia, serif", letterSpacing: "0.04em",
                    marginBottom: 5, opacity: 0.95,
                  }}>
                    {tag}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {tagCoffees.map((c) => {
                      const isActive = activeChip?.coffee.name === c.name;
                      return (
                        <span
                          key={c.name}
                          onMouseEnter={(e) => handleChipEnter(e, c)}
                          onMouseLeave={() => setActiveChip(null)}
                          onClick={(e) => handleChipClick(e, c)}
                          style={{
                            fontSize: 9.5,
                            color: isActive ? "#F0DEB8" : COLORS.label,
                            background: isActive ? `${DIM_COLORS[i]}35` : `${DIM_COLORS[i]}18`,
                            border: `1px solid ${isActive ? DIM_COLORS[i] : DIM_COLORS[i] + "33"}`,
                            borderRadius: 12,
                            padding: "2px 9px",
                            fontFamily: "Georgia, serif",
                            letterSpacing: "0.03em",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {c.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeChip && (
        <ChipTooltip
          coffee={activeChip.coffee}
          anchorRect={activeChip.anchorRect}
          onClose={() => setActiveChip(null)}
        />
      )}
    </>
  );
}

// ─── Heatmap View ────────────────────────────────────────────────────────────

function HeatmapTooltip({ coffee, dimIndex, anchorRect }) {
  const color = DIM_COLORS[dimIndex];
  const highlight = coffee.highlights[dimIndex];
  const TOOLTIP_WIDTH = 220;

  // Position below the cell, clamped to viewport edges
  const top = anchorRect.bottom + 8;
  const rawLeft = anchorRect.left + anchorRect.width / 2 - TOOLTIP_WIDTH / 2;
  const left = Math.max(8, Math.min(rawLeft, window.innerWidth - TOOLTIP_WIDTH - 8));

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        width: TOOLTIP_WIDTH,
        zIndex: 200,
        background: "#1F1409",
        border: `1px solid ${color}99`,
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 14px ${color}1A`,
        fontFamily: "Georgia, serif",
        animation: "popoverIn 0.15s ease both",
        pointerEvents: "none",
      }}
    >
      {/* Header */}
      <div style={{
        fontSize: 10, color, letterSpacing: "0.2em",
        textTransform: "uppercase", marginBottom: 8,
      }}>
        {coffee.name} · {DIMS[dimIndex]}
      </div>

      {highlight ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 7 }}>
            {highlight.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 9, color,
                background: `${color}30`,
                border: `1px solid ${color}55`,
                borderRadius: 20,
                padding: "2px 8px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}>
                {tag}
              </span>
            ))}
          </div>
          <p style={{
            margin: 0, fontSize: 10, color: COLORS.label,
            fontStyle: "italic", lineHeight: 1.6, letterSpacing: "0.02em",
          }}>
            {highlight.note}
          </p>
        </>
      ) : (
        <p style={{
          margin: 0, fontSize: 10, color: COLORS.sub,
          fontStyle: "italic", lineHeight: 1.55,
        }}>
          Not a prominent characteristic for this origin.
        </p>
      )}
    </div>
  );
}

function HeatmapView({ coffees, sortDim, onDimClick, sortDir }) {
  const [tooltip, setTooltip] = useState(null);
  // tooltip: { coffee, dimIndex, anchorRect } | null

  function handleCellEnter(e, coffee, i) {
    setTooltip({ coffee, dimIndex: i, anchorRect: e.currentTarget.getBoundingClientRect() });
  }

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr repeat(6, minmax(44px, 60px))",
        minWidth: 360,
        gap: 2,
      }}>
        {/* Header row */}
        <div style={{ padding: "6px 8px" }} />
        {DIMS.map((d, i) => {
          const active = sortDim === i;
          return (
            <div
              key={d}
              onClick={() => onDimClick(i)}
              style={{
                padding: "8px 4px 6px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: 4,
                userSelect: "none",
              }}
            >
              <div style={{
                fontSize: 9.5,
                color: DIM_COLORS[i],
                letterSpacing: "0.08em",
                opacity: active ? 1 : 0.75,
                borderBottom: active ? `1px solid ${DIM_COLORS[i]}` : "1px solid transparent",
                paddingBottom: 2,
                transition: "opacity 0.2s",
                display: "inline-block",
              }}>
                {d}{active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
              </div>
            </div>
          );
        })}

        {/* Data rows */}
        {coffees.map((coffee) => (
          <>
            {/* Name cell */}
            <div
              key={coffee.name + "-label"}
              style={{
                padding: "10px 10px 10px 4px",
                borderTop: `1px solid ${COLORS.cardBorder}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <div style={{
                fontSize: 12, color: "#F0DEB8",
                fontFamily: "Georgia, serif", letterSpacing: "0.03em",
                lineHeight: 1.2,
              }}>
                {coffee.name}
              </div>
              <div style={{
                fontSize: 9, color: COLORS.sub,
                letterSpacing: "0.15em", textTransform: "uppercase",
              }}>
                {coffee.region}
              </div>
              <div style={{
                fontSize: 9, color: COLORS.sub,
                fontStyle: "italic", fontFamily: "Georgia, serif",
                letterSpacing: "0.02em", lineHeight: 1.4, opacity: 0.8,
              }}>
                {coffee.note}
              </div>
            </div>

            {/* Score cells */}
            {coffee.scores.map((score, i) => (
              <div
                key={coffee.name + "-" + i}
                onMouseEnter={(e) => handleCellEnter(e, coffee, i)}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  position: "relative",
                  borderTop: `1px solid ${COLORS.cardBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  overflow: "hidden",
                  minHeight: 44,
                  cursor: "default",
                }}
              >
                {/* Color fill */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: DIM_COLORS[i],
                  opacity: 0.06 + (score / 10) * 0.74,
                  transition: "opacity 0.2s",
                }} />
                {/* Hover highlight ring */}
                {tooltip?.coffee.name === coffee.name && tooltip?.dimIndex === i && (
                  <div style={{
                    position: "absolute", inset: 0,
                    border: `1px solid ${DIM_COLORS[i]}`,
                    borderRadius: 3,
                    pointerEvents: "none",
                  }} />
                )}
                {/* Score */}
                <span style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 12,
                  fontFamily: "Georgia, serif",
                  color: score >= 6 ? "#F0DEB8" : COLORS.sub,
                  opacity: 0.9,
                }}>
                  {score}
                </span>
              </div>
            ))}
          </>
        ))}
      </div>

      {/* Tooltip portal */}
      {tooltip && (
        <HeatmapTooltip
          coffee={tooltip.coffee}
          dimIndex={tooltip.dimIndex}
          anchorRect={tooltip.anchorRect}
        />
      )}
    </div>
  );
}

// ─── Methodology Modal ────────────────────────────────────────────────────────

function MethodologyModal({ onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          zIndex: 400, background: "rgba(0,0,0,0.7)",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 401,
          width: "min(600px, 92vw)",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "#1F1409",
          border: `1px solid ${COLORS.gridOuter}`,
          borderRadius: 10,
          padding: "28px 28px 24px",
          fontFamily: "Georgia, serif",
          animation: "popoverIn 0.18s ease both",
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 20,
        }}>
          <div>
            <div style={{
              fontSize: 9, letterSpacing: "0.3em", color: COLORS.sub,
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Scoring Methodology
            </div>
            <h2 style={{
              margin: 0, fontSize: 18, fontWeight: "normal",
              color: "#F0DEB8", letterSpacing: "0.04em",
            }}>
              How scores are assigned
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: COLORS.sub,
            fontSize: 20, cursor: "pointer", padding: "0 0 0 16px",
            fontFamily: "Georgia, serif", lineHeight: 1, flexShrink: 0,
          }}>×</button>
        </div>

        <p style={{
          fontSize: 11, color: COLORS.label, lineHeight: 1.75,
          letterSpacing: "0.02em", marginBottom: 20,
        }}>
          Each origin is scored 1–10 across six flavor dimensions based on
          commonly cited tasting notes for that region at a{" "}
          <em>light-to-medium roast level</em>. Scores represent illustrative
          averages across the most typical varietals and processing methods for
          each origin — individual lots vary significantly with altitude,
          harvest year, and producer. Natural and honey-processed lots tend to
          score higher on Fruity and Sweet; washed lots tend toward cleaner
          Floral and brighter acidity.
        </p>

        <div style={{ width: "100%", height: 1, background: COLORS.cardBorder, marginBottom: 20 }} />

        {DIMS.map((dim, i) => (
          <div key={dim} style={{ marginBottom: 18 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: DIM_COLORS[i], flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10.5, color: DIM_COLORS[i],
                letterSpacing: "0.14em", textTransform: "uppercase",
              }}>
                {dim}
              </span>
              <span style={{
                fontSize: 9, color: COLORS.sub, fontStyle: "italic",
              }}>
                — {DIM_DESCS[i]}
              </span>
            </div>
            <p style={{
              margin: 0, marginLeft: 15,
              fontSize: 10.5, color: COLORS.sub, lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}>
              {[
                "Presence of berry, citrus, stone fruit, or tropical notes. High scores are typical of high-altitude East African and some Central American origins. Natural processing amplifies fruit intensity significantly.",
                "Aromatic floral complexity: jasmine, rose, bergamot, herbal. Scores above 8 are rare and almost exclusively associated with Geisha varietals or washed Ethiopian Yirgacheffe lots.",
                "Perceived sweetness and body: caramel, honey, sugar, chocolate. Not added sugar — sweetness inherent in the bean. Natural-process and honey-process coffees score highest. Strongly correlated with full body.",
                "Nut and cocoa character: hazelnut, almond, walnut, dark chocolate. Most prominent in Brazilian, Colombian, and low-altitude Central American origins, especially at medium roast.",
                "Spice and aromatic warmth: pepper, cardamom, clove, cinnamon. Scores above 6 are primarily found in Yemeni and Indian origins. Often present as a background note in many others.",
                "Terroir-driven characteristics: cedar, tobacco, wet soil, mushroom. Highest in Indonesian origins processed by wet-hulling (giling basah). Low scores indicate clean, terroir-neutral cups.",
              ][i]}
            </p>
          </div>
        ))}

        <div style={{ width: "100%", height: 1, background: COLORS.cardBorder, margin: "20px 0 16px" }} />
        <p style={{
          margin: 0, fontSize: 9.5, color: "#3A2A14",
          letterSpacing: "0.1em", fontStyle: "italic", textAlign: "center",
        }}>
          Scores are illustrative and educational — not the result of controlled sensory analysis.
        </p>
      </div>
    </>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function CoffeeInfographic() {
  const [sortDim, setSortDim] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [view, setView] = useState("cards");
  const [showMethodology, setShowMethodology] = useState(false);
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
    <>
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
        .coffee-grid, .tag-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          transition: opacity 0.15s ease;
        }
        @media (max-width: 700px) {
          .coffee-grid, .tag-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 701px) and (max-width: 960px) {
          .coffee-grid, .tag-grid {
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
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            <p style={{
              fontSize: 12, color: COLORS.sub, margin: 0,
              letterSpacing: "0.08em", fontStyle: "italic",
            }}>
              Flavor profiles across six dimensions · Light-to-medium roast reference
            </p>
            <button
              onClick={() => setShowMethodology(true)}
              title="Scoring methodology"
              style={{
                background: "none", border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: "50%", width: 16, height: 16,
                color: COLORS.sub, fontSize: 9, cursor: "pointer",
                fontFamily: "Georgia, serif", lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "border-color 0.2s, color 0.2s",
                padding: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.gridOuter;
                e.currentTarget.style.color = COLORS.label;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.cardBorder;
                e.currentTarget.style.color = COLORS.sub;
              }}
            >
              i
            </button>
          </div>

          {/* Legend / sort controls */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 20,
            marginTop: 20, flexWrap: "wrap",
          }}>
            {DIMS.map((d, i) => {
              const active = sortDim === i;
              const dimOpacity = active ? 1 : (sortDim === null ? 0.9 : 0.5);
              return (
                <div
                  key={d}
                  onClick={() => handleDimClick(i)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 3, cursor: "pointer", minWidth: 70,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: DIM_COLORS[i],
                      opacity: dimOpacity,
                      transition: "opacity 0.2s",
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 9.5,
                      color: DIM_COLORS[i],
                      letterSpacing: "0.08em",
                      opacity: dimOpacity,
                      borderBottom: active ? `1px solid ${DIM_COLORS[i]}` : "1px solid transparent",
                      paddingBottom: 1,
                      transition: "opacity 0.2s",
                      userSelect: "none",
                    }}>
                      {d}{active ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 8.5,
                    color: DIM_COLORS[i],
                    opacity: dimOpacity * 0.6,
                    letterSpacing: "0.04em",
                    fontStyle: "italic",
                    fontFamily: "Georgia, serif",
                    userSelect: "none",
                    transition: "opacity 0.2s",
                  }}>
                    {DIM_DESCS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* View toggle */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 0,
          marginBottom: 24,
        }}>
          {["cards", "heatmap", "tags"].map((v, idx) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: "none",
                border: `1px solid ${view === v ? COLORS.gridOuter : COLORS.cardBorder}`,
                borderRadius: idx === 0 ? "4px 0 0 4px" : idx === 2 ? "0 4px 4px 0" : "0",
                padding: "5px 18px",
                color: view === v ? "#F0DEB8" : COLORS.sub,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
                transition: "all 0.2s",
                marginLeft: idx === 0 ? 0 : -1,
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {view === "cards" && (
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
        )}

        {/* Heatmap */}
        {view === "heatmap" && (
          <HeatmapView
            coffees={sortedCoffees}
            sortDim={sortDim}
            sortDir={sortDir}
            onDimClick={handleDimClick}
          />
        )}

        {/* Tag index */}
        {view === "tags" && <TagView />}


        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: 40,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{
            fontSize: 9.5, color: "#3A2A14",
            letterSpacing: "0.2em", textTransform: "uppercase",
          }}>
            Scores are illustrative averages across origins and processing methods
          </div>
          <div style={{
            fontSize: 10, color: COLORS.sub,
            fontFamily: "Georgia, serif", letterSpacing: "0.06em",
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 12, flexWrap: "wrap",
          }}>
            <span>made with ☕❤️ by @neilkod</span>
            <span style={{ color: "#3A2A14" }}>·</span>
            <a href="mailto:nkodner@gmail.com" style={{
              color: COLORS.sub, textDecoration: "none",
              borderBottom: `1px solid ${COLORS.sub}55`,
              paddingBottom: 1, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = COLORS.label}
              onMouseLeave={e => e.target.style.color = COLORS.sub}
            >
              nkodner@gmail.com
            </a>
            <span style={{ color: "#3A2A14" }}>·</span>
            <a href="https://github.com/neilkod/coffee-flavor-map" target="_blank" rel="noreferrer" style={{
              color: COLORS.sub, textDecoration: "none",
              borderBottom: `1px solid ${COLORS.sub}55`,
              paddingBottom: 1, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = COLORS.label}
              onMouseLeave={e => e.target.style.color = COLORS.sub}
            >
              github
            </a>
          </div>
        </div>
      </div>
    </div>

      {showMethodology && (
        <MethodologyModal onClose={() => setShowMethodology(false)} />
      )}
    </>
  );
}
