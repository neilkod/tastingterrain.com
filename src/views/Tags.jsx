import { useEffect, useState } from "react";
import { DIMS, DIM_COLORS, DIM_DESCS, DIM_INK, MQ, PROCESS_COLORS, PROCESS_EXPLAINERS } from "../lib/constants";
import { PROCESS_INDEX, TAG_INDEX, dominantDim, pad2 } from "../lib/data";
import { useMediaQuery } from "../lib/hooks";
import { RadarChart } from "../components/Radar";
import { BottomSheet, CloseButton, FloatingSlip } from "../components/Overlays";

function ChipRadar({ coffee }) {
  return (
    <div className="chip-radar">
      <p className="chip-radar__region">{coffee.region}</p>
      <p className="chip-radar__name">{coffee.name}</p>
      <RadarChart scores={coffee.scores} size={150} tint={DIM_COLORS[dominantDim(coffee)]} labels="abbr" />
      <p className="chip-radar__note">{coffee.note}</p>
    </div>
  );
}

// Inline origin names in an index entry: hover (desktop) or tap (mobile)
// reveals the origin's radar.
function OriginRefs({ list, activeName, onEnter, onLeave, onTap }) {
  return list.map((c, i) => (
    <span key={c.name}>
      <button
        type="button"
        className={`ref ${activeName === c.name ? "is-on" : ""}`}
        onMouseEnter={(e) => onEnter(e, c)}
        onMouseLeave={onLeave}
        onFocus={(e) => onEnter(e, c)}
        onBlur={onLeave}
        onClick={(e) => onTap(e, c)}
      >
        {c.name}
      </button>
      {i < list.length - 1 && <span className="ref__sep">, </span>}
    </span>
  ));
}

export function TagsView() {
  const [active, setActive] = useState(null); // { coffee, anchorRect }
  const isMobile = useMediaQuery(MQ.mobile);

  useEffect(() => {
    if (!active) return;
    function onDocClick() { setActive(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [active]);

  const onEnter = (e, coffee) => {
    if (!isMobile) setActive({ coffee, anchorRect: e.currentTarget.getBoundingClientRect() });
  };
  const onLeave = () => { if (!isMobile) setActive(null); };
  const onTap = (e, coffee) => {
    e.stopPropagation();
    if (isMobile) {
      setActive((prev) => (prev?.coffee.name === coffee.name ? null : { coffee, anchorRect: e.currentTarget.getBoundingClientRect() }));
    }
  };
  const refProps = { activeName: active?.coffee.name, onEnter, onLeave, onTap };

  return (
    <div className="index">
      {/* Glossary of processing methods */}
      <section className="glossary">
        <h3 className="index__head">
          <span className="index__head-name">Processing methods</span>
          <span className="index__head-desc">how the cherry is prepared after harvest</span>
        </h3>
        <dl className="glossary__list">
          {PROCESS_INDEX.map(([process, list]) => (
            <div key={process} className="glossary__entry">
              <dt className="glossary__term">
                <span className="swatch swatch--lg" style={{ background: PROCESS_COLORS[process] ?? "var(--ink-mute)" }} aria-hidden="true" />
                {process}
                <span className="glossary__count">{list.length} origin{list.length !== 1 ? "s" : ""}</span>
              </dt>
              {PROCESS_EXPLAINERS[process] && <dd className="glossary__def">{PROCESS_EXPLAINERS[process]}</dd>}
              <dd className="glossary__refs"><OriginRefs list={list} {...refProps} /></dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Back-of-book flavor index, by dimension */}
      {DIMS.map((dim, i) => (
        <section key={dim} className="index__dim" style={{ "--c": DIM_INK[i], "--fill": DIM_COLORS[i] }}>
          <h3 className="index__head">
            <span className="index__head-num">{pad2(i + 1)}</span>
            <span className="index__head-name">{dim}</span>
            <span className="index__head-desc">{DIM_DESCS[i]}</span>
          </h3>
          <dl className="index__entries">
            {TAG_INDEX[i].map(([label, list]) => (
              <div key={label} className="index__entry">
                <dt className="index__term">{label}</dt>
                <dd className="index__refs"><OriginRefs list={list} {...refProps} /></dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {active && (isMobile ? (
        <BottomSheet onClose={() => setActive(null)} label={active.coffee.name}>
          <div className="sheet__close-row"><CloseButton onClick={() => setActive(null)} /></div>
          <ChipRadar coffee={active.coffee} />
        </BottomSheet>
      ) : (
        <FloatingSlip anchorRect={active.anchorRect} width={210} approxHeight={280}>
          <ChipRadar coffee={active.coffee} />
        </FloatingSlip>
      ))}
    </div>
  );
}
