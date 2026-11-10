import { memo, useCallback, useState } from "react";
import { DIMS, DIM_ABBR, DIM_COLORS, DIM_INK, MQ } from "../lib/constants";
import { useMediaQuery } from "../lib/hooks";
import { BottomSheet, FloatingSlip, HighlightBody } from "../components/Overlays";

// One score cell owns its hover state so hovering never re-renders the grid.
const Cell = memo(function Cell({ coffee, dimIndex, score, onShow, onHide, onTap }) {
  return (
    <button
      type="button"
      className={`ledger-cell ${score >= 8 ? "is-high" : ""}`}
      style={{ "--fill": DIM_COLORS[dimIndex], "--a": (0.06 + (score / 10) * 0.62).toFixed(2) }}
      onMouseEnter={(e) => onShow(coffee, dimIndex, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={onHide}
      onFocus={(e) => onShow(coffee, dimIndex, e.currentTarget.getBoundingClientRect())}
      onBlur={onHide}
      onClick={() => onTap(coffee, dimIndex)}
      aria-label={`${coffee.name}, ${DIMS[dimIndex]} ${score}`}
    >
      {score}
    </button>
  );
});

const Row = memo(function Row({ coffee, onShow, onHide, onTap }) {
  return (
    <div className="ledger-row" role="row">
      <div className="ledger-row__name" role="rowheader">
        <span className="ledger-row__title">{coffee.name}</span>
        <span className="ledger-row__region">{coffee.region}</span>
        <span className="ledger-row__note">{coffee.note}</span>
      </div>
      {coffee.scores.map((score, i) => (
        <div role="cell" key={i} className="ledger-row__cell">
          <Cell coffee={coffee} dimIndex={i} score={score} onShow={onShow} onHide={onHide} onTap={onTap} />
        </div>
      ))}
    </div>
  );
});

export function HeatmapView({ coffees, sortDim, sortDir, onDimClick }) {
  const [tooltip, setTooltip] = useState(null);
  const [sheet, setSheet] = useState(null);
  const isMobile = useMediaQuery(MQ.mobile);

  const handleShow = useCallback((coffee, dimIndex, anchorRect) => setTooltip({ coffee, dimIndex, anchorRect }), []);
  const handleHide = useCallback(() => setTooltip(null), []);
  const handleTap = useCallback((coffee, dimIndex) => { setTooltip(null); setSheet({ coffee, dimIndex }); }, []);

  return (
    <div className="ledger-table" role="table" aria-label="Flavor scores for every origin">
      <div className="ledger-row ledger-row--head" role="row">
        <div className="ledger-row__name" role="columnheader">
          <span className="kicker">Origin</span>
        </div>
        {DIMS.map((d, i) => {
          const active = sortDim === i;
          const arrow = active ? (sortDir === "desc" ? "↓" : "↑") : "";
          return (
            <div role="columnheader" key={d} aria-sort={active ? (sortDir === "desc" ? "descending" : "ascending") : "none"}>
              <button
                type="button"
                className={`ledger-head ${active ? "is-active" : ""}`}
                style={{ "--c": DIM_INK[i], "--fill": DIM_COLORS[i] }}
                onClick={() => onDimClick(i)}
                title={`Sort by ${d}`}
              >
                <span className="ledger-head__full">{d}</span>
                <span className="ledger-head__abbr">{DIM_ABBR[i]}</span>
                <span className="ledger-head__arrow" aria-hidden="true">{arrow}</span>
              </button>
            </div>
          );
        })}
      </div>

      {coffees.map((coffee) => (
        <Row key={coffee.name} coffee={coffee} onShow={handleShow} onHide={handleHide} onTap={handleTap} />
      ))}

      {!isMobile && tooltip && !sheet && (
        <FloatingSlip anchorRect={tooltip.anchorRect} width={260} approxHeight={170} accent={DIM_COLORS[tooltip.dimIndex]}>
          <HighlightBody
            dimIndex={tooltip.dimIndex}
            highlight={tooltip.coffee.highlights[tooltip.dimIndex]}
            heading={`${tooltip.coffee.name} · ${DIMS[tooltip.dimIndex]}`}
            score={tooltip.coffee.scores[tooltip.dimIndex]}
          />
        </FloatingSlip>
      )}

      {sheet && (
        <BottomSheet onClose={() => setSheet(null)} accent={DIM_COLORS[sheet.dimIndex]} label={`${sheet.coffee.name} ${DIMS[sheet.dimIndex]}`}>
          <HighlightBody
            dimIndex={sheet.dimIndex}
            highlight={sheet.coffee.highlights[sheet.dimIndex]}
            heading={`${sheet.coffee.name} · ${DIMS[sheet.dimIndex]}`}
            score={sheet.coffee.scores[sheet.dimIndex]}
            onClose={() => setSheet(null)}
          />
        </BottomSheet>
      )}
    </div>
  );
}
