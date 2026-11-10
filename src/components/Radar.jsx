import { DIMS, DIM_ABBR, DIM_COLORS, DIM_INK, NUM, SERIES_DASH } from "../lib/constants";

// Polar → cartesian helper shared by both radars.
function polar(cx, cy) {
  return (i, r) => {
    const a = (2 * Math.PI * i) / NUM - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
}

function ring(toXY, values) {
  return values.map((v, i) => { const { x, y } = toXY(i, v); return `${x.toFixed(2)},${y.toFixed(2)}`; }).join(" ");
}

// ─── RadarChart — a flavor profile drawn as a small contoured hill ──────────
// The profile polygon is repeated at 100/75/50/25% toward the center like
// contour lines, each layer tinted with the origin's dominant dimension: a
// hypsometric tint. Vertex dots stay clickable (r=14 hit targets) and open the
// curated note for that dimension.
export function RadarChart({
  scores,
  size = 110,
  onDotClick,
  activeDim = null,
  tint = "#A0703F",
  labels = "full",       // "full" | "abbr" | "none"
  name,                  // used for accessible labels
}) {
  const cx = size / 2, cy = size / 2;
  const R = size * (labels === "none" ? 0.46 : 0.34);
  const toXY = polar(cx, cy);
  const interactive = typeof onDotClick === "function";
  const fontSize = size >= 240 ? 11 : size >= 150 ? 9.5 : 8.5;

  const outer = ring(toXY, Array(NUM).fill(R));
  const grid = [0.25, 0.5, 0.75].map((k) => ring(toXY, Array(NUM).fill(R * k)));
  const contours = [1, 0.75, 0.5, 0.25].map((k) => ring(toXY, scores.map((s) => (s / 10) * R * k)));
  const dots = scores.map((s, i) => toXY(i, (s / 10) * R));

  return (
    <svg
      className="radar"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={name ? `${name} flavor profile: ${DIMS.map((d, i) => `${d} ${scores[i]}`).join(", ")}` : undefined}
    >
      {/* Survey grid: hairline hexagon + dotted levels + spokes */}
      {grid.map((pts, i) => <polygon key={i} points={pts} className="radar__level" />)}
      <polygon points={outer} className="radar__frame" />
      {DIMS.map((_, i) => {
        const { x, y } = toXY(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar__spoke" />;
      })}

      {/* Contoured profile */}
      {contours.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          className={i === 0 ? "radar__profile" : "radar__contour"}
          style={{ fill: tint }}
        />
      ))}

      {/* Vertex dots */}
      {dots.map(({ x, y }, i) => {
        const isActive = activeDim === i;
        const dot = (
          <>
            <circle cx={x} cy={y} r={size >= 200 ? 7 : 6} className={isActive ? "radar__ring is-active" : "radar__ring"} style={{ stroke: DIM_COLORS[i] }} />
            <circle cx={x} cy={y} r={size >= 200 ? 3.6 : 3} className="radar__dot" style={{ fill: DIM_COLORS[i] }} />
          </>
        );
        if (!interactive) return <g key={i}>{dot}</g>;
        return (
          <g
            key={i}
            className="radar__hit"
            role="button"
            tabIndex={0}
            aria-label={`${DIMS[i]} ${scores[i]} of 10${name ? ` — ${name}` : ""}: read the tasting note`}
            onClick={(e) => { e.stopPropagation(); onDotClick(i); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onDotClick(i); }
            }}
          >
            {dot}
            <circle cx={x} cy={y} r={14} fill="transparent" />
          </g>
        );
      })}

      {/* Axis labels */}
      {labels !== "none" && DIMS.map((d, i) => {
        const { x, y } = toXY(i, R + (size >= 200 ? 18 : 13));
        return (
          <text
            key={d}
            x={x}
            y={y + fontSize * 0.36}
            textAnchor="middle"
            className="radar__label"
            style={{ fontSize, fill: activeDim === i ? DIM_INK[i] : undefined }}
          >
            {labels === "abbr" ? DIM_ABBR[i] : d}
          </text>
        );
      })}
    </svg>
  );
}

// ─── CompareRadar — 2–3 origins overlaid ─────────────────────────────────────
// Painter's algorithm (largest polygon first). Series are separated by stroke
// pattern as well as hue; overlaps multiply like inks on paper. Optional
// per-vertex hit circles open the multi-origin flavor sheet.
export function CompareRadar({ coffees, colors, size = 340, displayScores, onVertexTap }) {
  const cx = size / 2, cy = size / 2, R = size * 0.35;
  const toXY = polar(cx, cy);
  const scoresList = displayScores || coffees.map((c) => c.scores);
  const outer = ring(toXY, Array(NUM).fill(R));
  const grid = [0.25, 0.5, 0.75].map((k) => ring(toXY, Array(NUM).fill(R * k)));

  const order = coffees
    .map((_, i) => i)
    .sort((a, b) => {
      const sa = coffees[a].scores.reduce((s, v) => s + v, 0);
      const sb = coffees[b].scores.reduce((s, v) => s + v, 0);
      return sb - sa;
    });

  return (
    <svg className="radar radar--compare" viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`Comparison of ${coffees.map((c) => c.name).join(", ")}`}>
      {grid.map((pts, i) => <polygon key={i} points={pts} className="radar__level" />)}
      <polygon points={outer} className="radar__frame" />
      {DIMS.map((_, i) => {
        const { x, y } = toXY(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar__spoke" />;
      })}
      {/* Tick values on the Fruity spoke */}
      {[5, 10].map((v) => {
        const { x, y } = toXY(0, (v / 10) * R);
        return <text key={v} x={x + 5} y={y + 3} className="radar__tick">{v}</text>;
      })}
      <g className="radar__series">
        {order.map((ci) => (
          <polygon
            key={coffees[ci].name}
            points={ring(toXY, scoresList[ci].map((s) => (s / 10) * R))}
            style={{ fill: colors[ci], stroke: colors[ci] }}
            className="radar__series-shape"
            strokeDasharray={SERIES_DASH[ci] === "none" ? undefined : SERIES_DASH[ci]}
          />
        ))}
      </g>
      {DIMS.map((d, i) => {
        const { x, y } = toXY(i, R + 20);
        return (
          <text key={d} x={x} y={y + 4} textAnchor="middle" className="radar__label radar__label--lg"
            style={{ fill: DIM_INK[i] }}>
            {d}
          </text>
        );
      })}
      {onVertexTap && DIMS.map((d, i) => {
        const { x, y } = toXY(i, R);
        return (
          <g key={`hit-${i}`} className="radar__hit" role="button" tabIndex={0}
            aria-label={`Compare ${d} notes across origins`}
            onClick={(e) => { e.stopPropagation(); onVertexTap(i); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onVertexTap(i); } }}>
            <circle cx={x} cy={y} r={5} className="radar__vertex" style={{ stroke: DIM_COLORS[i] }} />
            <circle cx={x} cy={y} r={16} fill="transparent" />
          </g>
        );
      })}
    </svg>
  );
}

// Series key: a short stroke sample in the series color + dash pattern.
export function SeriesKey({ index, color, width = 28 }) {
  return (
    <svg width={width} height={10} aria-hidden="true" className="series-key">
      <line x1={0} y1={5} x2={width} y2={5} stroke={color} strokeWidth={2.5}
        strokeDasharray={SERIES_DASH[index] === "none" ? undefined : SERIES_DASH[index]} />
    </svg>
  );
}
