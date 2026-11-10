import { useEffect, useRef, useState } from "react";
import { coffees as ALL } from "../coffeeData";
import { DIMS, DIM_COLORS, DIM_INK, SERIES_COLORS, SERIES_DASH } from "../lib/constants";
import { COFFEE_BY_NAME, sortedCoffeeNames } from "../lib/data";
import { placeOf } from "../lib/places";
import { usePrefersReducedMotion } from "../lib/hooks";
import { CompareRadar, SeriesKey } from "../components/Radar";
import { BottomSheet, CloseButton, TagList } from "../components/Overlays";
import { ProcessMark, SpeciesMark } from "../components/Marks";

// Lerp the score vectors toward new targets (~350ms ease-out) in one rAF
// loop; snap under reduced motion or when the series count changes.
function useAnimatedScores(coffees) {
  const reduceMotion = usePrefersReducedMotion();
  const target = coffees.map((c) => c.scores);
  const [display, setDisplay] = useState(() => target.map((s) => s.slice()));
  const fromRef = useRef(display);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const sig = coffees.map((c) => c.name).join("|");

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const to = target;
    const from = fromRef.current;
    const sameShape = from.length === to.length && from.every((row, i) => row.length === to[i].length);
    if (reduceMotion || !sameShape) {
      fromRef.current = to.map((s) => s.slice());
      setDisplay(fromRef.current);
      return;
    }
    const DUR = 350;
    startRef.current = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / DUR);
      const k = ease(t);
      setDisplay(to.map((row, ci) => row.map((v, di) => from[ci][di] + (v - from[ci][di]) * k)));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to.map((s) => s.slice());
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, reduceMotion]);

  return display;
}

