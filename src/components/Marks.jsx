import {
  DIMS, DIM_ABBR, DIM_COLORS, DIM_INK, PROCESS_COLORS, ROAST_COLORS, ROAST_LEVELS, SPECIES_FLAG, ROMAN,
} from "../lib/constants";

// ─── ProcessMark — a map-legend square + the method, set in label caps ──────
export function ProcessMark({ process, size = "sm" }) {
  return (
    <span className={`mark mark--${size}`}>
      <span className="swatch" style={{ background: PROCESS_COLORS[process] ?? "var(--ink-mute)" }} aria-hidden="true" />
      {process}
    </span>
  );
}

// ─── SpeciesMark — Arabica is quiet; Robusta / Liberica are flagged ─────────
export function SpeciesMark({ species, size = "sm" }) {
  const flagged = SPECIES_FLAG[species];
  return (
    <span className={`mark mark--${size} ${flagged ? "mark--flag" : "mark--quiet"}`}
      title={flagged ? `${species} — a different coffee species from Arabica` : undefined}>
      {flagged && <span aria-hidden="true">✳︎ </span>}
      {species}
    </span>
  );
}

// ─── ScoreLedger — six figures with hairline bars ────────────────────────────
// Replaces the stacked score bars: denser, tabular, readable at a glance.
export function ScoreLedger({ scores, activeDim = null, size = "sm" }) {
  return (
    <dl className={`ledger ledger--${size}`}>
      {DIMS.map((d, i) => (
        <div
          key={d}
          className={`ledger__cell ${activeDim === i ? "is-active" : ""}`}
          style={{ "--c": DIM_INK[i], "--fill": DIM_COLORS[i] }}
        >
          <dt className="ledger__dim">
            <abbr title={d}>{size === "lg" ? d : DIM_ABBR[i]}</abbr>
          </dt>
          <dd className="ledger__val">
            {scores[i]}
            <span className="ledger__bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${scores[i] / 10})` }} />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ─── RoastBar — where this origin sits on the roast scale ───────────────────
export function RoastBar({ roast }) {
  const idx = ROAST_LEVELS.indexOf(roast);
  return (
    <div className="roastbar">
      <div className="roastbar__track" role="img" aria-label={`Suggested roast: ${roast}`}>
        {ROAST_LEVELS.map((lvl, i) => (
          <span
            key={lvl}
            className={`roastbar__seg ${i === idx ? "is-on" : ""}`}
            style={{ background: ROAST_COLORS[i] }}
          />
        ))}
      </div>
      <div className="roastbar__labels" aria-hidden="true">
        {ROAST_LEVELS.map((lvl, i) => (
          <span key={lvl} className={i === idx ? "is-on" : ""}>{lvl}</span>
        ))}
      </div>
    </div>
  );
}

// ─── RoastSpectrumFilter — tap levels to build a contiguous range ───────────
// A single pick still surfaces neighbours (roastInRange widens by ±1), so
// "Light" shows Light–Medium origins too.
export function RoastSpectrumFilter({ range, onPick, onClear }) {
  return (
    <div className="spectrum">
      <div className="spectrum__track" role="group" aria-label="Roast level range">
        {ROAST_LEVELS.map((lvl, i) => {
          const inRange = range != null && i >= range.lo && i <= range.hi;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={inRange}
              title={lvl}
              className={`spectrum__seg ${range == null ? "" : inRange ? "is-on" : "is-off"}`}
              style={{ background: ROAST_COLORS[i] }}
            >
              <span className="spectrum__label">{lvl}</span>
            </button>
          );
        })}
      </div>
      <div className="spectrum__foot">
        <span className="spectrum__hint">
          {range == null
            ? "Any roast"
            : `${ROAST_LEVELS[range.lo]}${range.hi !== range.lo ? ` – ${ROAST_LEVELS[range.hi]}` : ""}`}
        </span>
        {range != null && (
          <button type="button" className="textlink" onClick={onClear}>clear roast range</button>
        )}
      </div>
    </div>
  );
}

// ─── SectionHead — numbered section opener used by every view ────────────────
export function SectionHead({ index, title, dek, aside, variant = "" }) {
  return (
    <header className={`section-head ${variant}`}>
      <div className="section-head__num" aria-hidden="true">{ROMAN[index]}.</div>
      <div className="section-head__main">
        <h2 className="section-head__title">{title}</h2>
        {dek && <p className="section-head__dek">{dek}</p>}
      </div>
      {aside && <div className="section-head__aside">{aside}</div>}
    </header>
  );
}

// ─── Kicker — small label-caps heading for sub-sections ─────────────────────
export function Kicker({ children, className = "" }) {
  return <h3 className={`kicker ${className}`}>{children}</h3>;
}
