import { useMemo, useState } from "react";
import { coffees } from "../coffeeData";
import { DIMS, DIM_COLORS, PROCESS_COLORS, REGION_COLORS } from "../lib/constants";
import { PC1_LOAD, PC2_LOAD, PCA_UNIT, computeLabelPositions, pcAxisLabels, pcaLabelText } from "../lib/data";
import { TerrainContours } from "../components/Terrain";

const W = 780, H = 500, PAD = 60;

function MapTooltip({ coffee, x, y, color }) {
  const TW = 230, TH = 200;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const left = x + 16 + TW > vw - 8 ? x - TW - 16 : x + 16;
  const top = Math.max(8, Math.min(y - 24, vh - TH - 8));
  return (
    <div className="slip slip--float" style={{ left, top, width: TW, "--c": color }}>
      <p className="slip__title">{coffee.name}</p>
      <p className="slip__meta"><span className="swatch" style={{ background: color }} /> {coffee.region} · {coffee.processes.primary}</p>
      <p className="slip__note">{coffee.note}</p>
      <dl className="mini-bars">
        {DIMS.map((d, i) => (
          <div key={d} style={{ "--fill": DIM_COLORS[i] }}>
            <dt>{d}</dt>
            <dd><span style={{ transform: `scaleX(${coffee.scores[i] / 10})` }} /></dd>
            <dd className="mini-bars__n">{coffee.scores[i]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function FlavorMapView({ onSelectCoffee }) {
  const [showExplainer, setShowExplainer] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [colorBy, setColorBy] = useState("region");

  const pts = useMemo(() => PCA_UNIT.map(([u, v]) => ({
    cx: PAD + u * (W - 2 * PAD),
    cy: H - PAD - v * (H - 2 * PAD),
  })), []);
  const labels = useMemo(() => coffees.map((c) => pcaLabelText(c.name)), []);
  const labelPos = useMemo(() => computeLabelPositions(pts, labels, { charW: 4.9, textH: 9, dotR: 7.5 }), [pts, labels]);
  const ax1 = pcAxisLabels(PC1_LOAD);
  const ax2 = pcAxisLabels(PC2_LOAD);
  const colorOf = (c) => colorBy === "region"
    ? (REGION_COLORS[c.region] ?? "#6A604E")
    : (PROCESS_COLORS[c.processes.primary] ?? "#6A604E");

  return (
    <div className="mapview">
      <div className="mapview__controls">
        <div className="segmented" role="group" aria-label="Color points by">
          <span className="segmented__label">Color by</span>
          {["region", "process"].map((mode) => (
            <button key={mode} type="button" aria-pressed={colorBy === mode}
              className={colorBy === mode ? "is-on" : ""} onClick={() => setColorBy(mode)}>
              {mode === "region" ? "Region" : "Process"}
            </button>
          ))}
        </div>
        <button type="button" className={`textlink ${showExplainer ? "is-on" : ""}`}
          aria-expanded={showExplainer} onClick={() => setShowExplainer((v) => !v)}>
          {showExplainer ? "Hide the reading guide" : "How to read this map"}
        </button>
      </div>

      {showExplainer && (
        <aside className="explainer">
          <p>
            Every coffee in this dataset has six flavor scores — Fruity, Floral, Sweet, Nutty, Spicy, and Earthy.
            Comparing all six dimensions at once is hard to visualize, so this chart compresses them down to two
            directions that capture the most meaningful differences between the coffees.
          </p>
          <p>
            Think of it as a <em>flavor map</em>: coffees that land close together have similar overall profiles,
            while coffees far apart taste quite different. The exact position on any axis isn't the point — the{" "}
            <em>distances between coffees</em> are what matter. The contour lines trace the same thing as terrain:
            where several origins share a profile, their summits merge into a ridge.
          </p>
          <p>
            Use the <em>Color by</em> toggle to switch between coloring points by growing region or by processing
            method. When coffees of the same color cluster together, geography or process is driving that
            similarity — when they scatter, the origin is genuinely distinct from its peers.
          </p>
        </aside>
      )}

      <figure className="mapview__figure">
        <svg viewBox={`0 0 ${W} ${H}`} className="mapview__svg" role="img"
          aria-label="Flavor map: origins plotted by similarity of their six flavor scores">
          <TerrainContours width={W} height={H} pad={PAD} />
          <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} className="axis" />
          <line x1={W / 2} y1={PAD - 6} x2={W / 2} y2={H - PAD + 6} className="axis" />
          <text x={W - PAD + 8} y={H / 2 + 4} textAnchor="start" className="axis-label">{ax1.pos} →</text>
          <text x={PAD - 8} y={H / 2 + 4} textAnchor="end" className="axis-label">← {ax1.neg}</text>
          <text x={W / 2} y={PAD - 16} textAnchor="middle" className="axis-label">↑ {ax2.pos}</text>
          <text x={W / 2} y={H - PAD + 22} textAnchor="middle" className="axis-label">↓ {ax2.neg}</text>

          {pts.map((pt, i) => {
            const coffee = coffees[i];
            const fill = colorOf(coffee);
            const hot = tooltip?.coffee === coffee;
            return (
              <g
                key={coffee.name}
                className={`map-point ${hot ? "is-hot" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`${coffee.name}, ${coffee.region} — open dossier`}
                onMouseEnter={(e) => setTooltip({ coffee, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t))}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => { setTooltip(null); onSelectCoffee(coffee); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectCoffee(coffee); } }}
              >
                <circle cx={pt.cx} cy={pt.cy} r={12} fill="transparent" />
                <circle cx={pt.cx} cy={pt.cy} r={hot ? 6.5 : 5} style={{ fill }} className="map-point__dot" />
                <text x={labelPos[i].x} y={labelPos[i].y} textAnchor={labelPos[i].anchor} className="map-point__label">
                  {labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="caption">
          <span className="caption__fig">Fig. 4</span> Principal components of the six scores. Hover a point for its
          profile; select it to open the dossier.
        </figcaption>
      </figure>

      {tooltip && <MapTooltip coffee={tooltip.coffee} x={tooltip.x} y={tooltip.y} color={colorOf(tooltip.coffee)} />}

      <ul className="keylist" aria-label={colorBy === "region" ? "Regions" : "Processes"}>
        {Object.entries(colorBy === "region" ? REGION_COLORS : PROCESS_COLORS).map(([label, color]) => (
          <li key={label}><span className="swatch" style={{ background: color }} />{label}</li>
        ))}
      </ul>
    </div>
  );
}
