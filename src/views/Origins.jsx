import { memo, useEffect, useRef, useState } from "react";
import { BREW_METHODS, DIMS, DIM_COLORS, DIM_INK, PROCESS_COLORS, PROCESS_EXPLAINERS, SERIES_COLORS, MQ } from "../lib/constants";
import { ALL_PROCESSES, ORIGIN_NO, dominantDim, pad2 } from "../lib/data";
import { placeOf } from "../lib/places";
import { RadarChart } from "../components/Radar";
import { Popover, TagList } from "../components/Overlays";
import { ProcessMark, ScoreLedger, SpeciesMark, RoastSpectrumFilter } from "../components/Marks";
import { useMediaQuery } from "../lib/hooks";

// ─── Specimen — one origin on the plate ─────────────────────────────────────
export const Specimen = memo(function Specimen({
  coffee, index, activePopoverDim, onDotClick, onClosePopover, onSelect,
  compareMode, selectIndex, onToggleSelect, featured, sortDim,
}) {
  // Entry animation runs only on first mount; the class self-removes.
  const [entering, setEntering] = useState(true);
  const isMobile = useMediaQuery(MQ.mobile);
  const selected = selectIndex != null;
  const dom = dominantDim(coffee);
  const place = placeOf(coffee.name);
  const no = ORIGIN_NO.get(coffee.name);

  const activate = () => {
    if (compareMode) onToggleSelect(coffee);
    else onSelect(coffee);
  };

  const cls = [
    "specimen",
    entering ? "is-entering" : "",
    featured ? "specimen--feature" : "",
    selected ? "is-selected" : "",
    compareMode ? "is-selecting" : "",
  ].join(" ");

  const radarSize = featured && !isMobile ? 236 : isMobile ? 132 : 176;

  return (
    <article
      className={cls}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      }}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget) setEntering(false); }}
      tabIndex={0}
      aria-label={compareMode
        ? `${coffee.name}${selected ? `, selected as ${selectIndex + 1}` : ""}. Toggle for comparison`
        : `${coffee.name}. Open dossier`}
      aria-pressed={compareMode ? selected : undefined}
      style={{
        "--tint": DIM_COLORS[dom],
        "--sel": selected ? SERIES_COLORS[selectIndex] : undefined,
        animationDelay: `${Math.min(index, 8) * 0.04}s`,
      }}
    >
      {selected && <span className="specimen__badge" aria-hidden="true">{selectIndex + 1}</span>}

      <header className="specimen__head">
        <span className="specimen__no">No. {pad2(no)}</span>
        <span className="specimen__region">{coffee.region}</span>
      </header>

      <div className="specimen__id">
        <h3 className="specimen__name">{coffee.name}</h3>
        {place && (
          <p className="specimen__place">
            {place.place} <span className="coord">{place.coord}</span>
          </p>
        )}
        <div className="specimen__marks">
          <ProcessMark process={coffee.processes.primary} />
          <SpeciesMark species={coffee.species} />
        </div>
      </div>

      <figure className="specimen__figure">
        <RadarChart
          scores={coffee.scores}
          size={radarSize}
          tint={DIM_COLORS[dom]}
          labels={isMobile ? "abbr" : "full"}
          name={coffee.name}
          onDotClick={(dimIndex) => onDotClick(coffee.name, dimIndex)}
          activeDim={activePopoverDim ?? sortDim}
        />
      </figure>

      <p className="specimen__note">{coffee.note}</p>

      {featured && sortDim != null && (
        <div className="specimen__lead" style={{ "--c": DIM_INK[sortDim] }}>
          <p className="specimen__lead-kicker">Leads the ranking in {DIMS[sortDim]}</p>
          {coffee.highlights[sortDim] && (
            <>
              <TagList tags={coffee.highlights[sortDim].tags} color={DIM_INK[sortDim]} />
              <p className="specimen__lead-note">{coffee.highlights[sortDim].note}</p>
            </>
          )}
        </div>
      )}

      <ScoreLedger scores={coffee.scores} activeDim={sortDim} />

      {activePopoverDim != null && (
        <Popover coffee={coffee} dimIndex={activePopoverDim} onClose={onClosePopover} />
      )}
    </article>
  );
});

