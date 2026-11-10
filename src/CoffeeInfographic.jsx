import { useState, useEffect, useCallback, useRef } from "react";
import { coffees } from "./coffeeData";
import { DIMS, DIM_COLORS, DIM_DESCS, MQ, PROCESS_COLORS, PROCESS_EXPLAINERS } from "./lib/constants";
import {
  originHasProcess, pad2, readCompareFromURL, roastInRange, writeCompareToURL,
} from "./lib/data";
import { useMediaQuery } from "./lib/hooks";
import { HeroTerrain } from "./components/Terrain";
import { TerrainContours } from "./components/Terrain";
import { BottomSheet, CloseButton } from "./components/Overlays";
import { SectionHead } from "./components/Marks";
import { FilterBar, SelectionBar, Specimen } from "./views/Origins";
import { HeatmapView } from "./views/Heatmap";
import { FlavorMapView } from "./views/FlavorMap";
import { DiscoverView } from "./views/Discover";
import { TagsView } from "./views/Tags";
import { CompareScreen, CompareView } from "./views/Compare";
import { Dossier, Methodology } from "./views/Dossier";

const VIEWS = [
  { key: "cards",    label: "Origins" },
  { key: "compare",  label: "Compare" },
  { key: "heatmap",  label: "Heatmap" },
  { key: "map",      label: "Flavor Map" },
  { key: "discover", label: "Discover" },
  { key: "tags",     label: "Tags" },
];

const SECTION_COPY = {
  cards: {
    title: "Origins",
  },
  compare: {
    title: "Compare",
  },
  compareScreen: {
    title: "Comparison",
  },
  heatmap: {
    title: "Heatmap",
  },
  map: {
    title: "Flavor Map",
  },
  discover: {
    title: "Discover",
  },
  tags: {
    title: "Tags",
  },
};

// ─── Masthead ───────────────────────────────────────────────────────────────
function Masthead({ onMethodology }) {
  return (
    <div className="masthead">
      <p className="wordmark" aria-label="Tasting Terrain">
        <span className="wordmark__a">Tasting</span> <span className="wordmark__b">Terrain</span>
      </p>
      <p className="masthead__mid">A comparative tasting guide</p>
      <p className="masthead__end">
        <button type="button" className="masthead__link" onClick={onMethodology}>Methodology</button>
      </p>
    </div>
  );
}

// ─── Hero — title + the flavor terrain ─────────────────────────────────────
function Hero({ onMethodology, onSelect }) {
  const isTablet = useMediaQuery(MQ.tablet);
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__text">
        <h1 id="hero-title" className="hero__title">
          Coffees <em>of the</em> World
        </h1>
        <p className="hero__dek">
          Light-to-medium roast reference
        </p>
        <p className="hero__meta">
          <button type="button" className="textlink" onClick={onMethodology}>How scores are assigned</button>
        </p>
      </div>
      <figure className="hero__map">
        {isTablet
          ? <HeroTerrain width={640} height={460} pad={{ x: 40, y: 40 }} labelled={false} />
          : <HeroTerrain width={1000} height={640} pad={{ x: 90, y: 70 }} onSelect={onSelect} />}
        <figcaption className="caption">
          Closer peaks taste alike. Number = total score.
        </figcaption>
      </figure>
    </section>
  );
}

