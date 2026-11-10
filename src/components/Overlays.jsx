import { DIMS, DIM_COLORS, DIM_INK, MQ } from "../lib/constants";
import { tagLabel } from "../lib/data";
import { useBodyScrollLock, useMediaQuery } from "../lib/hooks";

// ─── CloseButton ─────────────────────────────────────────────────────────────
// Drawn ×, 44px target. `label` adds a visible word for large overlays.
export function CloseButton({ onClick, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label="Close"
      className={`close-btn ${label ? "close-btn--labelled" : ""} ${className}`}
    >
      {label && <span className="close-btn__word">{label}</span>}
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </button>
  );
}

// ─── BottomSheet — the mobile interaction primitive ──────────────────────────
// One surface reused by radar-dot notes, the chip radar, heatmap taps, process
// explainers and the compare flavor sheet. Scroll-locked, safe-area aware,
// overscroll contained. `accent` colors the top rule.
export function BottomSheet({ onClose, accent = "var(--ink)", children, label = "Details" }) {
  useBodyScrollLock(true);
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={{ "--c": accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grip" aria-hidden="true" />
        {children}
      </div>
    </>
  );
}

// ─── Tag list — tags set as italic text, not pills ───────────────────────────
export function TagList({ tags, color }) {
  return (
    <p className="taglist" style={color ? { "--c": color } : undefined}>
      {tags.map((t, i) => (
        <span key={t} className="taglist__item">
          {tagLabel(t)}
          {i < tags.length - 1 && <span className="taglist__sep" aria-hidden="true"> · </span>}
        </span>
      ))}
    </p>
  );
}

// ─── HighlightBody — one origin × one dimension, the curated note ────────────
export function HighlightBody({ dimIndex, highlight, heading, score, onClose }) {
  return (
    <div className="note-slip" style={{ "--c": DIM_INK[dimIndex], "--fill": DIM_COLORS[dimIndex] }}>
      <div className="note-slip__head">
        <span className="note-slip__dim">
          <span className="swatch" style={{ background: DIM_COLORS[dimIndex] }} aria-hidden="true" />
          {heading ?? DIMS[dimIndex]}
          {score != null && <span className="note-slip__score">{score}<small>/10</small></span>}
        </span>
        {onClose && <CloseButton onClick={onClose} />}
      </div>
      {highlight ? (
        <>
          <TagList tags={highlight.tags} color={DIM_INK[dimIndex]} />
          <p className="note-slip__note">{highlight.note}</p>
        </>
      ) : (
        <p className="note-slip__note note-slip__note--quiet">
          Not a prominent characteristic for this origin.
        </p>
      )}
    </div>
  );
}

// ─── Popover — radar-dot note on a specimen (overlay on desktop, sheet on
// mobile) ───────────────────────────────────────────────────────────────────
export function Popover({ coffee, dimIndex, onClose }) {
  const isMobile = useMediaQuery(MQ.mobile);
  const body = (
    <HighlightBody
      dimIndex={dimIndex}
      highlight={coffee.highlights[dimIndex]}
      heading={isMobile ? `${coffee.name} · ${DIMS[dimIndex]}` : DIMS[dimIndex]}
      score={coffee.scores[dimIndex]}
      onClose={onClose}
    />
  );
  if (isMobile) {
    return <BottomSheet onClose={onClose} accent={DIM_COLORS[dimIndex]} label={`${coffee.name} ${DIMS[dimIndex]} note`}>{body}</BottomSheet>;
  }
  return (
    <div className="popover" onClick={(e) => e.stopPropagation()} style={{ "--c": DIM_COLORS[dimIndex] }}>
      {body}
    </div>
  );
}

// ─── Floating slip — desktop hover card anchored to a rect, clamped to view ──
export function FloatingSlip({ anchorRect, width = 240, approxHeight = 180, accent, children }) {
  const vw = document.documentElement.clientWidth;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top = spaceBelow > approxHeight + 12 ? anchorRect.bottom + 8 : anchorRect.top - approxHeight - 8;
  const rawLeft = anchorRect.left + anchorRect.width / 2 - width / 2;
  const left = Math.max(8, Math.min(rawLeft, vw - width - 8));
  return (
    <div className="slip slip--float" style={{ top, left, width, "--c": accent ?? "var(--ink)" }}>
      {children}
    </div>
  );
}
