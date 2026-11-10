import { useEffect, useRef, useState } from "react";
import { coffees } from "../coffeeData";
import { DIMS, DIM_COLORS, DIM_DESCS, DIM_INK, DIM_METHOD, PROCESS_COLORS, PROCESS_EXPLAINERS } from "../lib/constants";
import { ORIGIN_NO, dominantDim, getSimilar, pad2 } from "../lib/data";
import { placeOf } from "../lib/places";
import { useBodyScrollLock, useEscape } from "../lib/hooks";
import { RadarChart } from "../components/Radar";
import { CloseButton, TagList } from "../components/Overlays";
import { Kicker, ProcessMark, RoastBar, ScoreLedger, SpeciesMark } from "../components/Marks";

// ─── Origin dossier — the detail "page" for one origin ──────────────────────
export function Dossier({ coffee, onClose, onSelect }) {
  // Explainer open-state is keyed to the origin, so it resets on navigation.
  const [explainerFor, setExplainerFor] = useState(null);
  const showExplainer = explainerFor === coffee.name;
  const scrollRef = useRef(null);
  useBodyScrollLock(true);
  useEscape(onClose);

  // Navigating to a similar origin resets scroll and the explainer.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    scrollRef.current?.focus();
  }, [coffee]);

  const dom = dominantDim(coffee);
  const place = placeOf(coffee.name);
  const similar = getSimilar(coffee);
  const highlights = coffee.highlights.map((h, i) => ({ h, i })).filter(({ h }) => h != null);
  const explainer = PROCESS_EXPLAINERS[coffee.processes.primary];

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dossier"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        ref={scrollRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ "--tint": DIM_COLORS[dom] }}
      >
        <div className="dossier__bar">
          <span className="dossier__no">Origin dossier · No. {pad2(ORIGIN_NO.get(coffee.name))} of {coffees.length}</span>
          <CloseButton onClick={onClose} label="Close" />
        </div>

        <header className="dossier__head">
          <p className="dossier__over">
            <span>{coffee.region}</span>
            {place && <><span>{place.place}</span><span className="coord">{place.coord}</span></>}
          </p>
          <h2 id="dossier-title" className="dossier__name">{coffee.name}</h2>
          <p className="dossier__dek">{coffee.note}</p>
          <p className="dossier__marks">
            <ProcessMark process={coffee.processes.primary} size="lg" />
            <SpeciesMark species={coffee.species} size="lg" />
            <span className="mark mark--lg mark--quiet">{coffee.roast} roast</span>
          </p>
        </header>

        <div className="dossier__body">
          <aside className="dossier__figure">
            <div className="dossier__figure-inner">
              <RadarChart scores={coffee.scores} size={300} tint={DIM_COLORS[dom]} name={coffee.name} />
              <ScoreLedger scores={coffee.scores} size="lg" />
              <p className="caption">
                <span className="caption__fig">Fig.</span> Profile at {coffee.scoredAt ? coffee.scoredAt.toLowerCase() : "light-to-medium"} roast,
                scored 1–10. Contours step down in quarters toward the center.
              </p>
            </div>
          </aside>

          <div className="dossier__text">
            <section className="dossier__section">
              <Kicker>Flavor breakdown</Kicker>
              {highlights.map(({ h, i }) => (
                <div key={i} className="breakdown" style={{ "--c": DIM_INK[i], "--fill": DIM_COLORS[i] }}>
                  <p className="breakdown__head">
                    <span className="breakdown__num">{pad2(i + 1)}</span>
                    <span className="breakdown__dim">{DIMS[i]}</span>
                    <span className="breakdown__score">{coffee.scores[i]}<small>/10</small></span>
                    <span className="breakdown__desc">{DIM_DESCS[i]}</span>
                  </p>
                  <TagList tags={h.tags} color={DIM_INK[i]} />
                  <p className="breakdown__note">{h.note}</p>
                </div>
              ))}
            </section>

            <section className="dossier__section dossier__facts">
              <div className="fact">
                <Kicker>Suggested roast</Kicker>
                <RoastBar roast={coffee.roast} />
                {coffee.scoredAt && (
                  <p className="fact__aside">
                    Scored at: {coffee.scoredAt} roast — this origin is traditionally enjoyed at a darker roast,
                    and its scores reflect that cup.
                  </p>
                )}
              </div>

              <div className="fact">
                <Kicker>Processing method</Kicker>
                <p className="fact__value">
                  <span className="swatch swatch--lg" style={{ background: PROCESS_COLORS[coffee.processes.primary] }} />
                  {coffee.processes.primary}
                  {explainer && (
                    <button type="button" className="textlink" aria-expanded={showExplainer}
                      onClick={() => setExplainerFor(showExplainer ? null : coffee.name)}>
                      {showExplainer ? "hide" : "what does this mean?"}
                    </button>
                  )}
                </p>
                {coffee.processes.also.length > 0 && (
                  <p className="fact__aside">also commonly: {coffee.processes.also.join(", ")}</p>
                )}
                {showExplainer && explainer && (
                  <p className="fact__explainer" style={{ "--c": PROCESS_COLORS[coffee.processes.primary] }}>{explainer}</p>
                )}
              </div>

              {coffee.cultivars?.length > 0 && (
                <div className="fact">
                  <Kicker>Cultivars</Kicker>
                  <p className="fact__list">{coffee.cultivars.join(" / ")}</p>
                </div>
              )}

              <div className="fact">
                <Kicker>Recommended brews</Kicker>
                <p className="fact__list">{coffee.brewMethods.join(" / ")}</p>
              </div>
            </section>

            <section className="dossier__section">
              <Kicker>Similar origins</Kicker>
              <p className="dossier__small">The three nearest profiles across all six dimensions.</p>
              <ul className="similar">
                {similar.map((c) => (
                  <li key={c.name}>
                    <button type="button" className="similar__item" onClick={() => onSelect(c)}>
                      <RadarChart scores={c.scores} size={84} labels="none" tint={DIM_COLORS[dominantDim(c)]} />
                      <span className="similar__name">{c.name}</span>
                      <span className="similar__note">{c.note}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Methodology ────────────────────────────────────────────────────────────
export function Methodology({ onClose }) {
  useBodyScrollLock(true);
  useEscape(onClose);
  return (
    <div className="overlay overlay--center" onClick={onClose}>
      <div className="article-slip" role="dialog" aria-modal="true" aria-labelledby="method-title" onClick={(e) => e.stopPropagation()}>
        <div className="article-slip__bar">
          <span className="kicker">Scoring methodology</span>
          <CloseButton onClick={onClose} />
        </div>
        <h2 id="method-title" className="article-slip__title">How scores are assigned</h2>
        <p className="article-slip__lede">
          Each origin is scored 1–10 across six flavor dimensions based on commonly cited tasting notes for that
          region at a <em>light-to-medium roast level</em>. Scores represent illustrative averages across the most
          typical varietals and processing methods for each origin — individual lots vary significantly with
          altitude, harvest year, and producer. Natural and honey-processed lots tend to score higher on Fruity and
          Sweet; washed lots tend toward cleaner Floral and brighter acidity. A handful of origins are traditionally
          roasted darker than this baseline — Vietnamese, Sumatran, Brazilian, Indian Monsoon, Sulawesi Toraja, and
          Filipino Barako among them — and their scores reflect that darker cup. Where that is the case, the
          origin's detail panel notes the roast it was scored at.
        </p>
        <ol className="method-list">
          {DIMS.map((dim, i) => (
            <li key={dim} style={{ "--c": DIM_INK[i], "--fill": DIM_COLORS[i] }}>
              <p className="method-list__head">
                <span className="breakdown__num">{pad2(i + 1)}</span>
                <span className="breakdown__dim">{dim}</span>
                <span className="breakdown__desc">{DIM_DESCS[i]}</span>
              </p>
              <p>{DIM_METHOD[i]}</p>
            </li>
          ))}
        </ol>
        <p className="article-slip__note">
          Coordinates mark an approximate center of each origin's principal growing district, for orientation only.
        </p>
        <p className="article-slip__note">
          Scores are illustrative and educational — not the result of controlled sensory analysis.
        </p>
      </div>
    </div>
  );
}