// ─── Dimension band — the legend, and the sort control ─────────────────────
function DimensionBand({ sortDim, sortDir, onDimClick }) {
  return (
    <section className="dims" aria-labelledby="dims-title">
      <div className="dims__intro">
        <h2 id="dims-title" className="dims__title">Flavor families</h2>
        <p className="dims__how">
          Click to sort
        </p>
      </div>
      <ol className="dims__list">
        {DIMS.map((d, i) => {
          const active = sortDim === i;
          return (
            <li key={d}>
              <button
                type="button"
                className={`dim ${active ? "is-active" : ""} ${sortDim != null && !active ? "is-dim" : ""}`}
                style={{ "--fill": DIM_COLORS[i] }}
                aria-pressed={active}
                onClick={() => onDimClick(i)}
              >
                <span className="dim__num">{pad2(i + 1)}</span>
                <span className="dim__name">
                  {d}
                  {active && <span className="dim__arrow" aria-label={sortDir === "desc" ? "high to low" : "low to high"}>{sortDir === "desc" ? " ↓" : " ↑"}</span>}
                </span>
                <span className="dim__desc">{DIM_DESCS[i]}</span>
                <span className="dim__rule" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ─── Colophon ───────────────────────────────────────────────────────────────
function Colophon({ onMethodology }) {
  return (
    <footer className="colophon">
      <svg className="colophon__contours" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <TerrainContours width={1200} height={420} pad={{ x: 120, y: 40 }} />
      </svg>
      <div className="colophon__inner">
        <p className="colophon__mark">
          <span className="wordmark__a">Tasting</span> <span className="wordmark__b">Terrain</span>
        </p>
        <div className="colophon__cols">
          <div>
            <p className="kicker">About the scores</p>
            <p>Scores are illustrative averages across origins and processing methods.</p>
            <button type="button" className="textlink" onClick={onMethodology}>Read the methodology</button>
          </div>
          <div>
            <p className="kicker">Made by</p>
            <p>Made with ☕ by @neilkod</p>
            <p className="colophon__links">
              <a href="mailto:nkodner@gmail.com">nkodner@gmail.com</a>
              <a href="https://github.com/neilkod/tastingterrain.com" target="_blank" rel="noreferrer">GitHub</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────
export default function CoffeeInfographic() {
  const [initialCompare] = useState(readCompareFromURL);
  const [sortDim, setSortDim] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [view, setView] = useState(initialCompare.length >= 2 ? "compareScreen" : "cards");
  const [showMethodology, setShowMethodology] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [brewFilter, setBrewFilter] = useState(new Set());
  const [roastRange, setRoastRange] = useState(null);
  const [processFilter, setProcessFilter] = useState(new Set());
  const [processInfo, setProcessInfo] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState(initialCompare);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (view === "compareScreen" || selected.length > 0) writeCompareToURL(selected);
  }, [selected, view]);

  // Changing view while scrolled past the nav brings the new section's top
  // into view instead of leaving the reader mid-page.
  const goTo = useCallback((key) => {
    setView(key);
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 1;
    if (window.scrollY > top) window.scrollTo({ top });
  }, []);

  const toggleSelect = useCallback((coffee) => {
    setSelected((prev) => {
      if (prev.some((c) => c.name === coffee.name)) return prev.filter((c) => c.name !== coffee.name);
      if (prev.length >= 3) return prev;
      return [...prev, coffee];
    });
  }, []);
  const removeSelected = useCallback((name) => setSelected((prev) => prev.filter((c) => c.name !== name)), []);
  const clearSelection = useCallback(() => { setSelected([]); writeCompareToURL([]); }, []);
  const goToCompareScreen = useCallback(() => { if (selected.length >= 2) goTo("compareScreen"); }, [selected.length, goTo]);
  const toggleCompareMode = useCallback(() => {
    setCompareMode((prev) => { if (prev) setSelected([]); return !prev; });
  }, []);

  function handleDimClick(i) {
    if (sortDim === i) {
      if (sortDir === "desc") setSortDir("asc");
      else { setSortDim(null); setSortDir("desc"); }
    } else {
      setSortDim(i);
      setSortDir("desc");
    }
  }

  const handleDotClick = useCallback((coffeeName, dimIndex) => {
    setActivePopover((prev) =>
      prev?.coffeeName === coffeeName && prev?.dimIndex === dimIndex ? null : { coffeeName, dimIndex });
  }, []);
  const closePopover = useCallback(() => setActivePopover(null), []);
  const selectCoffee = useCallback((c) => setSelectedCoffee(c), []);
  const closeDossier = useCallback(() => setSelectedCoffee(null), []);
  const closeMethodology = useCallback(() => setShowMethodology(false), []);

  useEffect(() => {
    if (!activePopover) return;
    function onDocClick() { setActivePopover(null); }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [activePopover]);

  const sortedCoffees = sortDim === null
    ? coffees.slice().sort((a, b) => a.name.localeCompare(b.name))
    : coffees.slice().sort((a, b) => (sortDir === "desc"
      ? b.scores[sortDim] - a.scores[sortDim]
      : a.scores[sortDim] - b.scores[sortDim]));

  const filteredCoffees = sortedCoffees.filter((c) =>
    (brewFilter.size === 0 || c.brewMethods.some((m) => brewFilter.has(m))) &&
    roastInRange(c.roast, roastRange) &&
    (processFilter.size === 0 || Array.from(processFilter).some((p) => originHasProcess(c, p))));

  function toggleBrew(method) {
    setBrewFilter((prev) => { const n = new Set(prev); n.has(method) ? n.delete(method) : n.add(method); return n; });
  }
  function pickRoast(idx) {
    setRoastRange((prev) => {
      if (prev == null) return { lo: idx, hi: idx };
      if (prev.lo === idx && prev.hi === idx) return null;
      return { lo: Math.min(prev.lo, idx), hi: Math.max(prev.hi, idx) };
    });
  }
  function toggleProcess(process) {
    setProcessFilter((prev) => { const n = new Set(prev); n.has(process) ? n.delete(process) : n.add(process); return n; });
  }
  function clearAllFilters() {
    setBrewFilter(new Set());
    setRoastRange(null);
    setProcessFilter(new Set());
  }
  const anyFilterActive = brewFilter.size > 0 || roastRange != null || processFilter.size > 0;
  const selectIndexByName = new Map(selected.map((c, i) => [c.name, i]));
  const copy = SECTION_COPY[view];
  const featureFirst = sortDim != null && !compareMode;

  return (
    <>
      <a className="skip-link" href="#main">Skip to the guide</a>
      <div className="page">
        <Masthead onMethodology={() => setShowMethodology(true)} />
        <Hero onMethodology={() => setShowMethodology(true)} onSelect={selectCoffee} />
        <DimensionBand sortDim={sortDim} sortDir={sortDir} onDimClick={handleDimClick} />

        {/* In-flow anchor: the sticky nav's own position moves while stuck. */}
        <div ref={sectionRef} aria-hidden="true" />
        <nav className="sections" aria-label="Sections">
          <ul className="sections__list">
            {VIEWS.map(({ key, label }) => (
              <li key={key}>
                <button
                  type="button"
                  className={`sections__tab ${view === key ? "is-active" : ""}`}
                  aria-current={view === key ? "page" : undefined}
                  onClick={() => goTo(key)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className={`main main--${view}`}>
          <SectionHead
            title={copy.title}
          />

          {view === "cards" && (
            <>
              <FilterBar
                count={filteredCoffees.length}
                total={coffees.length}
                brewFilter={brewFilter}
                toggleBrew={toggleBrew}
                roastRange={roastRange}
                pickRoast={pickRoast}
                clearRoast={() => setRoastRange(null)}
                processFilter={processFilter}
                toggleProcess={toggleProcess}
                onProcessInfo={setProcessInfo}
                anyFilterActive={anyFilterActive}
                clearAll={clearAllFilters}
                compareMode={compareMode}
                toggleCompareMode={toggleCompareMode}
              />
              {filteredCoffees.length === 0 ? (
                <p className="empty">No origins match these filters. <button type="button" className="textlink" onClick={clearAllFilters}>Clear all</button></p>
              ) : (
                <div className="plate">
                  {filteredCoffees.map((coffee, i) => (
                    <Specimen
                      key={coffee.name}
                      coffee={coffee}
                      index={i}
                      featured={featureFirst && i === 0}
                      sortDim={sortDim}
                      activePopoverDim={activePopover?.coffeeName === coffee.name ? activePopover.dimIndex : null}
                      onDotClick={handleDotClick}
                      onClosePopover={closePopover}
                      onSelect={selectCoffee}
                      compareMode={compareMode}
                      selectIndex={selectIndexByName.has(coffee.name) ? selectIndexByName.get(coffee.name) : null}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {view === "heatmap" && (
            <HeatmapView coffees={sortedCoffees} sortDim={sortDim} sortDir={sortDir} onDimClick={handleDimClick} />
          )}
          {view === "tags" && <TagsView />}
          {view === "discover" && <DiscoverView onSelectCoffee={selectCoffee} />}
          {view === "map" && <FlavorMapView onSelectCoffee={selectCoffee} />}
          {view === "compare" && <CompareView />}
          {view === "compareScreen" && (
            selected.length >= 2 ? (
              <CompareScreen
                coffees={selected}
                onRemove={removeSelected}
                onClearAll={() => { clearSelection(); goTo("cards"); }}
              />
            ) : (
              <p className="empty">
                Select at least two origins from the Origins view to compare.{" "}
                <button type="button" className="textlink" onClick={() => { setCompareMode(true); goTo("cards"); }}>Go to Origins</button>
              </p>
            )
          )}
        </main>

        <Colophon onMethodology={() => setShowMethodology(true)} />
      </div>

      {compareMode && view === "cards" && (
        <SelectionBar selected={selected} onRemove={removeSelected} onCompare={goToCompareScreen} />
      )}

      {showMethodology && <Methodology onClose={closeMethodology} />}

      {processInfo && (
        <BottomSheet onClose={() => setProcessInfo(null)} accent={PROCESS_COLORS[processInfo]} label={`${processInfo} processing`}>
          <div className="note-slip">
            <div className="note-slip__head">
              <span className="note-slip__dim note-slip__dim--lg">
                <span className="swatch swatch--lg" style={{ background: PROCESS_COLORS[processInfo] }} />
                {processInfo}
              </span>
              <CloseButton onClick={() => setProcessInfo(null)} />
            </div>
            <p className="note-slip__note">{PROCESS_EXPLAINERS[processInfo]}</p>
          </div>
        </BottomSheet>
      )}

      {selectedCoffee && (
        <Dossier coffee={selectedCoffee} onClose={closeDossier} onSelect={selectCoffee} />
      )}
    </>
  );
}
