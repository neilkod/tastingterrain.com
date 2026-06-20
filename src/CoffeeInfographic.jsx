import { useState, useEffect, useCallback, useRef, memo } from "react";
import { coffees } from "./coffeeData";

// ─── useMediaQuery ───────────────────────────────────────────────────────────
// Single source of truth for the mobile breakpoint. Subscribes to matchMedia
// change events so rotation / resize re-render correctly (replaces the four
// render-time window.innerWidth reads).
function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

const MOBILE_QUERY = "(max-width: 639px)";

// ─── useBodyScrollLock ───────────────────────────────────────────────────────
// Locks background scroll while a sheet/modal is mounted. Ref-counted so nested
// overlays don't unlock prematurely.
let scrollLockCount = 0;
let savedOverflow = "";
function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    if (scrollLockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;
    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        document.body.style.overflow = savedOverflow;
      }
    };
  }, [active]);
}

// ─── usePrefersReducedMotion ─────────────────────────────────────────────────
// Subscribes to the OS "reduce motion" setting via matchMedia. Used to snap the
// compare-radar morph instantly instead of running the rAF lerp.
function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

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
  grid: "#3A2A14",       // decorative grid lines only (never text)
  gridOuter: "#8B6F4E",  // decorative borders / outer ring (never text)
  label: "#C4A882",
  // Workhorse muted tone bumped from #8B6F4E (~4.0:1) to ~#A08560 so body text
  // clears WCAG AA 4.5:1 on the #1A1008 base while staying in the brown/gold family.
  sub: "#A08560",
  // Legible muted tone for the scoring disclaimer (was #3A2A14 ≈ 1.35:1, invisible).
  faint: "#7A6244",
  bg: "#1A1008",
  cardBg: "#1F1409",
  cardBorder: "#2A1A08",
};

// ─── Type scale ──────────────────────────────────────────────────────────────
// Expressed in rem so OS/browser font-size settings are respected. Body floored
// at ~11px (0.6875rem). Hierarchy comes from spacing/tracking, not tiny text.
const TYPE = {
  micro: "0.6875rem", // ~11px — smallest allowed (labels, captions)
  small: "0.8125rem", // ~13px
  base:  "0.9375rem", // ~15px
  lg:    "1.125rem",  // ~18px
  xl:    "1.5rem",    // ~24px
  hero:  "clamp(1.875rem, 5vw, 3rem)",
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
            {/* Invisible thumb-sized hit target (r=14) — keeps the
                dot→flavor-note popover reachable by finger. */}
            <circle cx={x} cy={y} r={14} fill="transparent" />
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

// ─── Bottom Sheet (the mobile interaction primitive) ─────────────────────────
// One surface, reused by the radar-dot popover, the chip tooltip, and the
// heatmap cell tap. Hardened for touch: body scroll-lock, safe-area inset for
// the home indicator, overscroll containment so the sheet doesn't scroll the
// page behind it.
function BottomSheet({ onClose, accent = `${COLORS.gridOuter}`, children }) {
  useBodyScrollLock(true);
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          zIndex: 999,
          background: "rgba(0,0,0,0.55)",
        }}
      />
      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 1000,
          maxHeight: "85vh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          background: "#1F1409",
          borderTop: `1px solid ${accent}`,
          borderRadius: "12px 12px 0 0",
          padding: "16px 20px calc(36px + env(safe-area-inset-bottom))",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
          fontFamily: "Georgia, serif",
          animation: "slideUp 0.2s ease both",
        }}
      >
        {children}
      </div>
    </>
  );
}

// ─── Popover ─────────────────────────────────────────────────────────────────

function Popover({ coffee, dimIndex, onClose }) {
  const dim = DIMS[dimIndex];
  const color = DIM_COLORS[dimIndex];
  const highlight = coffee.highlights[dimIndex];
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (isMobile) {
    return <BottomSheet onClose={onClose} accent={`${color}99`}>
      <PopoverContent dim={dim} color={color} highlight={highlight} onClose={onClose} />
    </BottomSheet>;
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
          fontSize: TYPE.micro,
          color,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          {dim}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "none", border: "none",
            color: COLORS.sub, fontSize: 22,
            cursor: "pointer", lineHeight: 1, fontFamily: "Georgia, serif",
            width: 36, height: 36, marginRight: -8,
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation",
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
                  fontSize: TYPE.micro,
                  color,
                  background: `${color}30`,
                  border: `1px solid ${color}55`,
                  borderRadius: 20,
                  padding: "3px 9px",
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
            fontSize: TYPE.small,
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
          fontSize: TYPE.small,
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
  "Pulped Natural": "A Brazilian hybrid between washed and natural. The skin is removed (pulped) but the bean is dried with most of its mucilage still attached — no fermentation tank, no full-cherry drying. The result sits between the two parent methods: more body and sweetness than a washed coffee, but cleaner and less wild than a full natural. The backbone of much of Brazil's specialty crop.",
};

const PROCESS_COLORS = {
  "Washed":     { bg: "#1A2E3A", border: "#2A6A8A", text: "#7ABBD0" },
  "Natural":    { bg: "#2E1A0E", border: "#8A4A2A", text: "#D09070" },
  "Honey":      { bg: "#2E2A0A", border: "#8A7A20", text: "#D0C060" },
  "Wet-Hulled": { bg: "#1A2A1A", border: "#3A6A3A", text: "#7AB87A" },
  "Monsooned":  { bg: "#2A1A2E", border: "#6A3A8A", text: "#B07AD0" },
  "Pulped Natural": { bg: "#2A220E", border: "#8A6A2A", text: "#D0A860" },
};

// Botanical species palette — subtle, in the brown/gold family so the badge
// reads as secondary to the (more colorful) process badge beside it.
const SPECIES_COLORS = {
  "Arabica":  { bg: "#1F1409", border: "#5A4422", text: "#C4A882" },
  "Robusta":  { bg: "#241808", border: "#6A4A20", text: "#CFA362" },
  "Liberica": { bg: "#221016", border: "#6A3A4A", text: "#CF8AA0" },
};

const REGION_COLORS = {
  "East Africa":          "#E8A836",
  "Central Africa":       "#D45A3A",
  "South Atlantic Island":"#7EB8D0",
  "South America":        "#5EC45F",
  "Central America":      "#3BBFAD",
  "North America":        "#A8C43A",
  "Middle East":          "#C8A860",
  "South Asia":           "#D468A0",
  "Southeast Asia":       "#B07ED0",
  "Indonesia":            "#E06B2E",
  "Pacific":              "#6FC8E8",
  "Caribbean":            "#4A9BD4",
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

// ─── Species Badge (4.4) ─────────────────────────────────────────────────────
// Styled like ProcessBadge but quieter — most origins are Arabica, so the badge
// earns its keep mainly by flagging the Robusta (Vietnamese) and Liberica
// (Filipino Barako) exceptions.
function SpeciesBadge({ species, size = "sm" }) {
  const c = SPECIES_COLORS[species] ?? { bg: "#1F1409", border: COLORS.gridOuter, text: COLORS.label };
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
      {species}
    </span>
  );
}

// ─── Coffee Card ──────────────────────────────────────────────────────────────

const CoffeeCard = memo(function CoffeeCard({ coffee, index, activePopoverDim, onDotClick, onClosePopover, onSelect, compareMode, selectIndex, onToggleSelect }) {
  const [hovered, setHovered] = useState(false);
  // Entry animation runs only on first mount. The class self-removes on
  // animationend so re-renders (filtering, popover toggles) never replay it.
  const [entering, setEntering] = useState(true);

  const selected = selectIndex != null;
  const seriesColor = selected ? SERIES_COLORS[selectIndex] : null;

  // In compare mode a tap selects/deselects this origin (series border + badge)
  // instead of opening the detail modal — selection happens where browsing does.
  const handleClick = () => {
    if (compareMode) onToggleSelect(coffee);
    else onSelect(coffee);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      className={entering ? "coffee-card card-enter" : "coffee-card"}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget) setEntering(false); }}
      style={{
        position: "relative",
        background: hovered ? "#231508" : COLORS.cardBg,
        border: `1px solid ${selected ? seriesColor : (hovered ? "#5A3A18" : COLORS.cardBorder)}`,
        boxShadow: selected
          ? `0 0 0 1px ${seriesColor}, 0 4px 24px ${seriesColor}33`
          : (hovered ? "0 4px 24px rgba(212,168,67,0.12)" : "none"),
        borderRadius: 6,
        padding: "18px 14px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transition: "all 0.3s ease",
        cursor: "pointer",
        // Cap the stagger at ~8 items so the grid settles in <0.5s.
        animationDelay: `${Math.min(index, 8) * 0.05}s`,
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 22, height: 22, borderRadius: "50%",
          background: seriesColor, color: "#1A1008",
          fontSize: 12, fontFamily: "Georgia, serif", fontWeight: "bold",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}>
          {selectIndex + 1}
        </div>
      )}
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <ProcessBadge process={coffee.processes.primary} />
          <SpeciesBadge species={coffee.species} />
        </div>
      </div>

      <RadarChart
        scores={coffee.scores}
        size={112}
        onDotClick={(dimIndex) => onDotClick(coffee.name, dimIndex)}
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
                width: "100%",
                transform: `scaleX(${coffee.scores[i] / 10})`,
                transformOrigin: "left",
                background: DIM_COLORS[i],
                borderRadius: 2, opacity: 0.85,
                transition: "transform 0.8s ease",
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
});

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
  return Array.from(map.entries())
    .sort((a, b) => stripEmoji(a[0]).localeCompare(stripEmoji(b[0])))
    .map(([tag, cs]) => [tag, cs.slice().sort((a, b) => a.name.localeCompare(b.name))]);
});

