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

// ─── Process Badge ───────────────────────────────────────────────────────────

const PROCESS_EXPLAINERS = {
  "Washed": "The cherry skin and fruit pulp are removed before drying, then the bean is fermented in water tanks and thoroughly rinsed. This strips away most fruit sugars, producing a clean, transparent cup where terroir and varietal character shine through. The world's most common method.",
  "Natural": "The whole cherry is dried intact on raised beds — sometimes for 4–6 weeks — allowing fruit sugars to slowly absorb into the bean. The result is a heavier body, lower acidity, and intense fruit character: think blueberry, wine, and dark berry. Unpredictable but often spectacular.",
  "Honey": "The skin is removed but the sticky mucilage layer (the 'honey') is left on the bean during drying. The more mucilage retained, the sweeter and more fruit-forward the cup. Yellow Honey ≈ 50%, Red Honey ≈ 75%, Black Honey ≈ 100% mucilage remaining. Costa Rica perfected this method.",
  "Wet-Hulled": "Unique to Indonesia (called Giling Basah). The parchment layer is removed while the bean is still at ~50% moisture — far earlier than any other method — then dried further. This fundamentally alters the bean's cellular structure, producing the characteristic low acidity, full body, and earthy, sometimes herbal depth that defines Sumatran and Sulawesi coffees.",
  "Monsooned": "Unique to India's Malabar Coast. Green coffee is spread in open warehouses and exposed to humid monsoon winds for 12–16 weeks. The beans swell to nearly twice their size, absorb moisture, and lose almost all acidity. The process recreates what happened accidentally to Indian coffee during 19th-century sea voyages to Europe — and the result is unlike anything else: malty, spicy, and deeply earthy.",
};

const PROCESS_COLORS = {
  "Washed":     { bg: "#1A2E3A", border: "#2A6A8A", text: "#7ABBD0" },
  "Natural":    { bg: "#2E1A0E", border: "#8A4A2A", text: "#D09070" },
  "Honey":      { bg: "#2E2A0A", border: "#8A7A20", text: "#D0C060" },
  "Wet-Hulled": { bg: "#1A2A1A", border: "#3A6A3A", text: "#7AB87A" },
  "Monsooned":  { bg: "#2A1A2E", border: "#6A3A8A", text: "#B07AD0" },
};

function ProcessBadge({ process, size = "sm" }) {
  const c = PROCESS_COLORS[process] ?? { bg: "#1F1409", border: COLORS.gridOuter, text: COLORS.label };
  const fs = size === "lg" ? 10 : 8.5;
  const px = size === "lg" ? 10 : 7;
  const py = size === "lg" ? 3 : 2;
  return (
    <span style={{
      display: "inline-block",
      fontSize: fs,
      color: c.text,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 20,
      padding: `${py}px ${px}px`,
      letterSpacing: "0.1em",
      fontFamily: "Georgia, serif",
      textTransform: "uppercase",
    }}>
      {process}
    </span>
  );
}

// ─── Coffee Card ──────────────────────────────────────────────────────────────

function CoffeeCard({ coffee, index, activePopoverDim, onDotClick, onClosePopover, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
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
        boxShadow: hovered ? "0 4px 24px rgba(212,168,67,0.12)" : "none",
        cursor: "pointer",
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
          letterSpacing: "0.04em", lineHeight: 1.2, marginBottom: 5,
        }}>
          {coffee.name}
        </div>
        <ProcessBadge process={coffee.process} />
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
// Each entry: [ tag string, coffee[] ] sorted alphabetically

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
  const stripEmoji = (s) => s.replace(/^\S+\s/, "");
  return Array.from(map.entries()).sort((a, b) => stripEmoji(a[0]).localeCompare(stripEmoji(b[0])));
});