// ─── FilterBar — sticky "refine" strip above the plate ──────────────────────
export function FilterBar({
  count, total,
  brewFilter, toggleBrew,
  roastRange, pickRoast, clearRoast,
  processFilter, toggleProcess, onProcessInfo,
  anyFilterActive, clearAll,
  compareMode, toggleCompareMode,
}) {
  const isTablet = useMediaQuery(MQ.tablet);
  // Open by default on desktop while the bar sits in the page; once it sticks
  // under the nav, the panel folds away so the plate keeps the viewport. It can
  // be reopened from the stuck bar, where it drops down over the plate.
  const [open, setOpen] = useState(!isTablet);
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    let raf = 0;
    let last = null;
    const check = () => {
      raf = 0;
      const isStuck = el.getBoundingClientRect().top < 52;
      if (isStuck === last) return;
      last = isStuck;
      setStuck(isStuck);
      setOpen(isStuck ? false : !window.matchMedia(MQ.tablet).matches);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  const activeCount = brewFilter.size + processFilter.size + (roastRange ? 1 : 0);

  return (
    <>
    <div ref={sentinel} className="filterbar__sentinel" aria-hidden="true" />
    <div className={`filterbar ${open ? "is-open" : ""} ${stuck ? "is-stuck" : ""}`}>
      <div className="filterbar__strip">
        <p className="filterbar__count" aria-live="polite">
          <strong>{count}</strong> of {total} origins
        </p>
        <button
          type="button"
          className="filterbar__toggle"
          aria-expanded={open}
          aria-controls="refine-panel"
          onClick={() => setOpen((o) => !o)}
        >
          Refine{activeCount > 0 ? ` (${activeCount})` : ""}
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
        </button>
        {anyFilterActive && (
          <button type="button" className="textlink" onClick={clearAll}>clear all</button>
        )}
        <button
          type="button"
          className={`filterbar__compare ${compareMode ? "is-on" : ""}`}
          aria-pressed={compareMode}
          onClick={toggleCompareMode}
        >
          <span className="filterbar__compare-box" aria-hidden="true">{compareMode ? "✓" : ""}</span>
          Compare
        </button>
      </div>

      {compareMode && (
        <p className="filterbar__hint">Tap up to three origins to set them side by side.</p>
      )}

      <div id="refine-panel" className="filterbar__panel" hidden={!open}>
        <fieldset className="facet facet--brew">
          <legend className="kicker">Brew method</legend>
          <div className="facet__options">
            {BREW_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={brewFilter.has(m)}
                className={`check ${brewFilter.has(m) ? "is-on" : ""}`}
                onClick={() => toggleBrew(m)}
              >
                <span className="check__box" aria-hidden="true" />
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="facet facet--roast">
          <legend className="kicker">Roast level</legend>
          <RoastSpectrumFilter range={roastRange} onPick={pickRoast} onClear={clearRoast} />
        </fieldset>

        <fieldset className="facet facet--process">
          <legend className="kicker">Process</legend>
          <div className="facet__options facet__options--list">
            {ALL_PROCESSES.map((p) => (
              <span key={p} className="facet__process">
                <button
                  type="button"
                  aria-pressed={processFilter.has(p)}
                  className={`check ${processFilter.has(p) ? "is-on" : ""}`}
                  style={{ "--c": PROCESS_COLORS[p] }}
                  onClick={() => toggleProcess(p)}
                >
                  <span className="check__box check__box--color" aria-hidden="true" />
                  {p}
                </button>
                {PROCESS_EXPLAINERS[p] && (
                  <button
                    type="button"
                    className="info-btn"
                    onClick={() => onProcessInfo(p)}
                    aria-label={`What is ${p} processing?`}
                  >
                    <span aria-hidden="true">i</span>
                  </button>
                )}
              </span>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
    </>
  );
}

// ─── SelectionBar — pinned to the thumb zone while comparing ────────────────
export function SelectionBar({ selected, onRemove, onCompare }) {
  const ready = selected.length >= 2;
  return (
    <div className="selbar" role="region" aria-label="Comparison selection">
      <div className="selbar__items">
        {selected.length === 0 ? (
          <span className="selbar__empty">Tap origins to add them here…</span>
        ) : (
          selected.map((c, idx) => (
            <span key={c.name} className="selbar__item" style={{ "--c": SERIES_COLORS[idx] }}>
              <span className="selbar__num">{idx + 1}</span>
              {c.name}
              <button type="button" onClick={() => onRemove(c.name)} aria-label={`Remove ${c.name}`} className="selbar__x">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
            </span>
          ))
        )}
      </div>
      <button type="button" className="selbar__go" onClick={onCompare} disabled={!ready}>
        Compare <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