// Every distinct processing method that appears as a primary on any origin,
// in descending order of how many origins use it as primary. Drives the
// process filter row and the Tags-view process section.
const ALL_PROCESSES = (() => {
  const counts = new Map();
  coffees.forEach((c) => {
    counts.set(c.processes.primary, (counts.get(c.processes.primary) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([p]) => p);
})();

// True when an origin offers `process` either as its primary method or among
// the other methods it ships in real volume (`also`).
function originHasProcess(coffee, process) {
  return coffee.processes.primary === process || coffee.processes.also.includes(process);
}

// Process index: process method → coffees[] (matches primary OR also)
const PROCESS_INDEX = (() => {
  const map = new Map();
  coffees.forEach((coffee) => {
    [coffee.processes.primary, ...coffee.processes.also].forEach((process) => {
      if (!map.has(process)) map.set(process, []);
      // Guard against an origin listing the same method twice.
      if (!map.get(process).some((c) => c.name === coffee.name)) {
        map.get(process).push(coffee);
      }
    });
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([process, cs]) => [process, cs.slice().sort((a, b) => a.name.localeCompare(b.name))]);
})();

// ─── Chip Radar Tooltip ───────────────────────────────────────────────────────

function ChipTooltip({ coffee, anchorRect, onClose }) {
  const TOOLTIP_WIDTH = 190;
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (isMobile) {
    return (
      <BottomSheet onClose={onClose} accent={COLORS.gridOuter}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              alignSelf: "flex-end", background: "none", border: "none",
              color: COLORS.sub, fontSize: 22, cursor: "pointer",
              fontFamily: "Georgia, serif", lineHeight: 1,
              width: 36, height: 36, marginRight: -8, marginBottom: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "manipulation",
            }}
          >×</button>
          <ChipTooltipContent coffee={coffee} />
        </div>
      </BottomSheet>
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
  const isMobile = useMediaQuery(MOBILE_QUERY);

  useEffect(() => {
    if (!activeChip) return;
    function onDocClick() { setActiveChip(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [activeChip]);

  function handleChipEnter(e, coffee) {
    if (!isMobile) {
      setActiveChip({ coffee, anchorRect: e.currentTarget.getBoundingClientRect() });
    }
  }

  function handleChipClick(e, coffee) {
    e.stopPropagation();
    if (isMobile) {
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

// Shared body for both the desktop hover tooltip and the mobile tap sheet.
function HeatmapHighlightContent({ coffee, dimIndex }) {
  const color = DIM_COLORS[dimIndex];
  const highlight = coffee.highlights[dimIndex];
  return (
    <>
      {/* Header */}
      <div style={{
        fontSize: TYPE.micro, color, letterSpacing: "0.2em",
        textTransform: "uppercase", marginBottom: 8,
      }}>
        {coffee.name} · {DIMS[dimIndex]}
      </div>

      {highlight ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 7 }}>
            {highlight.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: TYPE.micro, color,
                background: `${color}30`,
                border: `1px solid ${color}55`,
                borderRadius: 20,
                padding: "3px 9px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}>
                {tag}
              </span>
            ))}
          </div>
          <p style={{
            margin: 0, fontSize: TYPE.small, color: COLORS.label,
            fontStyle: "italic", lineHeight: 1.6, letterSpacing: "0.02em",
          }}>
            {highlight.note}
          </p>
        </>
      ) : (
        <p style={{
          margin: 0, fontSize: TYPE.small, color: COLORS.sub,
          fontStyle: "italic", lineHeight: 1.55,
        }}>
          Not a prominent characteristic for this origin.
        </p>
      )}
    </>
  );
}

function HeatmapTooltip({ coffee, dimIndex, anchorRect }) {
  const color = DIM_COLORS[dimIndex];
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
      <HeatmapHighlightContent coffee={coffee} dimIndex={dimIndex} />
    </div>
  );
}

// One score cell owns its own hover state so hovering it doesn't re-render the
// whole 224-cell grid. It reports the tooltip up via the stable onShow/onHide
// callbacks (which never change identity), so HeatmapRow stays memoized.
const HeatmapCell = memo(function HeatmapCell({ coffee, dimIndex, score, onShow, onHide, onTap }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={(e) => { setHovered(true); onShow(coffee, dimIndex, e.currentTarget.getBoundingClientRect()); }}
      onMouseLeave={() => { setHovered(false); onHide(); }}
      onClick={() => onTap(coffee, dimIndex)}
      style={{
        position: "relative",
        borderTop: `1px solid ${COLORS.cardBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
        overflow: "hidden",
        minHeight: 44,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {/* Color fill */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: DIM_COLORS[dimIndex],
        opacity: 0.06 + (score / 10) * 0.74,
        transition: "opacity 0.2s",
      }} />
      {/* Hover highlight ring */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0,
          border: `1px solid ${DIM_COLORS[dimIndex]}`,
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
  );
});

const HeatmapRow = memo(function HeatmapRow({ coffee, onShow, onHide, onTap }) {
  return (
    <>
      {/* Name cell */}
      <div className="hm-name" style={{
        padding: "10px 6px 10px 2px",
        borderTop: `1px solid ${COLORS.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
      }}>
        <div style={{
          fontSize: TYPE.small, color: "#F0DEB8",
          fontFamily: "Georgia, serif", letterSpacing: "0.02em",
          lineHeight: 1.2,
        }}>
          {coffee.name}
        </div>
        <div style={{
          fontSize: TYPE.micro, color: COLORS.sub,
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {coffee.region}
        </div>
        {/* Note hidden on the narrowest screens to keep the grid scroll-free. */}
        <div className="hm-note" style={{
          fontSize: TYPE.micro, color: COLORS.sub,
          fontStyle: "italic", fontFamily: "Georgia, serif",
          letterSpacing: "0.02em", lineHeight: 1.4, opacity: 0.8,
        }}>
          {coffee.note}
        </div>
      </div>

      {/* Score cells */}
      {coffee.scores.map((score, i) => (
        <HeatmapCell
          key={coffee.name + "-" + i}
          coffee={coffee}
          dimIndex={i}
          score={score}
          onShow={onShow}
          onHide={onHide}
          onTap={onTap}
        />
      ))}
    </>
  );
});

// Two-letter abbreviations for the dimension headers on narrow screens.
const DIM_ABBR = ["Fr", "Fl", "Sw", "Nu", "Sp", "Ea"];

function HeatmapView({ coffees, sortDim, onDimClick, sortDir }) {
  const [tooltip, setTooltip] = useState(null);
  // tooltip: { coffee, dimIndex, anchorRect } | null  (desktop hover)
  const [sheet, setSheet] = useState(null);
  // sheet: { coffee, dimIndex } | null  (tap — reuses the bottom-sheet primitive)
  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Stable callbacks so memoized rows/cells never re-render on tooltip changes.
  const handleShow = useCallback((coffee, dimIndex, anchorRect) => {
    setTooltip({ coffee, dimIndex, anchorRect });
  }, []);
  const handleHide = useCallback(() => setTooltip(null), []);
  const handleTap = useCallback((coffee, dimIndex) => {
    setTooltip(null);
    setSheet({ coffee, dimIndex });
  }, []);

  return (
    <div>
      <div className="heatmap-grid" style={{ display: "grid", gap: 2 }}>
        {/* Header row */}
        <div style={{ padding: "6px 4px" }} />
        {DIMS.map((d, i) => {
          const active = sortDim === i;
          const arrow = active ? (sortDir === "desc" ? " ↓" : " ↑") : "";
          return (
            <div
              key={d}
              onClick={() => onDimClick(i)}
              style={{
                padding: "8px 2px 6px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: 4,
                userSelect: "none",
                touchAction: "manipulation",
              }}
            >
              <div style={{
                fontSize: TYPE.micro,
                color: DIM_COLORS[i],
                letterSpacing: "0.06em",
                opacity: active ? 1 : 0.75,
                borderBottom: active ? `1px solid ${DIM_COLORS[i]}` : "1px solid transparent",
                paddingBottom: 2,
                transition: "opacity 0.2s",
                display: "inline-block",
              }}>
                {/* Full label on wide screens, two-letter on narrow. */}
                <span className="hm-dim-full">{d}{arrow}</span>
                <span className="hm-dim-abbr">{DIM_ABBR[i]}{arrow}</span>
              </div>
            </div>
          );
        })}

        {/* Data rows */}
        {coffees.map((coffee) => (
          <HeatmapRow
            key={coffee.name}
            coffee={coffee}
            onShow={handleShow}
            onHide={handleHide}
            onTap={handleTap}
          />
        ))}
      </div>

      {/* Desktop hover tooltip (suppressed on touch breakpoint) */}
      {!isMobile && tooltip && (
        <HeatmapTooltip
          coffee={tooltip.coffee}
          dimIndex={tooltip.dimIndex}
          anchorRect={tooltip.anchorRect}
        />
      )}

      {/* Tap → bottom sheet: the path into the curated highlights from the heatmap */}
      {sheet && (
        <BottomSheet onClose={() => setSheet(null)} accent={`${DIM_COLORS[sheet.dimIndex]}99`}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6, marginBottom: 2 }}>
            <button
              onClick={() => setSheet(null)}
              aria-label="Close"
              style={{
                background: "none", border: "none",
                color: COLORS.sub, fontSize: 22, cursor: "pointer",
                fontFamily: "Georgia, serif", lineHeight: 1,
                width: 36, height: 36, marginRight: -8,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation",
              }}
            >×</button>
          </div>
          <HeatmapHighlightContent coffee={sheet.coffee} dimIndex={sheet.dimIndex} />
        </BottomSheet>
      )}
    </div>
  );
}

// ─── Methodology Modal ────────────────────────────────────────────────────────

function MethodologyModal({ onClose }) {
  useBodyScrollLock(true);
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
          overscrollBehavior: "contain",
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
          <button onClick={onClose} aria-label="Close" style={{
            background: "none", border: "none", color: COLORS.sub,
            fontSize: 24, cursor: "pointer", flexShrink: 0,
            fontFamily: "Georgia, serif", lineHeight: 1,
            width: 40, height: 40, marginRight: -8, marginTop: -8,
            display: "flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation",
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
          Floral and brighter acidity. A handful of origins are traditionally
          roasted darker than this baseline — Vietnamese, Sumatran, Brazilian,
          Indian Monsoon, Sulawesi Toraja, and Filipino Barako among them — and
          their scores reflect that darker cup. Where that is the case, the
          origin's detail panel notes the roast it was scored at.
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
          margin: 0, fontSize: TYPE.micro, color: COLORS.faint,
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
const ROAST_GRADIENT = `linear-gradient(to right, ${ROAST_COLORS.join(", ")})`;

// Numeric index 0–4 on ROAST_LEVELS, derived from each origin's display roast
// string at module load (the data carries no roastIndex). -1 if unrecognised.
function roastIndexOf(roast) {
  return ROAST_LEVELS.indexOf(roast);
}

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

// ─── Roast Spectrum Filter (4.1) ─────────────────────────────────────────────
// Replaces the five exact-match roast chips. The user taps levels on the
// RoastBar gradient to build a contiguous range; the active range is rendered
// as a bright band, the rest dimmed. `range` is { lo, hi } indices or null.
// Selecting a single level still surfaces its neighbours because the matcher
// (roastInRange) widens the band by ±1 — so "Light" surfaces Light–Medium.
function RoastSpectrumFilter({ range, onPick, onClear }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{
        position: "relative", height: 26, borderRadius: 6,
        display: "flex", overflow: "hidden",
        border: `1px solid ${COLORS.cardBorder}`,
      }}>
        {ROAST_LEVELS.map((lvl, i) => {
          const inRange = range != null && i >= range.lo && i <= range.hi;
          return (
            <button
              key={lvl}
              onClick={() => onPick(i)}
              aria-pressed={inRange}
              title={lvl}
              style={{
                flex: 1,
                border: "none",
                borderLeft: i === 0 ? "none" : `1px solid ${COLORS.bg}55`,
                background: ROAST_COLORS[i],
                opacity: range == null ? 0.5 : inRange ? 1 : 0.28,
                cursor: "pointer",
                padding: 0,
                transition: "opacity 0.15s",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {ROAST_LEVELS.map((lvl, i) => {
          const inRange = range != null && i >= range.lo && i <= range.hi;
          return (
            <span key={lvl} style={{
              fontSize: 8, flex: 1, textAlign: "center",
              color: inRange ? ROAST_COLORS[i] : COLORS.sub,
              fontFamily: "Georgia, serif",
              fontWeight: inRange ? "bold" : "normal",
              letterSpacing: "0.02em",
              transition: "color 0.15s",
            }}>
              {lvl}
            </span>
          );
        })}
      </div>
      {range != null && (
        <button
          onClick={onClear}
          style={{
            marginTop: 4, fontSize: 8.5, fontFamily: "Georgia, serif",
            background: "none", border: "none", color: COLORS.sub,
            cursor: "pointer", padding: 0, opacity: 0.75,
            textDecoration: "underline", letterSpacing: "0.04em",
          }}
        >
          clear roast range
        </button>
      )}
    </div>
  );
}

// True when an origin's roast index falls inside the selected range, widened by
// ±1 so a single-level pick still surfaces adjacent roasts (4.1 exit criterion).
function roastInRange(roast, range) {
  if (range == null) return true;
  const i = roastIndexOf(roast);
  if (i === -1) return false;
  return i >= range.lo - 1 && i <= range.hi + 1;
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
  useBodyScrollLock(true);

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
          overscrollBehavior: "contain",
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <ProcessBadge process={coffee.processes.primary} size="lg" />
              <SpeciesBadge species={coffee.species} size="lg" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "none", border: "none",
                color: COLORS.sub, fontSize: 24,
                cursor: "pointer",
                fontFamily: "Georgia, serif", lineHeight: 1,
                width: 40, height: 40, marginRight: -8,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation",
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
                      width: "100%",
                      transform: `scaleX(${coffee.scores[i] / 10})`,
                      transformOrigin: "left",
                      background: DIM_COLORS[i],
                      borderRadius: 3, opacity: 0.85,
                      transition: "transform 0.8s ease",
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

            {/* Scored-at baseline note (4.5) — only when scores reference a
                roast other than the light-to-medium baseline. */}
            {coffee.scoredAt && (
              <div style={{
                fontSize: 10, color: COLORS.label, fontStyle: "italic",
                letterSpacing: "0.02em", lineHeight: 1.6, marginTop: -10,
              }}>
                Scored at: {coffee.scoredAt} roast — this origin is traditionally
                enjoyed at a darker roast, and its scores reflect that cup.
              </div>
            )}

            {/* Processing method + explainer */}
            <div>
              <div style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                textTransform: "uppercase", marginBottom: 7,
              }}>
                Processing Method
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <ProcessBadge process={coffee.processes.primary} size="lg" />
                {PROCESS_EXPLAINERS[coffee.processes.primary] && (
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
              {coffee.processes.also.length > 0 && (
                <div style={{
                  margin: "8px 0 0", fontSize: 10, color: COLORS.sub,
                  fontStyle: "italic", letterSpacing: "0.02em",
                }}>
                  also commonly: {coffee.processes.also.join(", ")}
                </div>
              )}
              {showProcessExplainer && PROCESS_EXPLAINERS[coffee.processes.primary] && (
                <p style={{
                  margin: "10px 0 0", fontSize: 10.5, color: COLORS.sub,
                  fontStyle: "italic", lineHeight: 1.65, letterSpacing: "0.02em",
                  borderLeft: `2px solid ${PROCESS_COLORS[coffee.processes.primary]?.border ?? COLORS.cardBorder}`,
                  paddingLeft: 10,
                }}>
                  {PROCESS_EXPLAINERS[coffee.processes.primary]}
                </p>
              )}
            </div>

            {/* Cultivars */}
            {coffee.cultivars?.length > 0 && (
              <div>
                <div style={{
                  fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em",
                  textTransform: "uppercase", marginBottom: 7,
                }}>
                  Cultivars
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {coffee.cultivars.map((cv) => (
                    <span key={cv} style={{
                      fontSize: 10, color: "#A98BC7",
                      background: "#A98BC711",
                      border: "1px solid #A98BC744",
                      borderRadius: 4, padding: "2px 8px",
                    }}>
                      {cv}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

function pcAxisLabels(loadings) {
  const sorted = loadings
    .map((v, i) => ({ i, v, abs: Math.abs(v) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 2);
  const pos = sorted.filter(d => d.v >= 0).map(d => DIMS[d.i]).join(" · ") || "mixed";
  const neg = sorted.filter(d => d.v < 0).map(d => DIMS[d.i]).join(" · ") || "mixed";
  return { pos, neg };
}

function pcaLabelText(name) {
  const overrides = {
    "Ethiopian Harrar":      "Eth. Harrar",
    "Jamaican Blue Mountain":"Jamaican",
    "Hawaiian Kona":         "Kona",
    "Papua New Guinea":      "Papua NG",
    "Sulawesi Toraja":       "Sulawesi",
    "Salvadoran Pacamara":   "Pacamara",
    "Congolese Kivu":        "Congolese",
    "St. Helena":            "St. Helena",
    "Filipino Barako":       "Barako",
    "Indian Monsoon":        "Monsoon",
    "Panama Geisha":         "Geisha",
  };
  return overrides[name] ?? name.split(" ")[0];
}

// Greedy label de-collision: tries 8 anchor positions per point, picks lowest overlap.
function computeLabelPositions(pts, labels) {
  const charW = 4.5, textH = 9, dotR = 7.5;
  const candidates = [
    { dx: dotR,       dy: 4,           anchor: "start"  }, // right
    { dx: dotR,       dy: -5,          anchor: "start"  }, // upper-right
    { dx: -dotR,      dy: 4,           anchor: "end"    }, // left
    { dx: -dotR,      dy: -5,          anchor: "end"    }, // upper-left
    { dx: 0,          dy: -(dotR + 2), anchor: "middle" }, // top
    { dx: 0,          dy: dotR + textH,anchor: "middle" }, // bottom
    { dx: dotR,       dy: 13,          anchor: "start"  }, // lower-right
    { dx: -dotR,      dy: 13,          anchor: "end"    }, // lower-left
  ];
  const placed = [];
  return pts.map(({ cx, cy }, i) => {
    const lbl = labels[i];
    const w = lbl.length * charW;
    let best = null, bestScore = Infinity;
    for (const c of candidates) {
      const tx = cx + c.dx, ty = cy + c.dy;
      const l = c.anchor === "start" ? tx : c.anchor === "end" ? tx - w : tx - w / 2;
      const r = l + w, t = ty - textH, b = ty;
      let score = 0;
      for (const p of placed) {
        score += Math.max(0, Math.min(r, p.r) - Math.max(l, p.l)) *
                 Math.max(0, Math.min(b, p.b) - Math.max(t, p.t));
      }
      if (score < bestScore) { bestScore = score; best = { c, l, r, t, b }; }
      if (score === 0) break;
    }
    placed.push(best);
    return { x: cx + best.c.dx, y: cy + best.c.dy, anchor: best.c.anchor };
  });
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
    .sort((a, b) => b.score - a.score || a.coffee.name.localeCompare(b.coffee.name));

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
                    <ProcessBadge process={coffee.processes.primary} />
                    <SpeciesBadge species={coffee.species} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1, height: 3, background: "#2A1A08", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: "100%",
                        transform: `scaleX(${score})`, transformOrigin: "left",
                        background: rank === 0 ? COLORS.gridOuter : `${COLORS.gridOuter}88`,
                        borderRadius: 2, transition: "transform 0.4s ease",
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

function PCATooltip({ coffee, x, y }) {
  const TW = 200;
  const TH = 170;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const left = x + 14 + TW > vw - 8 ? x - TW - 14 : x + 14;
  const top  = Math.min(y - 20, vh - TH - 8);
  const regionColor = REGION_COLORS[coffee.region] ?? COLORS.label;
  return (
    <div style={{
      position: "fixed", left, top, width: TW,
      background: "#1F1409",
      border: `1px solid ${COLORS.gridOuter}55`,
      borderRadius: 8, padding: "10px 12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
      fontFamily: "Georgia, serif",
      pointerEvents: "none", zIndex: 300,
      animation: "popoverIn 0.1s ease both",
    }}>
      <div style={{ fontSize: 11, color: "#F0DEB8", letterSpacing: "0.04em", marginBottom: 3 }}>
        {coffee.name}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: regionColor, flexShrink: 0 }} />
        <span style={{ fontSize: 9, color: COLORS.sub, letterSpacing: "0.1em" }}>{coffee.region}</span>
      </div>
      <div style={{ fontSize: 9, color: COLORS.label, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
        {coffee.note}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {DIMS.map((dim, i) => (
          <div key={dim} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 8, color: DIM_COLORS[i], width: 34, flexShrink: 0, letterSpacing: "0.04em" }}>
              {dim}
            </span>
            <div style={{ flex: 1, height: 3, background: COLORS.grid, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                width: `${coffee.scores[i] * 10}%`, height: "100%",
                background: DIM_COLORS[i], borderRadius: 2, opacity: 0.85,
              }} />
            </div>
            <span style={{ fontSize: 8, color: DIM_COLORS[i], width: 12, textAlign: "right", opacity: 0.8 }}>
              {coffee.scores[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PCAScatter() {
  const [showExplainer, setShowExplainer] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [colorBy, setColorBy] = useState("region");
  const W = 780, H = 500, PAD = 60;

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

  const pcaLabels = coffees.map(c => pcaLabelText(c.name));
  const labelPos  = computeLabelPositions(pts, pcaLabels);

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
        <p style={{ fontSize: 10, color: COLORS.sub, fontStyle: "italic", fontFamily: "Georgia, serif", margin: "0 0 10px" }}>
          Coffees plotted by flavor similarity — the closer together, the more alike they taste
        </p>

        {/* Color-by toggle */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: COLORS.sub, fontFamily: "Georgia, serif" }}>Color by</span>
          {["region", "process"].map(mode => (
            <button key={mode} onClick={() => setColorBy(mode)} style={{
              fontSize: 9, fontFamily: "Georgia, serif", letterSpacing: "0.08em",
              textTransform: "capitalize", cursor: "pointer",
              background: "none", borderRadius: 12, padding: "2px 10px",
              border: `1px solid ${colorBy === mode ? COLORS.gridOuter : COLORS.cardBorder}`,
              color: colorBy === mode ? COLORS.label : COLORS.sub,
              transition: "all 0.15s",
            }}>{mode}</button>
          ))}
        </div>

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
                Use the <em style={{ color: "#F0DEB8" }}>Color by</em> toggle to switch between
                coloring dots by growing region or by processing method. When coffees of the same
                color cluster together, geography or process is driving that similarity — when they
                scatter, the origin is genuinely distinct from its peers.
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
        {/* Horizontal axis labels — both ends */}
        <text x={W-PAD+8} y={H/2+4} fill={COLORS.label} fontSize={8.5} textAnchor="start" fontStyle="italic">
          {pcAxisLabels(PC1_LOAD).pos} →
        </text>
        <text x={PAD-8} y={H/2+4} fill={COLORS.label} fontSize={8.5} textAnchor="end" fontStyle="italic">
          ← {pcAxisLabels(PC1_LOAD).neg}
        </text>
        {/* Vertical axis labels — both ends */}
        <text x={W/2} y={PAD-14} fill={COLORS.label} fontSize={8.5} textAnchor="middle" fontStyle="italic">
          {pcAxisLabels(PC2_LOAD).pos} ↑
        </text>
        <text x={W/2} y={H-PAD+18} fill={COLORS.label} fontSize={8.5} textAnchor="middle" fontStyle="italic">
          ↓ {pcAxisLabels(PC2_LOAD).neg}
        </text>

        {/* Points — colored by region */}
        {pts.map((pt, i) => {
          const coffee = coffees[i];
          const fill   = colorBy === "region"
            ? (REGION_COLORS[coffee.region] ?? COLORS.label)
            : (PROCESS_COLORS[coffee.processes.primary]?.text ?? COLORS.label);
          const isHot  = tooltip?.coffee === coffee;
          return (
            <g key={i} style={{ cursor: "default" }}
              onMouseEnter={(e) => setTooltip({ coffee, x: e.clientX, y: e.clientY })}
              onMouseMove={(e)  => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                cx={pt.cx} cy={pt.cy} r={5.5}
                fill={fill} fillOpacity={isHot ? 1 : 0.7}
                stroke={fill} strokeWidth={isHot ? 1.5 : 0.8} strokeOpacity={isHot ? 0.9 : 0.5}
              />
              <text
                x={labelPos[i].x} y={labelPos[i].y}
                fill="#F0DEB8" fontSize={7.5} fillOpacity={isHot ? 0.95 : 0.6}
                textAnchor={labelPos[i].anchor}
                pointerEvents="none"
              >
                {pcaLabels[i]}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && <PCATooltip coffee={tooltip.coffee} x={tooltip.x} y={tooltip.y} />}

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
        {colorBy === "region"
          ? Object.entries(REGION_COLORS).map(([label, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, opacity: 0.85 }} />
                <span style={{ fontSize: 8.5, color: COLORS.sub, fontFamily: "Georgia, serif" }}>{label}</span>
              </div>
            ))
          : Object.entries(PROCESS_COLORS).map(([label, c]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.text, opacity: 0.85 }} />
                <span style={{ fontSize: 8.5, color: COLORS.sub, fontFamily: "Georgia, serif" }}>{label}</span>
              </div>
            ))
        }
      </div>
    </div>
  );
}

// ─── Compare View ─────────────────────────────────────────────────────────────

// Series colors for the 2–3 way comparison. 1 = gold, 2 = violet (both existing),
// 3 = sage (sanctioned new Earthy hue). Stroke patterns distinguish series even
// for colorblind users: solid / dashed / dotted.
const SERIES_COLORS = ["#D4A843", "#A98BC7", "#7A9B6A"];
const SERIES_DASH = ["none", "4 2", "1.5 3"];

// Animate the six score vectors of each selected coffee toward a new target with
// a single rAF lerp (~350ms ease-out). SVG points/d aren't reliably CSS
// animatable, so we interpolate the numbers in JS and recompute points per frame.
// Under prefers-reduced-motion (or first paint) we snap instantly.
function useAnimatedScores(coffees) {
  const reduceMotion = usePrefersReducedMotion();
  const target = coffees.map((c) => c.scores);
  const [display, setDisplay] = useState(() => target.map((s) => s.slice()));
  const fromRef = useRef(display);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  // Stable signature of the current target set (names + scores).
  const sig = coffees.map((c) => c.name).join("|");

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const to = target;
    // If shapes changed (count differs) or reduced motion, snap immediately.
    const from = fromRef.current;
    const sameShape =
      from.length === to.length && from.every((row, i) => row.length === to[i].length);
    if (reduceMotion || !sameShape) {
      fromRef.current = to.map((s) => s.slice());
      setDisplay(fromRef.current);
      return;
    }
    const DUR = 350;
    startRef.current = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / DUR);
      const k = ease(t);
      const next = to.map((row, ci) =>
        row.map((v, di) => from[ci][di] + (v - from[ci][di]) * k)
      );
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to.map((s) => s.slice());
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, reduceMotion]);

  return display;
}

// Generalized compare radar: 2–3 origins overlaid in pure SVG (~15 nodes/series).
// Painter's algorithm — largest polygon painted first so small profiles aren't
// buried. mix-blend-mode: screen makes overlaps read as intentional blends on the
// dark background. Optional per-vertex hit circles open the multi-origin sheet.
function CompareRadar({ coffees, colors, size = 340, displayScores, onVertexTap }) {
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
  // Per-frame polygon vertices come from the animated scores when provided.
  const scoresList = displayScores || coffees.map((c) => c.scores);

  // Paint order: largest area (sum of scores) first so small profiles sit on
  // top. Computed from the STABLE target scores (not the animated values) so the
  // stacking order can't flicker mid-morph.
  const order = coffees
    .map((_, i) => i)
    .sort((a, b) => {
      const sa = coffees[a].scores.reduce((s, v) => s + v, 0);
      const sb = coffees[b].scores.reduce((s, v) => s + v, 0);
      return sb - sa;
    });

  // Hit-circle anchor per dimension: outer ring so the tap zone is predictable.
  const hitPos = DIMS.map((_, i) => toXY((2 * Math.PI * i) / NUM, R));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible", width: "min(340px, 80vw)", height: "auto" }}>
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
      {/* Series polygons — painter's algorithm, screen-blended overlaps */}
      <g style={{ mixBlendMode: "screen" }}>
        {order.map((ci) => (
          <polygon
            key={coffees[ci].name}
            points={polyPts(scoresList[ci])}
            fill={colors[ci] + "2E"}
            stroke={colors[ci]}
            strokeWidth={1.5}
            strokeDasharray={SERIES_DASH[ci] === "none" ? undefined : SERIES_DASH[ci]}
            filter={ci === order[0] ? "url(#cmp-glow)" : undefined}
          />
        ))}
      </g>
      {DIMS.map((d, i) => (
        <text key={i} x={dimLabelPos[i].x} y={dimLabelPos[i].y + 3}
          textAnchor="middle" fontSize={8} fill={DIM_COLORS[i]} opacity={0.85}
          fontFamily="Georgia, serif">
          {d}
        </text>
      ))}
      {/* Per-vertex invisible hit circles → multi-origin flavor sheet */}
      {onVertexTap && hitPos.map(({ x, y }, i) => (
        <circle key={`hit-${i}`} cx={x} cy={y} r={14} fill="transparent"
          style={{ cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onVertexTap(i); }} />
      ))}
    </svg>
  );
}

// 3.4 — Multi-origin flavor sheet. Reuses the BottomSheet primitive: one
// dimension, every selected origin's curated highlight stacked and labeled in
// its series color. Null highlights show a tasteful placeholder.
function CompareFlavorSheet({ coffees, colors, dimIndex, onClose }) {
  const dim = DIMS[dimIndex];
  return (
    <BottomSheet onClose={onClose} accent={`${DIM_COLORS[dimIndex]}99`}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12,
      }}>
        <div style={{ fontSize: TYPE.micro, color: DIM_COLORS[dimIndex], letterSpacing: "0.22em", textTransform: "uppercase" }}>
          {dim} · across {coffees.length} origins
        </div>
        <span onClick={onClose} style={{ cursor: "pointer", color: COLORS.sub, fontSize: 22, lineHeight: 1, marginLeft: 12 }}>×</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {coffees.map((c, idx) => {
          const h = c.highlights[dimIndex];
          const col = colors[idx];
          return (
            <div key={c.name} style={{ borderLeft: `2px solid ${col}`, paddingLeft: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontSize: TYPE.small, color: col, fontFamily: "Georgia, serif", letterSpacing: "0.04em" }}>
                  {c.name}
                </span>
                <span style={{ fontSize: TYPE.micro, color: COLORS.sub }}>· {c.scores[dimIndex]}/10</span>
              </div>
              {h ? (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                    {h.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: TYPE.micro, color: col,
                        background: `${col}26`, border: `1px solid ${col}55`,
                        borderRadius: 20, padding: "3px 9px", letterSpacing: "0.04em", whiteSpace: "nowrap",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: TYPE.small, color: COLORS.label, fontStyle: "italic", lineHeight: 1.6 }}>
                    {h.note}
                  </p>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: TYPE.small, color: COLORS.sub, fontStyle: "italic", lineHeight: 1.55 }}>
                  Not a defining note for {c.name.split(" ")[0]}.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// 3.3 — Sticky-top comparison screen, the destination of the select-from-cards
// flow. The radar pins to the top (sticky, backdrop-blurred); per-dimension
// grouped bars and per-origin info panels scroll beneath. Reuses TYPE / COLORS.
function CompareScreen({ coffees, onRemove, onClearAll }) {
  const colors = coffees.map((_, i) => SERIES_COLORS[i]);
  const displayScores = useAnimatedScores(coffees);
  const [sheetDim, setSheetDim] = useState(null);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Sticky radar header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(26,16,8,0.82)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        margin: "0 -24px", padding: "12px 24px 14px",
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "45vh", justifyContent: "center",
      }}>
        <CompareRadar
          coffees={coffees}
          colors={colors}
          size={300}
          displayScores={displayScores}
          onVertexTap={setSheetDim}
        />
        <div style={{ display: "flex", gap: 18, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {coffees.map((c, idx) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width={22} height={10}>
                <line x1={0} y1={5} x2={22} y2={5} stroke={colors[idx]} strokeWidth={2}
                  strokeDasharray={SERIES_DASH[idx] === "none" ? undefined : SERIES_DASH[idx]} />
              </svg>
              <span style={{ fontSize: 11, color: COLORS.label, fontFamily: "Georgia, serif" }}>{c.name}</span>
              <button
                onClick={() => onRemove(c.name)}
                aria-label={`Remove ${c.name}`}
                className="tap-chip"
                style={{
                  background: "none", border: "none", color: COLORS.sub,
                  fontSize: 14, lineHeight: 1, cursor: "pointer", padding: "0 2px",
                }}
              >×</button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: TYPE.micro, color: COLORS.sub, fontStyle: "italic", marginTop: 8 }}>
          Tap a point to compare that flavor across all origins
        </div>
      </div>

      {/* Per-dimension grouped score bars */}
      <div style={{
        background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 8, padding: "18px 22px", margin: "18px 0 16px",
      }}>
        <div style={{ fontSize: 9, color: COLORS.sub, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
          Flavor Scores
        </div>
        {DIMS.map((dim, i) => {
          const max = Math.max(...coffees.map((c) => c.scores[i]));
          return (
            <div key={dim} style={{ marginBottom: 12 }}>
              <div
                onClick={() => setSheetDim(i)}
                style={{ fontSize: 9.5, color: DIM_COLORS[i], letterSpacing: "0.08em", marginBottom: 5, cursor: "pointer" }}
              >
                {dim}
              </div>
              {coffees.map((c, idx) => {
                const leads = c.scores[i] === max;
                return (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div className="compare-score-label" style={{ width: 100, fontSize: 8.5, color: colors[idx], fontFamily: "Georgia, serif", textAlign: "right", flexShrink: 0 }}>
                      {c.name.split(" ")[0]}
                    </div>
                    <div style={{ flex: 1, height: 5, background: "#2A1A08", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: "100%",
                        transform: `scaleX(${c.scores[i] / 10})`, transformOrigin: "left",
                        background: colors[idx], borderRadius: 3, opacity: 0.85,
                        transition: "transform 0.35s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: colors[idx], width: 26, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                      {leads && <span style={{ color: colors[idx] }} title="leads">▲</span>}
                      {c.scores[i]}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Per-origin info panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {coffees.map((c, idx) => (
          <div key={c.name} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 8, padding: "16px 20px", borderTop: `2px solid ${colors[idx]}`,
          }}>
            <div style={{ fontSize: 9, color: colors[idx], letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
              {c.region}
            </div>
            <div style={{ fontSize: 16, color: "#F0DEB8", fontFamily: "Georgia, serif", marginBottom: 8 }}>{c.name}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, alignItems: "center" }}>
              <ProcessBadge process={c.processes.primary} size="sm" />
              <SpeciesBadge species={c.species} size="sm" />
              <span style={{ fontSize: 9, color: COLORS.sub }}>
                {c.roast} roast{c.scoredAt ? ` · scored at ${c.scoredAt}` : ""}
              </span>
            </div>
            {c.cultivars?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                {c.cultivars.map((cv) => (
                  <span key={cv} style={{
                    fontSize: 9, color: "#A98BC7", background: "#A98BC711",
                    border: "1px solid #A98BC744", borderRadius: 4, padding: "2px 7px",
                  }}>
                    {cv}
                  </span>
                ))}
              </div>
            )}
            <p style={{ margin: 0, fontSize: 10.5, color: COLORS.sub, fontStyle: "italic", lineHeight: 1.65 }}>{c.note}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <button
          onClick={onClearAll}
          className="tap-chip"
          style={{
            fontSize: TYPE.micro, fontFamily: "Georgia, serif", letterSpacing: "0.08em",
            padding: "6px 16px", borderRadius: 14, border: `1px solid ${COLORS.cardBorder}`,
            background: "transparent", color: COLORS.sub, cursor: "pointer",
          }}
        >
          clear comparison
        </button>
      </div>

      {sheetDim != null && (
        <CompareFlavorSheet
          coffees={coffees}
          colors={colors}
          dimIndex={sheetDim}
          onClose={() => setSheetDim(null)}
        />
      )}
    </div>
  );
}

const sortedCoffeeNames = coffees.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => c.name);

// Legacy two-dropdown Compare tab. Kept working by feeding the array form into
// the generalized CompareRadar (3.1). The select-from-cards flow (3.2) is the
// primary path; this remains for users who prefer explicit dropdowns.
function CompareView() {
  const [nameA, setNameA] = useState(sortedCoffeeNames[0]);
  const [nameB, setNameB] = useState(sortedCoffeeNames[1]);
  const a = coffees.find(c => c.name === nameA);
  const b = coffees.find(c => c.name === nameB);
  const pair = [a, b];
  const colors = [SERIES_COLORS[0], SERIES_COLORS[1]];
  const [sheetDim, setSheetDim] = useState(null);

  const selectStyle = {
    appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
    // 16px kills iOS Safari's focus auto-zoom on form controls.
    background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 6, color: COLORS.label, fontSize: 16,
    fontFamily: "Georgia, serif", padding: "8px 30px 8px 12px", cursor: "pointer",
    boxSizing: "border-box",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23A08C6E'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Dropdowns */}
      <div className="compare-selects" style={{ marginBottom: 28 }}>
        {[[nameA, setNameA, colors[0]], [nameB, setNameB, colors[1]]].map(([val, setter, color], idx) => (
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
        <CompareRadar coffees={pair} colors={colors} size={340} onVertexTap={setSheetDim} />
        <div style={{ display: "flex", gap: 28, marginTop: 12 }}>
          {pair.map((c, idx) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width={22} height={10}>
                <line x1={0} y1={5} x2={22} y2={5} stroke={colors[idx]} strokeWidth={2}
                  strokeDasharray={SERIES_DASH[idx] === "none" ? undefined : SERIES_DASH[idx]} />
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
            {pair.map((c, idx) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div className="compare-score-label" style={{ width: 100, fontSize: 8.5, color: colors[idx], fontFamily: "Georgia, serif", textAlign: "right", flexShrink: 0 }}>
                  {c.name.split(" ")[0]}
                </div>
                <div style={{ flex: 1, height: 5, background: "#2A1A08", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.scores[i] * 10}%`, background: colors[idx], borderRadius: 3, opacity: 0.85 }} />
                </div>
                <div style={{ fontSize: 9, color: colors[idx], width: 16, textAlign: "right" }}>{c.scores[i]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Info panels */}
      <div className="compare-info-grid" style={{ gap: 16 }}>
        {pair.map((c, idx) => (
          <div key={c.name} style={{
            background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 8, padding: "16px 20px",
            borderTop: `2px solid ${colors[idx]}`,
          }}>
            <div style={{ fontSize: 9, color: colors[idx], letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
              {c.region}
            </div>
            <div style={{ fontSize: 16, color: "#F0DEB8", fontFamily: "Georgia, serif", marginBottom: 8 }}>{c.name}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, alignItems: "center" }}>
              <ProcessBadge process={c.processes.primary} size="sm" />
              <SpeciesBadge species={c.species} size="sm" />
              <span style={{ fontSize: 9, color: COLORS.sub, alignSelf: "center" }}>
                {c.roast} roast{c.scoredAt ? ` · scored at ${c.scoredAt}` : ""}
              </span>
            </div>
            {c.cultivars?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                {c.cultivars.map(cv => (
                  <span key={cv} style={{
                    fontSize: 9, color: "#A98BC7",
                    background: "#A98BC711",
                    border: "1px solid #A98BC744",
                    borderRadius: 4, padding: "2px 7px",
                  }}>
                    {cv}
                  </span>
                ))}
              </div>
            )}
            <p style={{ margin: 0, fontSize: 10.5, color: COLORS.sub, fontStyle: "italic", lineHeight: 1.65 }}>{c.note}</p>
          </div>
        ))}
      </div>

      {sheetDim != null && (
        <CompareFlavorSheet coffees={pair} colors={colors} dimIndex={sheetDim} onClose={() => setSheetDim(null)} />
      )}
    </div>
  );
}

// ─── Shareable compare URL (3.6) ──────────────────────────────────────────────
// Encode/decode the selected origins in ?compare=Name1,Name2,Name3. Unknown or
// garbage names are dropped gracefully; selection caps at 3.
const COFFEE_BY_NAME = new Map(coffees.map((c) => [c.name, c]));

function readCompareFromURL() {
  if (typeof window === "undefined") return [];
  const param = new URLSearchParams(window.location.search).get("compare");
  if (!param) return [];
  const names = param.split(",").map((s) => decodeURIComponent(s.trim()));
  const seen = new Set();
  const valid = [];
  for (const name of names) {
    const c = COFFEE_BY_NAME.get(name);
    if (c && !seen.has(name)) { seen.add(name); valid.push(c); }
    if (valid.length === 3) break;
  }
  return valid;
}

function writeCompareToURL(selected) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (selected.length > 0) {
    url.searchParams.set("compare", selected.map((c) => encodeURIComponent(c.name)).join(","));
  } else {
    url.searchParams.delete("compare");
  }
  // replaceState — don't spam browser history on every selection change.
  window.history.replaceState(null, "", url);
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function CoffeeInfographic() {
  // Restore a shared comparison from the URL on first load (3.6).
  const initialCompare = readCompareFromURL();
  const [sortDim, setSortDim] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [view, setView] = useState(initialCompare.length >= 2 ? "compareScreen" : "cards");
  const [showMethodology, setShowMethodology] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [brewFilter, setBrewFilter] = useState(new Set());
  // Roast filter is a contiguous range { lo, hi } of ROAST_LEVELS indices, or
  // null for "any" (4.1). Process filter matches primary OR also (4.3).
  const [roastRange, setRoastRange] = useState(null);
  const [processFilter, setProcessFilter] = useState(new Set());
  // Which process chip's ⓘ explainer sheet is open (process string | null).
  const [processInfo, setProcessInfo] = useState(null);
  // { coffeeName: string, dimIndex: number } | null
  const [activePopover, setActivePopover] = useState(null);

  // ─── Compare Mode 2.0 selection state (3.2 / 3.6) ───────────────────────────
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState(initialCompare); // Coffee[] length 0–3

  // Keep the URL in sync with the selection while comparing (replaceState).
  useEffect(() => {
    if (view === "compareScreen" || selected.length > 0) {
      writeCompareToURL(selected);
    }
  }, [selected, view]);

  // Stable selection handlers so React.memo(CoffeeCard) stays effective.
  const toggleSelect = useCallback((coffee) => {
    setSelected((prev) => {
      const exists = prev.some((c) => c.name === coffee.name);
      if (exists) return prev.filter((c) => c.name !== coffee.name);
      if (prev.length >= 3) return prev; // cap at 3 — a 4th tap is a no-op
      return [...prev, coffee];
    });
  }, []);

  const removeSelected = useCallback((name) => {
    setSelected((prev) => prev.filter((c) => c.name !== name));
  }, []);

  const clearSelection = useCallback(() => {
    setSelected([]);
    writeCompareToURL([]);
  }, []);

  const goToCompareScreen = useCallback(() => {
    if (selected.length >= 2) setView("compareScreen");
  }, [selected.length]);

  // Toggling compare mode off leaving the cards view clears the in-progress
  // selection so the bottom bar doesn't linger.
  const toggleCompareMode = useCallback(() => {
    setCompareMode((prev) => {
      if (prev) setSelected([]);
      return !prev;
    });
  }, []);

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

  const handleDotClick = useCallback((coffeeName, dimIndex) => {
    setActivePopover((prev) =>
      prev?.coffeeName === coffeeName && prev?.dimIndex === dimIndex
        ? null
        : { coffeeName, dimIndex }
    );
  }, []);

  const closePopover = useCallback(() => setActivePopover(null), []);
  const selectCoffee = useCallback((c) => setSelectedCoffee(c), []);

  // Click anywhere outside a popover closes it
  useEffect(() => {
    if (!activePopover) return;
    function onDocClick() { setActivePopover(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [activePopover]);

  const sortedCoffees =
    sortDim === null
      ? coffees.slice().sort((a, b) => a.name.localeCompare(b.name))
      : coffees.slice().sort((a, b) =>
          sortDir === "desc"
            ? b.scores[sortDim] - a.scores[sortDim]
            : a.scores[sortDim] - b.scores[sortDim]
        );

  const filteredCoffees = sortedCoffees.filter(c =>
    (brewFilter.size === 0 || c.brewMethods.some(m => brewFilter.has(m))) &&
    roastInRange(c.roast, roastRange) &&
    (processFilter.size === 0 || Array.from(processFilter).some(p => originHasProcess(c, p)))
  );

  function toggleBrew(method) {
    setBrewFilter(prev => { const n = new Set(prev); n.has(method) ? n.delete(method) : n.add(method); return n; });
  }
  // Tapping a roast level extends the contiguous range to include it; tapping
  // the only-selected level clears the range.
  function pickRoast(idx) {
    setRoastRange(prev => {
      if (prev == null) return { lo: idx, hi: idx };
      if (prev.lo === idx && prev.hi === idx) return null;
      return { lo: Math.min(prev.lo, idx), hi: Math.max(prev.hi, idx) };
    });
  }
  function toggleProcess(process) {
    setProcessFilter(prev => { const n = new Set(prev); n.has(process) ? n.delete(process) : n.add(process); return n; });
  }
  function clearAllFilters() {
    setBrewFilter(new Set());
    setRoastRange(null);
    setProcessFilter(new Set());
  }
  const anyFilterActive = brewFilter.size > 0 || roastRange != null || processFilter.size > 0;

  // name → series index (0-based) for quick per-card lookup.
  const selectIndexByName = new Map(selected.map((c, i) => [c.name, i]));

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
        /* Touch hardening: kill the 300ms tap delay / double-tap zoom on every
           interactive element so taps land on the first try. */
        button, select, a, [role="button"], .coffee-card,
        .nav-tabs button, .heatmap-grid > div {
          touch-action: manipulation;
        }
        /* Effective tap target ≥36px for chip/pill buttons without enlarging
           their visual box: a transparent pseudo-element pads the hit area. */
        .tap-chip { position: relative; }
        .tap-chip::after {
          content: "";
          position: absolute;
          top: 50%; left: 0; right: 0;
          transform: translateY(-50%);
          min-height: 36px; height: 100%;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .coffee-card {
          content-visibility: auto;
          contain-intrinsic-size: auto 420px;
        }
        .card-enter {
          animation: fadeIn 0.5s ease both;
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
        /* Heatmap: wide screens get roomy score columns and the full note;
           narrow phones get a tight name column, two-letter dimension headers,
           and no note — so the whole grid fits with NO horizontal scroll. */
        .heatmap-grid {
          grid-template-columns: 1fr repeat(6, minmax(40px, 56px));
        }
        .hm-dim-abbr { display: none; }
        .hm-dim-full { display: inline; }
        @media (max-width: 639px) {
          .heatmap-grid {
            grid-template-columns: minmax(88px, 1fr) repeat(6, minmax(0, 1fr));
          }
          .hm-dim-abbr { display: inline; }
          .hm-dim-full { display: none; }
          .hm-note { display: none; }
        }
        @media (max-width: 360px) {
          .heatmap-grid {
            gap: 1px;
            grid-template-columns: minmax(72px, 1fr) repeat(6, minmax(0, 1fr));
          }
          .hm-name { padding-right: 2px !important; }
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
        .nav-tabs {
          display: flex;
          justify-content: flex-start;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          max-width: 100%;
          padding-bottom: 2px;
          /* Edge-fade scroll affordance — masks tabs running off either side. */
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%);
          mask-image: linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%);
        }
        .nav-tabs::-webkit-scrollbar { display: none; }
        /* "Safe center": justify-content is flex-start; the first/last tabs
           carry margin-left/right: auto inline. The autos center the row when
           it fits but collapse on overflow, keeping every tab reachable. */
        @media (max-width: 560px) {
          .nav-tabs button {
            padding: 5px 10px !important;
            font-size: 8.5px !important;
            letter-spacing: 0.1em !important;
          }
        }
        .dim-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .dim-legend {
            gap: 10px;
          }
          .dim-legend > div {
            min-width: 60px !important;
          }
        }
        .compare-selects {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .compare-selects select {
          width: min(240px, 80vw);
        }
        @media (prefers-reduced-motion: reduce) {
          .card-enter { animation: none !important; }
          .radar-dot-group:hover .dot-ring,
          .dot-ring-active { animation: none !important; }
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
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
          <div className="dim-legend" style={{ marginTop: 20 }}>
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
        <div className="nav-tabs" style={{
          marginBottom: 24,
          position: "sticky", top: 0, zIndex: 60,
          background: COLORS.bg, paddingTop: 6, paddingBottom: 6,
        }}>
          {[
            { key: "cards",    label: "Origins" },
            { key: "compare",  label: "Compare" },
            { key: "heatmap",  label: "Heatmap" },
            { key: "map",      label: "Flavor Map" },
            { key: "discover", label: "Discover" },
            { key: "tags",     label: "Tags" },
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
                transition: "all 0.2s",
                marginLeft: idx === 0 ? "auto" : -1,
                marginRight: idx === arr.length - 1 ? "auto" : undefined,
                position: "relative", zIndex: view === key ? 1 : 0,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Brew method + roast level filters */}
        {view === "cards" && (
          <div className="filter-row" style={{
            marginBottom: 20, display: "flex", flexDirection: "column", gap: 8,
            position: "sticky", top: 44, zIndex: 50,
            background: COLORS.bg,
            paddingTop: 8, paddingBottom: 10,
            borderBottom: `1px solid ${COLORS.cardBorder}`,
          }}>
            {[
              {
                label: "Brew Method",
                items: ["AeroPress","Chemex","Cold Brew","Drip","Espresso","French Press","Ibrik / Turkish","Moka Pot","Phin Filter","Pour Over"],
                filter: brewFilter,
                toggle: toggleBrew,
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
                      className="tap-chip"
                      style={{
                        fontSize: TYPE.micro, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
                        padding: "6px 11px", borderRadius: 14,
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

            {/* Roast spectrum (4.1) — drag-across range, replaces the five
                exact chips. A single pick still surfaces adjacent roasts. */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 6 }}>
              <span style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.14em",
                textTransform: "uppercase", fontFamily: "Georgia, serif",
                flexShrink: 0, minWidth: 76, paddingTop: 6,
              }}>
                Roast Level
              </span>
              <RoastSpectrumFilter
                range={roastRange}
                onPick={pickRoast}
                onClear={() => setRoastRange(null)}
              />
            </div>

            {/* Process filter (4.3) — matches primary OR also; each chip's ⓘ
                opens the explainer in the shared BottomSheet. */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 9, color: COLORS.sub, letterSpacing: "0.14em",
                textTransform: "uppercase", fontFamily: "Georgia, serif",
                flexShrink: 0, minWidth: 76,
              }}>
                Process
              </span>
              {ALL_PROCESSES.map(process => {
                const active = processFilter.has(process);
                const pc = PROCESS_COLORS[process] ?? { border: COLORS.gridOuter };
                return (
                  <span
                    key={process}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      borderRadius: 14,
                      border: `1px solid ${active ? pc.border : COLORS.cardBorder}`,
                      background: active ? `${pc.border}22` : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <button
                      onClick={() => toggleProcess(process)}
                      className="tap-chip"
                      style={{
                        fontSize: TYPE.micro, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
                        padding: "6px 4px 6px 11px", border: "none", borderRadius: 14,
                        background: "transparent",
                        color: active ? "#F0DEB8" : COLORS.sub,
                        cursor: "pointer",
                      }}
                    >
                      {process}
                    </button>
                    {PROCESS_EXPLAINERS[process] && (
                      <button
                        onClick={() => setProcessInfo(process)}
                        aria-label={`What is ${process} processing?`}
                        className="tap-chip"
                        style={{
                          fontSize: TYPE.micro, fontFamily: "Georgia, serif",
                          padding: "6px 9px 6px 2px", border: "none",
                          background: "transparent",
                          color: active ? (pc.text ?? COLORS.label) : COLORS.sub,
                          cursor: "pointer", opacity: 0.85,
                        }}
                      >
                        ⓘ
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
            {/* Result count is always visible — at rest it advertises that
                filters exist; clear-all only appears when something is active. */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
              <span style={{
                fontSize: TYPE.micro, color: COLORS.sub, fontFamily: "Georgia, serif", fontStyle: "italic",
              }}>
                {filteredCoffees.length} of {coffees.length} origins
              </span>
              {anyFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="tap-chip"
                  style={{
                    fontSize: TYPE.micro, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
                    padding: "4px 11px", borderRadius: 12,
                    border: `1px solid ${COLORS.cardBorder}`,
                    background: "transparent", color: COLORS.sub,
                    cursor: "pointer", opacity: 0.75,
                  }}
                >
                  clear all
                </button>
              )}
              {/* Compare-mode toggle — selection happens where browsing does. */}
              <button
                onClick={toggleCompareMode}
                className="tap-chip"
                style={{
                  marginLeft: "auto",
                  fontSize: TYPE.micro, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
                  padding: "5px 13px", borderRadius: 14,
                  border: `1px solid ${compareMode ? SERIES_COLORS[0] : COLORS.cardBorder}`,
                  background: compareMode ? `${SERIES_COLORS[0]}22` : "transparent",
                  color: compareMode ? "#F0DEB8" : COLORS.sub,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {compareMode ? "✓ Comparing" : "Compare"}
              </button>
            </div>
            {compareMode && (
              <div style={{ fontSize: TYPE.micro, color: COLORS.label, fontStyle: "italic" }}>
                Tap up to 3 origins to compare.
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
                onDotClick={handleDotClick}
                onClosePopover={closePopover}
                onSelect={selectCoffee}
                compareMode={compareMode}
                selectIndex={selectIndexByName.has(coffee.name) ? selectIndexByName.get(coffee.name) : null}
                onToggleSelect={toggleSelect}
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

        {/* Compare (legacy two-dropdown tab) */}
        {view === "compare" && <CompareView />}

        {/* Compare Mode 2.0 — sticky-top screen for the select-from-cards flow */}
        {view === "compareScreen" && (
          selected.length >= 2 ? (
            <CompareScreen
              coffees={selected}
              onRemove={removeSelected}
              onClearAll={() => { clearSelection(); setView("cards"); }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.sub, fontStyle: "italic", fontSize: TYPE.small }}>
              Select at least two origins from the Origins view to compare.
            </div>
          )
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: 40,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{
            fontSize: TYPE.micro, color: COLORS.faint,
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

      {/* Selection bar — pinned to the thumb zone while comparing from cards. */}
      {compareMode && view === "cards" && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 200,
          background: "rgba(31,20,9,0.96)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          borderTop: `1px solid ${COLORS.gridOuter}55`,
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
            {selected.length === 0 ? (
              <span style={{ fontSize: TYPE.micro, color: COLORS.sub, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                Tap origins to add them here…
              </span>
            ) : (
              selected.map((c, idx) => (
                <span key={c.name} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: TYPE.micro, fontFamily: "Georgia, serif",
                  color: "#1A1008", background: SERIES_COLORS[idx],
                  borderRadius: 14, padding: "4px 6px 4px 10px",
                }}>
                  {c.name}
                  <button
                    onClick={() => removeSelected(c.name)}
                    aria-label={`Remove ${c.name}`}
                    className="tap-chip"
                    style={{
                      background: "rgba(26,16,8,0.25)", border: "none", borderRadius: "50%",
                      width: 16, height: 16, color: "#1A1008", fontSize: 12, lineHeight: 1,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >×</button>
                </span>
              ))
            )}
          </div>
          <button
            onClick={goToCompareScreen}
            disabled={selected.length < 2}
            className="tap-chip"
            style={{
              flexShrink: 0,
              fontSize: TYPE.small, fontFamily: "Georgia, serif", letterSpacing: "0.06em",
              padding: "8px 16px", borderRadius: 16,
              border: `1px solid ${selected.length >= 2 ? SERIES_COLORS[0] : COLORS.cardBorder}`,
              background: selected.length >= 2 ? `${SERIES_COLORS[0]}28` : "transparent",
              color: selected.length >= 2 ? "#F0DEB8" : COLORS.faint,
              cursor: selected.length >= 2 ? "pointer" : "not-allowed",
              opacity: selected.length >= 2 ? 1 : 0.6,
              transition: "all 0.15s",
            }}
          >
            Compare →
          </button>
        </div>
      )}

      {showMethodology && (
        <MethodologyModal onClose={() => setShowMethodology(false)} />
      )}

      {/* Process explainer (4.3) — reuses the shared BottomSheet primitive. */}
      {processInfo && (
        <BottomSheet
          onClose={() => setProcessInfo(null)}
          accent={`${PROCESS_COLORS[processInfo]?.border ?? COLORS.gridOuter}99`}
        >
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10,
          }}>
            <ProcessBadge process={processInfo} size="lg" />
            <button
              onClick={() => setProcessInfo(null)}
              aria-label="Close"
              style={{
                background: "none", border: "none",
                color: COLORS.sub, fontSize: 22, cursor: "pointer",
                lineHeight: 1, fontFamily: "Georgia, serif",
                width: 36, height: 36, marginRight: -8,
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "manipulation",
              }}
            >×</button>
          </div>
          <p style={{
            margin: 0, fontSize: TYPE.small, color: COLORS.label,
            fontStyle: "italic", lineHeight: 1.7, letterSpacing: "0.02em",
          }}>
            {PROCESS_EXPLAINERS[processInfo]}
          </p>
        </BottomSheet>
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