// Process index: process method → coffees[]
const PROCESS_INDEX = (() => {
  const map = new Map();
  coffees.forEach((coffee) => {
    if (!map.has(coffee.process)) map.set(coffee.process, []);
    map.get(coffee.process).push(coffee);
  });
  // Sort by count descending
  return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
})();

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
  const viewW = document.documentElement.clientWidth;
  const rawLeft = anchorRect.left + anchorRect.width / 2 - TOOLTIP_WIDTH / 2;
  const left = Math.max(8, Math.min(rawLeft, viewW - TOOLTIP_WIDTH - 8));

  return (
    <div
      style={{
        position: "fixed",
        top, left,
        width: TOOLTIP_WIDTH,
        boxSizing: "border-box",
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
      {/* Process section */}
      <div style={{
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 8,
        padding: "16px 16px 18px",
        marginBottom: 16,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 14, paddingBottom: 10,
          borderBottom: `1px solid ${COLORS.gridOuter}33`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: COLORS.gridOuter, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, color: COLORS.label,
            letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            Processing Method
          </span>
          <span style={{
            fontSize: 9, color: COLORS.sub, fontStyle: "italic",
            fontFamily: "Georgia, serif", marginLeft: "auto",
            letterSpacing: "0.03em",
          }}>
            how the cherry is prepared after harvest
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PROCESS_INDEX.map(([process, processCoffees]) => {
            const c = PROCESS_COLORS[process] ?? { bg: "#1F1409", border: COLORS.gridOuter, text: COLORS.label };
            return (
              <div key={process}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 10, color: c.text,
                    background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: 20, padding: "1px 9px",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    fontFamily: "Georgia, serif",
                  }}>
                    {process}
                  </span>
                  <span style={{
                    fontSize: 9, color: COLORS.sub, fontStyle: "italic",
                    fontFamily: "Georgia, serif",
                  }}>
                    {processCoffees.length} origin{processCoffees.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {processCoffees.map((coffee) => {
                    const isActive = activeChip?.coffee.name === coffee.name;
                    return (
                      <span
                        key={coffee.name}
                        onMouseEnter={(e) => handleChipEnter(e, coffee)}
                        onMouseLeave={() => setActiveChip(null)}
                        onClick={(e) => handleChipClick(e, coffee)}
                        style={{
                          fontSize: 9.5,
                          color: isActive ? "#F0DEB8" : COLORS.label,
                          background: isActive ? `${c.border}35` : `${c.border}18`,
                          border: `1px solid ${isActive ? c.border : c.border + "55"}`,
                          borderRadius: 12,
                          padding: "2px 9px",
                          fontFamily: "Georgia, serif",
                          letterSpacing: "0.03em",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {coffee.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
  const APPROX_HEIGHT = 160;
  const viewW = document.documentElement.clientWidth;

  // Flip above if not enough space below
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top = spaceBelow > APPROX_HEIGHT + 12
    ? anchorRect.bottom + 8
    : anchorRect.top - APPROX_HEIGHT - 8;

  const rawLeft = anchorRect.left + anchorRect.width / 2 - TOOLTIP_WIDTH / 2;
  const left = Math.max(8, Math.min(rawLeft, viewW - TOOLTIP_WIDTH - 8));

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        width: TOOLTIP_WIDTH,
        boxSizing: "border-box",
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
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        zIndex: 400, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(600px, 100%)",
          maxHeight: "calc(100vh - 40px)",
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
    </div>
  );
}

// ─── Roast Spectrum ──────────────────────────────────────────────────────────

const ROAST_LEVELS = ["Light", "Light–Medium", "Medium", "Medium–Dark", "Dark"];
const ROAST_COLORS = ["#F5D99C", "#D4A843", "#A0623A", "#6B3520", "#2A1008"];

function RoastBar({ roast }) {
  const idx = ROAST_LEVELS.indexOf(roast);
  const pct = idx === -1 ? 50 : (idx / (ROAST_LEVELS.length - 1)) * 100;
  const markerColor = ROAST_COLORS[idx] ?? "#D4A843";

  return (
    <div>
      <div style={{
        fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
        textTransform: "uppercase", marginBottom: 7,
      }}>
        Suggested Roast
      </div>
      {/* Gradient track */}
      <div style={{ position: "relative", height: 6, borderRadius: 6, overflow: "visible" }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: 6,
          background: `linear-gradient(to right, ${ROAST_COLORS.join(", ")})`,
          opacity: 0.55,
        }} />
        {/* Marker */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: `${pct}%`,
          transform: "translate(-50%, -50%)",
          width: 12, height: 12, borderRadius: "50%",
          background: markerColor,
          border: `2px solid ${COLORS.bg}`,
          boxShadow: `0 0 6px ${markerColor}88`,
        }} />
      </div>
      {/* Labels */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: 5,
      }}>
        {ROAST_LEVELS.map((lvl, i) => (
          <span key={lvl} style={{
            fontSize: 8,
            color: lvl === roast ? ROAST_COLORS[i] : COLORS.sub,
            fontFamily: "Georgia, serif",
            fontWeight: lvl === roast ? "bold" : "normal",
            letterSpacing: "0.03em",
            transition: "color 0.2s",
          }}>
            {lvl}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Coffee Detail Modal ──────────────────────────────────────────────────────

function getSimilar(coffee, n = 3) {
  return coffees
    .filter(c => c.name !== coffee.name)
    .map(c => ({
      coffee: c,
      dist: Math.sqrt(c.scores.reduce((sum, s, i) => sum + (s - coffee.scores[i]) ** 2, 0)),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n)
    .map(d => d.coffee);
}

function CoffeeDetailModal({ coffee, onClose, onSelect }) {
  const [showProcessExplainer, setShowProcessExplainer] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const activeHighlights = coffee.highlights
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => h != null);

  return (
    <>
      {/* Backdrop + centering container */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          zIndex: 500,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          background: "#1A1008",
          border: `1px solid ${COLORS.gridOuter}`,
          borderRadius: 10,
          fontFamily: "Georgia, serif",
          animation: "popoverIn 0.18s ease both",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 1,
          background: "#1A1008",
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          padding: "16px 20px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{
              fontSize: 9, letterSpacing: "0.28em", color: COLORS.sub,
              textTransform: "uppercase", marginBottom: 4,
            }}>
              {coffee.region}
            </div>
            <h2 style={{
              margin: "0 0 8px", fontSize: 20, fontWeight: "normal",
              color: "#F0DEB8", letterSpacing: "0.05em",
            }}>
              {coffee.name}
            </h2>
            <ProcessBadge process={coffee.process} size="lg" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none",
                color: COLORS.sub, fontSize: 22,
                cursor: "pointer", padding: "0 0 0 4px",
                fontFamily: "Georgia, serif", lineHeight: 1,
              }}
            >×</button>
          </div>
        </div>

        {/* Body — two columns on desktop, stacked on mobile */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0,
        }}>
          {/* Left column: radar + scores */}
          <div
            className="detail-left"
            style={{
              flex: "0 0 260px",
              padding: "20px 20px 24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            }}
          >
            <RadarChart
              scores={coffee.scores}
              size={200}
              onDotClick={() => {}}
              activeDim={null}
            />

            {/* Score bars */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              {DIMS.map((d, i) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    fontSize: 10, color: DIM_COLORS[i],
                    width: 40, flexShrink: 0, letterSpacing: "0.04em",
                  }}>
                    {d}
                  </div>
                  <div style={{
                    flex: 1, height: 3,
                    background: "#2A1A08", borderRadius: 3, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${coffee.scores[i] * 10}%`,
                      background: DIM_COLORS[i],
                      borderRadius: 3, opacity: 0.85,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                  <div style={{
                    fontSize: 11, color: DIM_COLORS[i],
                    width: 18, textAlign: "right", opacity: 0.8,
                  }}>
                    {coffee.scores[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: tasting note, roast, brew methods, highlights */}
          <div style={{
            flex: "1 1 280px",
            padding: "20px 22px 24px",
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            {/* Tasting note */}
            <div>
              <div style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                textTransform: "uppercase", marginBottom: 7,
              }}>
                Tasting Notes
              </div>
              <p style={{
                margin: 0,
                fontSize: 13, color: COLORS.label, fontStyle: "italic",
                lineHeight: 1.65, letterSpacing: "0.03em",
              }}>
                {coffee.note}
              </p>
            </div>

            {/* Roast bar */}
            <RoastBar roast={coffee.roast} />

            {/* Processing method + explainer */}
            <div>
              <div style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                textTransform: "uppercase", marginBottom: 7,
              }}>
                Processing Method
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <ProcessBadge process={coffee.process} size="lg" />
                {PROCESS_EXPLAINERS[coffee.process] && (
                  <button
                    onClick={() => setShowProcessExplainer(p => !p)}
                    style={{
                      fontSize: 9, fontFamily: "Georgia, serif",
                      background: "none", border: "none",
                      color: COLORS.sub, cursor: "pointer",
                      padding: 0, opacity: 0.7,
                      textDecoration: "underline", letterSpacing: "0.04em",
                    }}
                  >
                    {showProcessExplainer ? "hide" : "what does this mean?"}
                  </button>
                )}
              </div>
              {showProcessExplainer && PROCESS_EXPLAINERS[coffee.process] && (
                <p style={{
                  margin: "10px 0 0", fontSize: 10.5, color: COLORS.sub,
                  fontStyle: "italic", lineHeight: 1.65, letterSpacing: "0.02em",
                  borderLeft: `2px solid ${PROCESS_COLORS[coffee.process]?.border ?? COLORS.cardBorder}`,
                  paddingLeft: 10,
                }}>
                  {PROCESS_EXPLAINERS[coffee.process]}
                </p>
              )}
            </div>

            {/* Brew methods */}
            <div>
              <div style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                textTransform: "uppercase", marginBottom: 7,
              }}>
                Recommended Brews
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {coffee.brewMethods.map((method) => (
                  <span key={method} style={{
                    fontSize: 10,
                    color: COLORS.label,
                    background: `${COLORS.gridOuter}22`,
                    border: `1px solid ${COLORS.gridOuter}55`,
                    borderRadius: 20,
                    padding: "3px 10px",
                    letterSpacing: "0.04em",
                    fontFamily: "Georgia, serif",
                  }}>
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: COLORS.cardBorder }} />

            {/* Similar origins */}
            {(() => {
              const similar = getSimilar(coffee);
              return (
                <div>
                  <div style={{
                    fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                    textTransform: "uppercase", marginBottom: 8,
                  }}>
                    Similar Origins
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {similar.map(c => {
                      const domIdx = c.scores.indexOf(Math.max(...c.scores));
                      return (
                        <button
                          key={c.name}
                          onClick={() => onSelect(c)}
                          style={{
                            fontSize: 10, fontFamily: "Georgia, serif",
                            letterSpacing: "0.04em", padding: "4px 12px",
                            borderRadius: 20, cursor: "pointer",
                            border: `1px solid ${DIM_COLORS[domIdx]}55`,
                            background: `${DIM_COLORS[domIdx]}18`,
                            color: COLORS.label, transition: "all 0.15s",
                          }}
                        >
                          {c.name}
                          <span style={{ fontSize: 8.5, color: COLORS.sub, marginLeft: 5 }}>
                            {c.note.split(" · ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Separator */}
            <div style={{ height: 1, background: COLORS.cardBorder }} />

            {/* Per-dimension highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}>
                Flavor Breakdown
              </div>
              {activeHighlights.map(({ h, i }) => (
                <div key={i}>
                  {/* Dim header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7, marginBottom: 6,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: DIM_COLORS[i], flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 9.5, color: DIM_COLORS[i],
                      letterSpacing: "0.16em", textTransform: "uppercase",
                    }}>
                      {DIMS[i]}
                    </span>
                    <span style={{
                      fontSize: 8.5, color: COLORS.sub,
                      fontStyle: "italic", letterSpacing: "0.03em",
                    }}>
                      — {DIM_DESCS[i]}
                    </span>
                  </div>
                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                    {h.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 9,
                        color: DIM_COLORS[i],
                        background: `${DIM_COLORS[i]}28`,
                        border: `1px solid ${DIM_COLORS[i]}50`,
                        borderRadius: 20,
                        padding: "2px 8px",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Note */}
                  <p style={{
                    margin: 0, fontSize: 10.5, color: COLORS.sub,
                    fontStyle: "italic", lineHeight: 1.6, letterSpacing: "0.02em",
                    paddingLeft: 13,
                  }}>
                    {h.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// ─── Similarity Math ─────────────────────────────────────────────────────────

function computePCA2D(vectors) {
  const n = vectors.length, d = vectors[0].length;
  const means = Array.from({length: d}, (_, j) => vectors.reduce((s, r) => s + r[j], 0) / n);
  const X = vectors.map(r => r.map((v, j) => v - means[j]));
  const C = Array.from({length: d}, (_, i) =>
    Array.from({length: d}, (__, j) => X.reduce((s, r) => s + r[i]*r[j], 0) / (n - 1))
  );
  function powerIter(M, seed) {
    let v = seed.slice();
    const norm = w => Math.sqrt(w.reduce((s, x) => s + x*x, 0)) || 1;
    v = v.map(x => x / norm(v));
    for (let k = 0; k < 300; k++) {
      const mv = M.map(row => row.reduce((s, x, j) => s + x * v[j], 0));
      v = mv.map(x => x / (norm(mv)));
    }
    return v;
  }
  const pc1 = powerIter(C, [1, 0, 0, 0, 0, 0]);
  const ev1 = C.reduce((s, row, i) => s + pc1[i] * row.reduce((ss, c, j) => ss + c * pc1[j], 0), 0);
  const C2 = C.map((row, i) => row.map((val, j) => val - ev1 * pc1[i] * pc1[j]));
  const pc2 = powerIter(C2, [0, 1, 0, 0, 0, 0]);
  const projected = X.map(r => [
    r.reduce((s, v, i) => s + v * pc1[i], 0),
    r.reduce((s, v, i) => s + v * pc2[i], 0),
  ]);
  return { projected, pc1, pc2 };
}

const { projected: PCA_COORDS, pc1: PC1_LOAD, pc2: PC2_LOAD } = computePCA2D(coffees.map(c => c.scores));

function pcAxisLabel(loadings) {
  return loadings
    .map((v, i) => ({ i, abs: Math.abs(v), sign: v >= 0 }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 2)
    .map(({ i, sign }) => `${sign ? "+" : "−"}${DIMS[i]}`)
    .join(" / ");
}

// ─── Discover View ────────────────────────────────────────────────────────────

function DiscoverView({ onSelectCoffee }) {
  const [selected, setSelected] = useState(new Set());

  function toggle(tag) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  const scored = coffees
    .map(coffee => {
      let hits = 0;
      const matches = [];
      coffee.highlights.forEach(h => {
        if (!h) return;
        h.tags.forEach(tag => { if (selected.has(tag)) { hits++; matches.push(tag); } });
      });
      return { coffee, score: selected.size ? hits / selected.size : 0, matches };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: COLORS.sub, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Find Your Perfect Cup
        </div>
        <p style={{ fontSize: 12, color: COLORS.sub, fontStyle: "italic", margin: 0, fontFamily: "Georgia, serif", letterSpacing: "0.03em" }}>
          Select flavor tags you enjoy — we'll rank your best matches
        </p>
      </div>

      {/* Active tags */}
      {selected.size > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18, alignItems: "center", justifyContent: "center" }}>
          {[...selected].map(tag => (
            <span key={tag} onClick={() => toggle(tag)} style={{
              fontSize: 10, color: "#F0DEB8",
              background: `${COLORS.gridOuter}35`,
              border: `1px solid ${COLORS.gridOuter}`,
              borderRadius: 20, padding: "3px 10px",
              cursor: "pointer", fontFamily: "Georgia, serif",
              letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              {tag} <span style={{ opacity: 0.55, fontSize: 12, lineHeight: 1 }}>×</span>
            </span>
          ))}
          <button onClick={() => setSelected(new Set())} style={{
            background: "none", border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 20, padding: "3px 12px",
            color: COLORS.sub, fontSize: 9, cursor: "pointer",
            fontFamily: "Georgia, serif", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>
            Clear all
          </button>
        </div>
      )}

      {/* Tag picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {DIMS.map((dim, i) => (
          <div key={dim} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 8, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: DIM_COLORS[i], flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: DIM_COLORS[i], letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {dim}
              </span>
              <span style={{ fontSize: 8.5, color: COLORS.sub, fontStyle: "italic", fontFamily: "Georgia, serif", letterSpacing: "0.03em" }}>
                — {DIM_DESCS[i]}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {TAG_INDEX[i].map(([tag]) => {
                const isActive = selected.has(tag);
                return (
                  <span key={tag} onClick={() => toggle(tag)} style={{
                    fontSize: 9.5,
                    color: isActive ? DIM_COLORS[i] : COLORS.sub,
                    background: isActive ? `${DIM_COLORS[i]}28` : "transparent",
                    border: `1px solid ${isActive ? DIM_COLORS[i] : COLORS.cardBorder}`,
                    borderRadius: 20, padding: "3px 9px",
                    cursor: "pointer", fontFamily: "Georgia, serif",
                    letterSpacing: "0.03em", transition: "all 0.15s", userSelect: "none",
                  }}>
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {selected.size > 0 ? (
        <div>
          <div style={{
            fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
            textTransform: "uppercase", marginBottom: 14, textAlign: "center",
          }}>
            {scored.length > 0 ? `${scored.length} match${scored.length !== 1 ? "es" : ""} found` : "No matches — try different tags"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scored.map(({ coffee, score, matches }, rank) => (
              <div
                key={coffee.name}
                onClick={() => onSelectCoffee(coffee)}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${rank === 0 ? COLORS.gridOuter : COLORS.cardBorder}`,
                  borderRadius: 8, padding: "12px 16px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.gridOuter}
                onMouseLeave={e => e.currentTarget.style.borderColor = rank === 0 ? COLORS.gridOuter : COLORS.cardBorder}
              >
                <div style={{
                  fontSize: 18, color: rank === 0 ? "#F0DEB8" : COLORS.sub,
                  fontFamily: "Georgia, serif", width: 22, textAlign: "center", flexShrink: 0,
                }}>
                  {rank + 1}
                </div>
                <div style={{ flexShrink: 0 }}>
                  <RadarChart scores={coffee.scores} size={72} onDotClick={() => {}} activeDim={null} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, color: "#F0DEB8", fontFamily: "Georgia, serif" }}>{coffee.name}</span>
                    <span style={{ fontSize: 9, color: COLORS.sub, letterSpacing: "0.15em", textTransform: "uppercase" }}>{coffee.region}</span>
                    <ProcessBadge process={coffee.process} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1, height: 3, background: "#2A1A08", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${score * 100}%`,
                        background: rank === 0 ? COLORS.gridOuter : `${COLORS.gridOuter}88`,
                        borderRadius: 2, transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 9, color: COLORS.sub, width: 30, textAlign: "right", flexShrink: 0 }}>
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {matches.map(tag => (
                      <span key={tag} style={{
                        fontSize: 8.5, color: COLORS.label,
                        background: `${COLORS.gridOuter}22`, border: `1px solid ${COLORS.gridOuter}44`,
                        borderRadius: 12, padding: "1px 7px", fontFamily: "Georgia, serif",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: "center", padding: "32px 20px",
          color: COLORS.sub, fontStyle: "italic",
          fontFamily: "Georgia, serif", fontSize: 12,
          border: `1px dashed ${COLORS.cardBorder}`, borderRadius: 8,
        }}>
          Select one or more flavor tags above to find your ideal coffee origin
        </div>
      )}
    </div>
  );
}

// ─── Flavor Map (PCA Scatter) ─────────────────────────────────────────────────

function PCAScatter() {
  const [showExplainer, setShowExplainer] = useState(false);
  const W = 780, H = 500, PAD = 44;

  const xs = PCA_COORDS.map(p => p[0]);
  const ys = PCA_COORDS.map(p => p[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const pts = PCA_COORDS.map(([x, y]) => ({
    cx: PAD + ((x - xMin) / xRange) * (W - 2 * PAD),
    cy: H - PAD - ((y - yMin) / yRange) * (H - 2 * PAD),
  }));

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: COLORS.sub, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Flavor Map
          </div>
          <button
            onClick={() => setShowExplainer(v => !v)}
            title="How to read this chart"
            style={{
              background: "none", border: `1px solid ${showExplainer ? COLORS.gridOuter : COLORS.cardBorder}`,
              borderRadius: "50%", width: 16, height: 16,
              color: showExplainer ? COLORS.label : COLORS.sub,
              fontSize: 9, cursor: "pointer", fontFamily: "Georgia, serif",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "border-color 0.2s, color 0.2s", padding: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.gridOuter; e.currentTarget.style.color = COLORS.label; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = showExplainer ? COLORS.gridOuter : COLORS.cardBorder; e.currentTarget.style.color = showExplainer ? COLORS.label : COLORS.sub; }}
          >?</button>
        </div>
        <p style={{ fontSize: 10, color: COLORS.sub, fontStyle: "italic", fontFamily: "Georgia, serif", margin: 0 }}>
          Coffees plotted by flavor similarity — the closer together, the more alike they taste
        </p>

        {showExplainer && (
          <div style={{
            maxWidth: 560, margin: "14px auto 0",
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 8, padding: "14px 18px", textAlign: "left",
            animation: "popoverIn 0.15s ease both",
          }}>
            <div style={{ fontSize: 10, color: COLORS.label, lineHeight: 1.8, fontFamily: "Georgia, serif", letterSpacing: "0.02em" }}>
              <p style={{ margin: "0 0 10px" }}>
                Every coffee in this dataset has six flavor scores — Fruity, Floral, Sweet, Nutty, Spicy, and Earthy.
                Comparing all six dimensions at once is hard to visualize, so this chart compresses them down to two
                directions that capture the most meaningful differences between the coffees.
              </p>
              <p style={{ margin: "0 0 10px" }}>
                Think of it as a <em style={{ color: "#F0DEB8" }}>flavor map</em>: coffees that land close together
                have similar overall profiles, while coffees far apart taste quite different. The exact position on
                any axis isn't the point — the <em style={{ color: "#F0DEB8" }}>distances between coffees</em> are
                what matter.
              </p>
              <p style={{ margin: 0 }}>
                Dot colors show each coffee's <em style={{ color: "#F0DEB8" }}>strongest flavor dimension</em> —
                the one it scores highest on. These are the same colors used for Fruity, Floral, Sweet, Nutty,
                Spicy, and Earthy throughout the rest of the site, so clusters of the same color indicate
                coffees that share a dominant flavor character.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart — viewBox scales down on narrow screens */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", height: "auto", fontFamily: "Georgia, serif" }}
      >
        {/* Grid */}
        <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke={COLORS.grid} strokeWidth={0.5} strokeDasharray="3 3" />
        <line x1={W/2} y1={PAD} x2={W/2} y2={H-PAD} stroke={COLORS.grid} strokeWidth={0.5} strokeDasharray="3 3" />
        <text x={W-PAD+6} y={H/2+4}  fill={COLORS.sub} fontSize={8} textAnchor="start">{pcAxisLabel(PC1_LOAD)}</text>
        <text x={W/2}     y={PAD-10} fill={COLORS.sub} fontSize={8} textAnchor="middle">{pcAxisLabel(PC2_LOAD)}</text>

        {/* Points — colored by dominant flavor dimension */}
        {pts.map((pt, i) => {
          const coffee = coffees[i];
          const domIdx = coffee.scores.indexOf(Math.max(...coffee.scores));
          const fill   = DIM_COLORS[domIdx];
          return (
            <g key={i}>
              <circle
                cx={pt.cx} cy={pt.cy} r={5.5}
                fill={fill} fillOpacity={0.7}
                stroke={fill} strokeWidth={0.8} strokeOpacity={0.5}
              />
              <text
                x={pt.cx + 8} y={pt.cy + 4}
                fill={COLORS.sub} fontSize={8}
                pointerEvents="none"
              >
                {coffee.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Dimension legend */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
        {DIMS.map((dim, i) => (
          <div key={dim} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: DIM_COLORS[i], opacity: 0.85 }} />
            <span style={{ fontSize: 8.5, color: COLORS.sub, fontFamily: "Georgia, serif" }}>{dim}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Compare View ─────────────────────────────────────────────────────────────

function CompareRadar({ scoresA, scoresB, colorA, colorB, size = 220 }) {
  const cx = size / 2, cy = size / 2, R = size * 0.35, LEVELS = 4;
  function toXY(angle, r) {
    return { x: cx + r * Math.cos(angle - Math.PI / 2), y: cy + r * Math.sin(angle - Math.PI / 2) };
  }
  function polyPts(scores) {
    return scores.map((s, i) => {
      const { x, y } = toXY((2 * Math.PI * i) / NUM, (s / 10) * R);
      return `${x},${y}`;
    }).join(" ");
  }
  const levelGrids = Array.from({ length: LEVELS }, (_, li) =>
    Array.from({ length: NUM }, (__, i) => {
      const { x, y } = toXY((2 * Math.PI * i) / NUM, ((li + 1) / LEVELS) * R);
      return `${x},${y}`;
    }).join(" ")
  );
  const dimLabelPos = DIMS.map((_, i) => toXY((2 * Math.PI * i) / NUM, R + 14));
  const dimTickPos  = DIMS.map((_, i) => toXY((2 * Math.PI * i) / NUM, R));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible", width: "min(220px, 80vw)", height: "auto" }}>
      <defs>
        <filter id="cmp-glow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {levelGrids.map((pts, li) => (
        <polygon key={li} points={pts} fill="none"
          stroke={li === LEVELS - 1 ? COLORS.gridOuter : COLORS.grid}
          strokeWidth={li === LEVELS - 1 ? 0.8 : 0.5} strokeOpacity={li === LEVELS - 1 ? 0.8 : 0.45} />
      ))}
      {dimTickPos.map(({ x, y }, i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y}
          stroke={DIM_COLORS[i]} strokeWidth={0.6} strokeOpacity={0.35} />
      ))}
      {/* Coffee A — filled */}
      <polygon points={polyPts(scoresA)} fill={colorA + "30"} stroke={colorA} strokeWidth={1.5} filter="url(#cmp-glow)" />
      {/* Coffee B — outlined */}
      <polygon points={polyPts(scoresB)} fill={colorB + "18"} stroke={colorB} strokeWidth={1.5} strokeDasharray="4 2" />
      {DIMS.map((d, i) => (
        <text key={i} x={dimLabelPos[i].x} y={dimLabelPos[i].y + 3}
          textAnchor="middle" fontSize={8} fill={DIM_COLORS[i]} opacity={0.8}
          fontFamily="Georgia, serif">
          {d}
        </text>
      ))}
    </svg>
  );
}

const COMPARE_COLORS = ["#D4A843", "#A98BC7"];

const sortedCoffeeNames = coffees.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name);

function CompareView() {
  const [nameA, setNameA] = useState(sortedCoffeeNames[0]);
  const [nameB, setNameB] = useState(sortedCoffeeNames[1]);
  const a = coffees.find(c => c.name === nameA);
  const b = coffees.find(c => c.name === nameB);

  const selectStyle = {
    background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 6, color: COLORS.label, fontSize: 13,
    fontFamily: "Georgia, serif", padding: "4px 8px", cursor: "pointer",
    flex: "1 1 160px", maxWidth: 260, height: 32, boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Dropdowns */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
        {[[nameA, setNameA, COMPARE_COLORS[0]], [nameB, setNameB, COMPARE_COLORS[1]]].map(([val, setter, color], idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 9, color: COLORS.sub, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Origin {idx + 1}
              </span>
            </div>
            <select value={val} onChange={e => setter(e.target.value)} style={selectStyle}>
              {sortedCoffeeNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Radar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <CompareRadar scoresA={a.scores} scoresB={b.scores} colorA={COMPARE_COLORS[0]} colorB={COMPARE_COLORS[1]} size={240} />
        <div style={{ display: "flex", gap: 28, marginTop: 12 }}>
          {[a, b].map((c, idx) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width={22} height={10}>
                <line x1={0} y1={5} x2={22} y2={5} stroke={COMPARE_COLORS[idx]} strokeWidth={2}
                  strokeDasharray={idx === 1 ? "4 2" : "none"} />
              </svg>
              <span style={{ fontSize: 10, color: COLORS.label, fontFamily: "Georgia, serif" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score bars */}
      <div style={{
        background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 8, padding: "18px 24px", marginBottom: 16,
      }}>
        <div style={{ fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
          Flavor Scores
        </div>
        {DIMS.map((dim, i) => (
          <div key={dim} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: DIM_COLORS[i], letterSpacing: "0.08em", marginBottom: 4 }}>{dim}</div>
            {[a, b].map((c, idx) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div className="compare-score-label" style={{ width: 100, fontSize: 8.5, color: COMPARE_COLORS[idx], fontFamily: "Georgia, serif", textAlign: "right", flexShrink: 0 }}>
                  {c.name.split(" ")[0]}
                </div>
                <div style={{ flex: 1, height: 5, background: "#2A1A08", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.scores[i] * 10}%`, background: COMPARE_COLORS[idx], borderRadius: 3, opacity: 0.85 }} />
                </div>
                <div style={{ fontSize: 9, color: COMPARE_COLORS[idx], width: 16, textAlign: "right" }}>{c.scores[i]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Info panels */}
      <div className="compare-info-grid" style={{ gap: 16 }}>
        {[a, b].map((c, idx) => (
          <div key={c.name} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 8, padding: "16px 20px",
            borderTop: `2px solid ${COMPARE_COLORS[idx]}`,
          }}>
            <div style={{ fontSize: 9, color: COMPARE_COLORS[idx], letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
              {c.region}
            </div>
            <div style={{ fontSize: 16, color: "#F0DEB8", fontFamily: "Georgia, serif", marginBottom: 8 }}>{c.name}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              <ProcessBadge process={c.process} size="sm" />
              <span style={{ fontSize: 9, color: COLORS.sub, alignSelf: "center" }}>{c.roast} roast</span>
            </div>
            <p style={{ margin: 0, fontSize: 10.5, color: COLORS.sub, fontStyle: "italic", lineHeight: 1.65 }}>{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function CoffeeInfographic() {
  const [sortDim, setSortDim] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [view, setView] = useState("cards");
  const [showMethodology, setShowMethodology] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [brewFilter, setBrewFilter] = useState(new Set());
  const [roastFilter, setRoastFilter] = useState(new Set());
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

  const filteredCoffees = sortedCoffees.filter(c =>
    (brewFilter.size === 0 || c.brewMethods.some(m => brewFilter.has(m))) &&
    (roastFilter.size === 0 || roastFilter.has(c.roast))
  );

  function toggleBrew(method) {
    setBrewFilter(prev => { const n = new Set(prev); n.has(method) ? n.delete(method) : n.add(method); return n; });
  }
  function toggleRoast(level) {
    setRoastFilter(prev => { const n = new Set(prev); n.has(level) ? n.delete(level) : n.add(level); return n; });
  }
  function clearAllFilters() {
    setBrewFilter(new Set());
    setRoastFilter(new Set());
  }
  const anyFilterActive = brewFilter.size > 0 || roastFilter.size > 0;

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
        .detail-left {
          flex: 0 0 260px;
          min-width: 220px;
          border-right: 1px solid ${COLORS.cardBorder};
        }
        @media (max-width: 560px) {
          .detail-left {
            flex: 1 1 100%;
            border-right: none;
            border-bottom: 1px solid ${COLORS.cardBorder};
          }
        }
        .compare-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 560px) {
          .compare-info-grid {
            grid-template-columns: 1fr;
          }
          .compare-info-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid ${COLORS.cardBorder};
          }
          .compare-score-label {
            width: 70px !important;
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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          {[
            { key: "cards",    label: "Origins" },
            { key: "heatmap",  label: "Heatmap" },
            { key: "tags",     label: "Tags" },
            { key: "discover", label: "Discover" },
            { key: "map",      label: "Flavor Map" },
            { key: "compare",  label: "Compare" },
          ].map(({ key, label }, idx, arr) => (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                background: "none",
                border: `1px solid ${view === key ? COLORS.gridOuter : COLORS.cardBorder}`,
                borderRadius: idx === 0 ? "4px 0 0 4px" : idx === arr.length - 1 ? "0 4px 4px 0" : "0",
                padding: "5px 18px",
                color: view === key ? "#F0DEB8" : COLORS.sub,
                fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "Georgia, serif",
                transition: "all 0.2s", marginLeft: idx === 0 ? 0 : -1,
                position: "relative", zIndex: view === key ? 1 : 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Brew method + roast level filters */}
        {view === "cards" && (
          <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                label: "Brew Method",
                items: ["Pour Over","Chemex","AeroPress","French Press","Drip","Espresso","Cold Brew","Moka Pot","Ibrik / Turkish","Phin Filter"],
                filter: brewFilter,
                toggle: toggleBrew,
              },
              {
                label: "Roast Level",
                items: ["Light","Light–Medium","Medium","Medium–Dark","Dark"],
                filter: roastFilter,
                toggle: toggleRoast,
              },
            ].map(({ label, items, filter, toggle }) => (
              <div key={label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 9, color: COLORS.sub, letterSpacing: "0.14em",
                  textTransform: "uppercase", fontFamily: "Georgia, serif",
                  flexShrink: 0, minWidth: 76,
                }}>
                  {label}
                </span>
                {items.map(item => {
                  const active = filter.has(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggle(item)}
                      style={{
                        fontSize: 9, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
                        padding: "3px 10px", borderRadius: 12,
                        border: `1px solid ${active ? COLORS.gridOuter : COLORS.cardBorder}`,
                        background: active ? `${COLORS.gridOuter}22` : "transparent",
                        color: active ? "#F0DEB8" : COLORS.sub,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            ))}
            {anyFilterActive && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
                <span style={{
                  fontSize: 9, color: COLORS.sub, fontFamily: "Georgia, serif", fontStyle: "italic",
                }}>
                  {filteredCoffees.length} of {coffees.length} origins
                </span>
                <button
                  onClick={clearAllFilters}
                  style={{
                    fontSize: 9, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
                    padding: "2px 10px", borderRadius: 12,
                    border: `1px solid ${COLORS.cardBorder}`,
                    background: "transparent", color: COLORS.sub,
                    cursor: "pointer", opacity: 0.6,
                  }}
                >
                  clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cards grid */}
        {view === "cards" && (
          <div className="coffee-grid">
            {filteredCoffees.map((coffee, i) => (
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
                onSelect={() => setSelectedCoffee(coffee)}
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

        {/* Discover */}
        {view === "discover" && <DiscoverView onSelectCoffee={setSelectedCoffee} />}

        {/* Flavor Map */}
        {view === "map" && <PCAScatter />}

        {/* Compare */}
        {view === "compare" && <CompareView />}

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
            <a href="https://github.com/neilkod/tastingterrain.com" target="_blank" rel="noreferrer" style={{
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

      {selectedCoffee && (
        <CoffeeDetailModal
          coffee={selectedCoffee}
          onClose={() => setSelectedCoffee(null)}
          onSelect={(c) => setSelectedCoffee(c)}
        />
      )}
    </>
  );
}
