import { useMemo } from "react";
import { coffees } from "../coffeeData";
import { buildTerrain } from "../lib/terrain";
import { computeLabelPositions, pcaLabelText } from "../lib/data";

// Contour layer only — reused under the Flavor Map scatter and in the
// colophon band.
export function TerrainContours({ width, height, pad, className = "" }) {
  const terrain = useMemo(() => buildTerrain(width, height, { pad }), [width, height, pad]);
  return (
    <g className={`contours ${className}`} aria-hidden="true">
      {terrain.contours.map((c, i) => (
        <path key={i} d={c.d} className={c.index ? "contour contour--index" : "contour"} />
      ))}
    </g>
  );
}

// ─── HeroTerrain — the cover illustration ────────────────────────────────────
// Every origin is a summit, placed by PCA of its six scores.
// Labels are buttons into each origin's dossier.
export function HeroTerrain({ width = 1000, height = 640, pad = { x: 80, y: 70 }, labelled = true, onSelect }) {
  const terrain = useMemo(() => buildTerrain(width, height, { pad }), [width, height, pad]);
  const labels = useMemo(() => coffees.map((c) => pcaLabelText(c.name).toUpperCase()), []);
  const positions = useMemo(
    () => computeLabelPositions(
      terrain.peaks.map((p) => ({ cx: p.x, cy: p.y })),
      labels,
      { charW: 6.1, textH: 11, dotR: 8 },
    ),
    [terrain, labels],
  );

  return (
    <svg className="terrain" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
      role="img" aria-label="Topographic map of the 32 coffee origins, placed by flavor similarity">
      <g aria-hidden="true">
        {terrain.contours.map((c, i) => (
          <path key={i} d={c.d} className={c.index ? "contour contour--index" : "contour"} />
        ))}
      </g>
      {terrain.peaks.map((p, i) => {
        const coffee = coffees[i];
        const pos = positions[i];
        const open = () => onSelect?.(coffee);
        return (
          <g
            key={coffee.name}
            className="summit"
            role={labelled && onSelect ? "button" : undefined}
            tabIndex={labelled && onSelect ? 0 : undefined}
            aria-label={labelled ? `${coffee.name} — open dossier` : undefined}
            onClick={labelled ? open : undefined}
            onKeyDown={labelled ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } } : undefined}
          >
            <path d={`M${p.x} ${p.y - 4.5}L${p.x + 4.2} ${p.y + 3}L${p.x - 4.2} ${p.y + 3}Z`} className="summit__mark" />
            {labelled && (
              <>
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                <text x={pos.x} y={pos.y} textAnchor={pos.anchor} className="summit__label">
                  {labels[i]}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
