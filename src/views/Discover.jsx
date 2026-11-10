import { useMemo, useState } from "react";
import { coffees } from "../coffeeData";
import { DIMS, DIM_COLORS, DIM_DESCS, DIM_INK } from "../lib/constants";
import { TAG_INDEX, dominantDim, labelsOf, pad2 } from "../lib/data";
import { RadarChart } from "../components/Radar";
import { ProcessMark, SpeciesMark } from "../components/Marks";

const LABELS = new Map(coffees.map((c) => [c.name, labelsOf(c)]));

export function DiscoverView({ onSelectCoffee }) {
  const [selected, setSelected] = useState(new Set());

  function toggle(label) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  // Rank by the share of chosen labels each origin carries (each label counts
  // once, even when it appears under two dimensions).
  const scored = useMemo(() => coffees
    .map((coffee) => {
      const own = LABELS.get(coffee.name);
      const matches = [...selected].filter((t) => own.has(t));
      return { coffee, score: selected.size ? matches.length / selected.size : 0, matches };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.coffee.name.localeCompare(b.coffee.name)), [selected]);

  return (
    <div className="discover">
      <div className="discover__picker">
        {DIMS.map((dim, i) => (
          <section key={dim} className="pick-group" style={{ "--c": DIM_INK[i], "--fill": DIM_COLORS[i] }}>
            <h3 className="pick-group__head">
              <span className="pick-group__num">{pad2(i + 1)}</span>
              <span className="pick-group__name">{dim}</span>
              <span className="pick-group__desc">{DIM_DESCS[i]}</span>
            </h3>
            <div className="pick-group__tags">
              {TAG_INDEX[i].map(([label]) => {
                const on = selected.has(label);
                return (
                  <button key={label} type="button" aria-pressed={on}
                    className={`pick ${on ? "is-on" : ""}`} onClick={() => toggle(label)}>
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="discover__results" aria-live="polite">
        <div className="profile-card">
          <p className="kicker">Your profile</p>
          {selected.size === 0 ? (
            <p className="profile-card__empty">
              Select flavor tags to find matching origins.
            </p>
          ) : (
            <>
              <p className="profile-card__tags">
                {[...selected].map((t, i) => (
                  <span key={t}>
                    <button type="button" className="profile-card__tag" onClick={() => toggle(t)} aria-label={`Remove ${t}`}>
                      {t}<span aria-hidden="true"> ×</span>
                    </button>
                    {i < selected.size - 1 && <span aria-hidden="true">, </span>}
                  </span>
                ))}
              </p>
              <button type="button" className="textlink" onClick={() => setSelected(new Set())}>Clear all</button>
            </>
          )}
        </div>

        {selected.size > 0 && (
          <>
            <p className="results-count">
              {scored.length > 0
                ? `${scored.length} match${scored.length !== 1 ? "es" : ""}`
                : "No matches — try different tags"}
            </p>
            <ol className="results">
              {scored.map(({ coffee, score, matches }, rank) => {
                const dom = dominantDim(coffee);
                return (
                  <li key={coffee.name}>
                    <button type="button" className={`result ${rank === 0 ? "result--top" : ""}`} onClick={() => onSelectCoffee(coffee)}>
                      <span className="result__rank">{rank + 1}</span>
                      <span className="result__radar">
                        <RadarChart scores={coffee.scores} size={64} labels="none" tint={DIM_COLORS[dom]} />
                      </span>
                      <span className="result__body">
                        <span className="result__name">{coffee.name}</span>
                        <span className="result__meta">
                          {coffee.region} · <ProcessMark process={coffee.processes.primary} />
                          {coffee.species !== "Arabica" && <> · <SpeciesMark species={coffee.species} /></>}
                        </span>
                        <span className="result__match">
                          <span className="result__bar"><span style={{ transform: `scaleX(${score})` }} /></span>
                          <span className="result__pct">{Math.round(score * 100)}%</span>
                        </span>
                        <span className="result__tags">{matches.join(" · ")}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </aside>
    </div>
  );
}