// One dimension, every compared origin's curated note, in its series color.
export function CompareFlavorSheet({ coffees, colors, dimIndex, onClose }) {
  return (
    <BottomSheet onClose={onClose} accent={DIM_COLORS[dimIndex]} label={`${DIMS[dimIndex]} across origins`}>
      <div className="note-slip__head">
        <span className="note-slip__dim" style={{ color: DIM_INK[dimIndex] }}>
          <span className="swatch" style={{ background: DIM_COLORS[dimIndex] }} />
          {DIMS[dimIndex]} · across {coffees.length} origins
        </span>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flavor-stack">
        {coffees.map((c, idx) => {
          const h = c.highlights[dimIndex];
          return (
            <div key={c.name} className="flavor-stack__item" style={{ "--c": colors[idx] }}>
              <p className="flavor-stack__name">
                <SeriesKey index={idx} color={colors[idx]} width={20} /> {c.name}
                <span className="flavor-stack__score">{c.scores[dimIndex]}/10</span>
              </p>
              {h ? (
                <>
                  <TagList tags={h.tags} />
                  <p className="note-slip__note">{h.note}</p>
                </>
              ) : (
                <p className="note-slip__note note-slip__note--quiet">Not a defining note for {c.name.split(" ")[0]}.</p>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// Grouped bars per dimension; the leader on each row is marked.
function ScoreTable({ coffees, colors, onDim }) {
  return (
    <div className="score-table">
      {DIMS.map((dim, i) => {
        const max = Math.max(...coffees.map((c) => c.scores[i]));
        return (
          <div key={dim} className="score-table__row">
            <button type="button" className="score-table__dim" style={{ "--c": DIM_INK[i] }}
              onClick={() => onDim(i)} title={`Compare ${dim} notes`}>
              {dim}
            </button>
            <div className="score-table__bars">
              {coffees.map((c, idx) => {
                const leads = c.scores[i] === max;
                return (
                  <div key={c.name} className="score-table__bar" style={{ "--c": colors[idx] }}>
                    <span className="score-table__who">{c.name.split(" ")[0]}</span>
                    <span className="score-table__track">
                      <span style={{ transform: `scaleX(${c.scores[i] / 10})` }} />
                    </span>
                    <span className="score-table__val">
                      {leads && <span className="score-table__lead" title="leads">▲</span>}
                      {c.scores[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OriginPanel({ c, color, index }) {
  const place = placeOf(c.name);
  return (
    <article className="panel" style={{ "--c": color }}>
      <p className="panel__key"><SeriesKey index={index} color={color} /> {c.region}</p>
      <h3 className="panel__name">{c.name}</h3>
      {place && <p className="panel__place">{place.place} <span className="coord">{place.coord}</span></p>}
      <p className="panel__marks">
        <ProcessMark process={c.processes.primary} />
        <SpeciesMark species={c.species} />
        <span className="mark mark--quiet">{c.roast} roast{c.scoredAt ? ` · scored at ${c.scoredAt}` : ""}</span>
      </p>
      {c.cultivars?.length > 0 && <p className="panel__cultivars">{c.cultivars.join(" / ")}</p>}
      <p className="panel__note">{c.note}</p>
    </article>
  );
}

// ─── CompareScreen — destination of the select-from-cards flow ──────────────
export function CompareScreen({ coffees, onRemove, onClearAll }) {
  const colors = coffees.map((_, i) => SERIES_COLORS[i]);
  const displayScores = useAnimatedScores(coffees);
  const [sheetDim, setSheetDim] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="compare-screen">
      <div className="compare-screen__pin">
        <CompareRadar coffees={coffees} colors={colors} size={300} displayScores={displayScores} onVertexTap={setSheetDim} />
        <ul className="legend">
          {coffees.map((c, idx) => (
            <li key={c.name} style={{ "--c": colors[idx] }}>
              <SeriesKey index={idx} color={colors[idx]} />
              <span className="legend__name">{c.name}</span>
              <button type="button" onClick={() => onRemove(c.name)} aria-label={`Remove ${c.name}`} className="legend__x">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
            </li>
          ))}
        </ul>
        <p className="caption">Tap a point to compare notes</p>
      </div>

      <div className="compare-screen__body">
        <ScoreTable coffees={coffees} colors={colors} onDim={setSheetDim} />
        <div className="panels">
          {coffees.map((c, idx) => <OriginPanel key={c.name} c={c} color={colors[idx]} index={idx} />)}
        </div>
        <div className="compare-screen__actions">
          <button type="button" className="btn" onClick={copyLink}>{copied ? "Link copied" : "Copy link to this comparison"}</button>
          <button type="button" className="textlink" onClick={onClearAll}>clear comparison</button>
        </div>
      </div>

      {sheetDim != null && (
        <CompareFlavorSheet coffees={coffees} colors={colors} dimIndex={sheetDim} onClose={() => setSheetDim(null)} />
      )}
    </div>
  );
}

// ─── CompareView — the two-dropdown tab, set as a sentence ──────────────────
export function CompareView() {
  const [nameA, setNameA] = useState(sortedCoffeeNames[0]);
  const [nameB, setNameB] = useState(sortedCoffeeNames[1]);
  const pair = [COFFEE_BY_NAME.get(nameA) ?? ALL[0], COFFEE_BY_NAME.get(nameB) ?? ALL[1]];
  const colors = [SERIES_COLORS[0], SERIES_COLORS[1]];
  const [sheetDim, setSheetDim] = useState(null);

  const Select = ({ value, onChange, idx, label }) => (
    <label className="sentence__field" style={{ "--c": colors[idx] }}>
      <span className="visually-hidden">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {sortedCoffeeNames.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <span className="sentence__rule" aria-hidden="true">
        <svg width="100%" height="4" preserveAspectRatio="none"><line x1="0" y1="2" x2="100%" y2="2" stroke={colors[idx]} strokeWidth="3"
          strokeDasharray={SERIES_DASH[idx] === "none" ? undefined : SERIES_DASH[idx]} /></svg>
      </span>
    </label>
  );

  return (
    <div className="compare">
      <p className="sentence">
        <span>Set</span>
        {Select({ value: nameA, onChange: setNameA, idx: 0, label: "First origin" })}
        <span>against</span>
        {Select({ value: nameB, onChange: setNameB, idx: 1, label: "Second origin" })}
      </p>

      <div className="compare__grid">
        <figure className="compare__figure">
          <CompareRadar coffees={pair} colors={colors} size={340} onVertexTap={setSheetDim} />
          <ul className="legend">
            {pair.map((c, idx) => (
              <li key={idx}><SeriesKey index={idx} color={colors[idx]} /><span className="legend__name">{c.name}</span></li>
            ))}
          </ul>
          <figcaption className="caption">Tap a point to compare notes</figcaption>
        </figure>
        <div>
          <ScoreTable coffees={pair} colors={colors} onDim={setSheetDim} />
        </div>
      </div>

      <div className="panels">
        {pair.map((c, idx) => <OriginPanel key={idx} c={c} color={colors[idx]} index={idx} />)}
      </div>

      {sheetDim != null && (
        <CompareFlavorSheet coffees={pair} colors={colors} dimIndex={sheetDim} onClose={() => setSheetDim(null)} />
      )}
    </div>
  );
}
