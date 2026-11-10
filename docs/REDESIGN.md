# Tasting Terrain — Redesign Notes

*November 2026. The audit, the creative direction, the design system, and the
regression checklist used to verify the redesign.*

---

## 1. Audit

**What the product is.** Tasting Terrain (tastingterrain.com, page title "Coffees
of the World") is an interactive comparative tasting guide. It covers 32
single-origin coffees, each scored 1–10 on six flavor dimensions (Fruity, Floral,
Sweet, Nutty, Spicy, Earthy). Each origin carries curated tasting notes per
dimension, plus process, species, roast, cultivars and brew methods. Visitors use
it to answer "what does coffee from X taste like, and which should I buy?"

**Architecture.** It's a Vite + React 19 static SPA on Vercel with Vercel
Analytics and Speed Insights. There is a single route, `/`. The only URL state is
`?compare=A,B,C`, which restores a shared comparison. All data lives in
`src/coffeeData.js`. Every chart is hand-drawn SVG and there are no UI or chart
dependencies. Before the redesign, roughly 95% of the styling was inline style
objects in one 3,900-line component.

**Imagery.** The site has no photography. `src/assets/hero.png` is unused Vite
boilerplate. The real visual assets are the data graphics: radars, heatmap, PCA
map and roast spectrum. The redesign treats those as the site's imagery and
adds no stock photography.

**Generic-AI patterns in the old design:**

| Pattern | Where |
|---|---|
| Centered masthead, eyebrow, H1, hairline, italic subtitle | Header |
| Uniform 3-up rounded cards, each with a centered radar | Origins |
| Pill chips everywhere (filters, tags, badges, brew methods) | Global |
| Radial-gradient "glow" background, glow filters on radars | Global |
| Backdrop-blur glass bars | Compare header, selection bar |
| Rounded boxed panels stacked vertically | Tags, Discover, Compare |
| One serif (Georgia) at 8–13px for everything | Global |
| Emoji as decorative tag icons | Tags, popovers |
| Every section centered with the same rhythm | Global |

---

## 2. Functionality inventory (regression checklist)

### Global
- [ ] Masthead shows the guide title and opens the **Methodology** modal
- [ ] **Dimension legend** sorts origins by a dimension. Clicking cycles
      desc → asc → off. Shared by Origins and Heatmap
- [ ] **Six views** are reachable from the nav at every width (320px+):
      Origins, Compare, Heatmap, Flavor Map, Discover, Tags
- [ ] Footer: scoring disclaimer, credit, email link, GitHub link
- [ ] Vercel Analytics + Speed Insights still injected

### Origins (default view)
- [ ] 32 origins, alphabetical by default, re-sorted by the legend
- [ ] Each entry: region, name, process, species, radar, note, six scores
- [ ] Radar dot → flavor popover (desktop overlay / mobile bottom sheet),
      click-outside closes, re-click toggles
- [ ] Entry click → **Origin detail**
- [ ] Filters: Brew method (multi, OR), Roast range (tap to extend, ±1
      adjacency, tap single level again to clear, "clear roast range"),
      Process (multi, primary-or-also) with an ⓘ explainer sheet per process
- [ ] Result count is always visible; "clear all" appears when filtered
- [ ] **Compare mode** toggle: tapping entries selects up to 3 (numbered,
      series-colored), a fixed bottom bar shows removable chips, and
      "Compare →" turns on at 2
- [ ] Entry animation runs once on mount only, never on filter

### Origin detail (modal)
- [ ] Region, name, process, species, large radar, score bars
- [ ] Tasting notes, roast bar, "scored at" note when present
- [ ] Process, plus a "what does this mean?" explainer toggle and "also commonly"
- [ ] Cultivars, recommended brews
- [ ] **Similar origins** (3 nearest by Euclidean distance) navigate in place
- [ ] Flavor breakdown (all non-null highlights)
- [ ] Escape closes, backdrop click closes, body scroll locked

### Compare (dropdown tab)
- [ ] Two selects (16px, so iOS doesn't zoom), overlaid radar, legend
- [ ] Radar vertex → multi-origin flavor sheet
- [ ] Per-dimension score bars, info panels (region, process, species,
      roast, scored-at, cultivars, note)

### Compare screen (from cards / `?compare=`)
- [ ] Sticky radar header, animated morph (reduced-motion aware), legend
      with remove buttons, vertex → flavor sheet, dimension label → sheet
- [ ] Grouped score bars with a "leads" marker
- [ ] Per-origin panels, "clear comparison" returns to Origins
- [ ] URL kept in sync via `replaceState`; shared URL opens the screen

### Heatmap
- [ ] 32 × 6 grid fits without horizontal scroll at 320px
- [ ] Column header sorts (same cycle as legend)
- [ ] Desktop hover tooltip; tap opens the bottom sheet with the highlight

### Flavor Map
- [ ] PCA scatter with axis labels from the loadings, collision-avoided labels
- [ ] Color by Region / Process toggle with a legend
- [ ] Hover tooltip with region, note, six scores
- [ ] "?" explainer toggle

### Discover
- [ ] Tag picker grouped by dimension, multi-select, active-tag list with
      remove and "Clear all"
- [ ] Ranked results (match %, matched tags, mini radar) open the detail view
- [ ] Empty states for no selection and no matches

### Tags
- [ ] Processing-method section (process → origins, primary or also)
- [ ] Six dimension sections: tag → origins
- [ ] Origin chips show a radar tooltip on hover (desktop) or tap (mobile sheet)

---

## 3. Creative direction — "A field atlas of flavor"

The name gives the brief: **terrain** (survey, contour, coordinates, field
notes) and **tasting** (the cupping notebook, the sensory vocabulary). The site
should read like a printed field atlas: a catalog of specimens, each drawn,
located and annotated.

**Signature: the flavor terrain.** The 32 origins' PCA coordinates become
peaks on a real contour map, computed with marching squares at module load.
Where profiles converge, ridges form. It's the homepage hero and the Flavor
Map's underlay, and its contour lines are made from the data, not decoration.
Each origin's radar is drawn the same way, as a contoured hill tinted by its
dominant dimension.

**Type, following cartographic convention.**
- **Gloock** for display: a heavy, warm, wedge-serifed face with earthy weight.
  Used for the masthead, origin names and section titles.
- **Newsreader** for text and the italic voice. On maps, natural features are
  set in italic serif, so every tasting note, caption and annotation is set in
  Newsreader italic.
- **Archivo**, condensed via its width axis, for labels: place names,
  coordinates, metadata, filters, data figures (tabular). On maps, these are
  set in upright condensed sans.

**Color.** Parchment paper and ink, with deep botanical green for the bands
that bookend the page and terracotta for the editorial accent (numbering,
active states). Six dimension hues are retuned for paper: raspberry, violet,
honey, hazel, paprika, moss. Process and region keys use the same small
colored squares as a map legend, not pills.

**Composition.** It uses an asymmetric 12-column grid and hairline rules
instead of boxes. Specimens sit on a ruled plate, not in rounded cards. Each
section gets its own structure:

| Section | Treatment |
|---|---|
| Origins | Specimen plate |
| Heatmap | Ledger |
| Tags | Back-of-book index and glossary |
| Compare | Typeset sentence form |
| Origin detail | Dossier |
| Footer | Colophon |

**Restraint.** Contours appear in three places only: the hero terrain, the
Flavor Map, and the radars. Coordinates appear on specimens and the dossier.
Numbering appears on specimens (No.), sections (Roman numerals) and dimensions
(01–06).

---

## 4. Design system

Tokens live in `src/styles/tokens.css`. Data-driven colors (dimensions,
process, region, series) live in `src/lib/constants.js`. Components pass them
to CSS as the `--c` custom property, so every color has one source.

| Token group | Notes |
|---|---|
| `--paper*`, `--ink*`, `--forest*`, `--rust`, `--honey`, `--cobalt` | Brand palette. Every text pair is ≥ 4.5:1 |
| `--font-display / text / label` | Gloock / Newsreader / Archivo |
| `--step--2 … --step-6` | Fluid type scale, in rem |
| `--space-1 … --space-9` | 4-based spacing scale |
| `--measure`, `--page-max`, `--gutter`, `--margin` | Layout widths |
| `--rule`, `--rule-soft`, `--rule-strong` | Borders (hairlines, not boxes) |
| `--shadow-sheet`, `--shadow-slip` | The only two shadows |
| `--focus` | Visible keyboard focus |
| Breakpoints | 640 / 900 / 1200, mirrored in `MQ` in `constants.js` |

Coordinates in `src/lib/places.js` mark an *approximate* center of each
origin's principal growing district. They're there for orientation, and the
methodology says so.
