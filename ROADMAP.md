# Tasting Terrain — Mobile-First Roadmap

*Drafted June 2026, from a full audit of the codebase (`src/CoffeeInfographic.jsx`,
`src/coffeeData.js`, shell files). The driving goal: **eliminate the need to nudge
users to a desktop browser.** The site should feel like it was designed for a phone
first, with desktop as the bonus.*

---

## Where we are today (audit summary)

**Architecture.** Vite + React 19 SPA. One component file (`src/CoffeeInfographic.jsx`,
~2,800 lines) renders six views: Origins cards, Compare, Heatmap, Flavor Map (PCA),
Discover, and Tags. Styling is ~95% inline `style` objects plus one injected `<style>`
tag for keyframes/media queries. **There are no charting libraries** — every radar,
heatmap, roast bar, and the PCA scatter is hand-built SVG. The bundle is essentially
React + our code. This is a strength to preserve: any "compare mode" or new chart must
stay pure SVG, no dependencies.

**Dataset.** 32 origins in `src/coffeeData.js`. Each has six 1–10 scores (Fruity,
Floral, Sweet, Nutty, Spicy, Earthy), one `region`, one `process` (Washed ×19,
Natural ×6, Wet-Hulled ×3, Honey ×1, Monsooned ×1), one `roast` string on a 5-step
scale, `brewMethods`, `cultivars`, and per-dimension `highlights` (tag chips +
curated tasting notes). `PROCESS_EXPLAINERS` holds five paragraphs of genuinely good
teaching copy that is currently buried behind a "what does this mean?" link in the
detail modal.

**Top problems found, in order of user pain:**

1. **Heatmap horizontally scrolls on every phone.** Grid min-width is 360px; an
   iPhone 15 has 345px available after page padding, an SE has 327px. Score cells
   scroll away from their row labels. The heatmap is also completely inert on touch —
   tooltips are hover-only.
2. **Nav tabs clip on narrow screens.** `justify-content: center` + `overflow-x: auto`
   means when the 6 tabs overflow, the leftmost tabs become *unreachable*.
3. **Filtering replays the entire card entry animation.** Cards animate with
   `animation: fadeIn … ${index * 0.06}s`; filtering changes each card's index, the
   animation shorthand changes, and the browser restarts a staggered up-to-2-second
   fade across the whole grid on every chip tap. Reads as jank.
4. **Everything re-renders on any state change.** `CoffeeCard` isn't memoized, so
   opening one popover re-renders 32 cards × ~35 SVG nodes. Heatmap hover state
   re-renders all 224 cells per mouse event. Score bars animate `width` (a layout
   property) on 192 elements.
5. **The Origins view is a ~13,000px scroll on mobile** (32 cards × ~400px, one
   column). Vertical comparison fatigue: by Tanzanian, Ethiopian's radar is 20
   screens away.
6. **Tap targets are far below the 44px minimum.** Radar dots ≈7px, filter chips
   ≈22px tall, popover close is a bare `×`.
7. **Type scale is compressed into 8–13px** and two colors fail contrast:
   `#3A2A14` on `#1A1008` is ~1.35:1 (effectively invisible — and it's the scoring
   disclaimer), and the workhorse muted `#8B6F4E` is ~4.0:1, just under WCAG AA.
   The Compare `<select>`s are 13px, which triggers iOS Safari's auto-zoom on focus.
8. **Roast filtering is semantically wrong for coffee drinkers.** Exact string match
   means tapping "Light" hides every "Light–Medium" origin — exactly the coffees a
   light-roast drinker wants.
9. Misc: `window.innerWidth` read at render (breaks on rotation), no body scroll
   lock under bottom sheets, stale "20 coffees" in meta description (it's 32), no
   `theme-color`, no `og:image`, no `prefers-reduced-motion` guard.

**What's already good and must not regress:** the bottom-sheet pattern for mobile
popovers, module-level precomputation (`TAG_INDEX`, `PROCESS_INDEX`, PCA),
viewBox-scaled SVGs, system fonts, the near-black `#1A1008` OLED-friendly palette,
and the existing two-origin `CompareRadar` — the seed of Compare Mode 2.0.

---

## Sprint 1 — Stop the bleeding: functional bugs & rendering performance ✅ COMPLETE

**Status:** ✅ Done (commit `899869e`, branch `mobile-sprint-1-2`). All five items
landed in `CoffeeInfographic.jsx`; build & lint clean. Exit criteria met.

**Goal:** every view is *reachable and smooth* on a phone. No unreachable UI, no
animation replay on filter, no wasted re-renders. This sprint is all inside
`CoffeeInfographic.jsx`, each step is small, and they compound — do it as one pass.

**Why first:** these are the defects users hit in the first 30 seconds on mobile.
Everything later in the roadmap (Compare Mode especially) builds on a card grid and
filter system that must already feel instant.

### ✅ 1.1 Fix nav-tab clipping
Replace `justify-content: center` on `.nav-tabs` with `flex-start` plus
`margin-left: auto` on the first child / `margin-right: auto` on the last (the
"safe center" pattern). Optionally add a subtle edge-fade gradient as a scroll
affordance.
**Outcome:** all six tabs reachable on every screen width. This is a functional
bug today — on narrow screens users literally cannot scroll back to "Origins."

### ✅ 1.2 Mount-only card animation, stagger capped
Move `fadeIn` to a CSS class applied only on first mount (e.g. animate via a class
the card removes on `animationend`, or key the delay to a stable per-coffee value
rather than the array index), and cap the stagger at ~8 items so the grid never
takes 2s to settle.
**Outcome:** filtering feels instant — cards that survive a filter *stay put*
instead of re-fading. This single change removes the most visible mobile jank.

### ✅ 1.3 Memoize the hot paths
`React.memo(CoffeeCard)`, `useCallback` on the handlers passed into it, and key the
heatmap row fragments (currently a key-less `<>` inside `.map()` — a React
reconciliation warning today). Move heatmap tooltip state down so hover doesn't
re-render all 224 cells.
**Outcome:** opening a popover re-renders 1 card instead of 32; sorting the heatmap
diffs efficiently; hover/touch interactions stop doing grid-wide work. Biggest CPU
win available for low-end phones.

### ✅ 1.4 Compositor-friendly score bars
Change score-bar fills from animating `width` to `transform: scaleX()` with
`transform-origin: left`.
**Outcome:** 192 layout-animating elements become zero. Re-sorts and filters animate
on the compositor thread — silky on mobile processors.

### ✅ 1.5 Cheap rendering wins
Add `content-visibility: auto; contain-intrinsic-size: auto 420px;` to cards, and a
`prefers-reduced-motion` media guard around `fadeIn`/`pulseRing`.
**Outcome:** off-screen cards skip rendering entirely (lazy rendering for one line
of CSS); motion-sensitive users get a calm experience; Lighthouse stops flagging it.

**Sprint 1 exit criteria:** filter chips toggle with no visible re-animation; React
DevTools shows single-card re-renders; no console key warnings; all tabs reachable
at 320px width.

---

## Sprint 2 — Touch-native & readable: the mobile usability pass ✅ COMPLETE

**Status:** ✅ Done (commit `3668906`, branch `mobile-sprint-1-2`). All six items
landed; build & lint clean. Added a shared `BottomSheet` primitive + `useMediaQuery`
hook that Sprint 3 reuses. Note: og:image *tags* are wired and a placeholder
`public/og-image.png` now exists — replace with a final rendered asset when ready.

**Goal:** every interaction works with a thumb, every word is legible at arm's
length, and the browser chrome/meta presents the site properly. After this sprint
there is no remaining reason to tell a mobile user "try it on desktop."

**Why second:** Sprint 1 made things fast; this sprint makes them *usable*. These
changes also harden the exact components (bottom sheets, chips, radar dots) that
Compare Mode 2.0 will reuse, so doing them first means Sprint 3 inherits good parts.

### ✅ 2.1 Heatmap on touch
Make cells tappable: tap opens the existing mobile bottom sheet showing that
origin × dimension highlight (tags + curated note). Shrink/abbreviate to fit ~345px:
tighter name column, two-letter or icon dimension headers on narrow screens, so the
grid fits without horizontal scroll on any mainstream phone.
**Outcome:** the data-densest view goes from *inert and side-scrolling* on phones to
fully explorable. Phone users gain access to all 130+ curated tasting notes from the
heatmap, and row labels never separate from their scores.

### ✅ 2.2 Tap-target pass
Overlay invisible hit circles (`r=14`, `fill="transparent"`) on radar dots; bump all
chips/buttons to ≥36px effective height; enlarge close buttons; add
`touch-action: manipulation` globally on interactive elements.
**Outcome:** interactions land on the first try. The radar dot → flavor-note popover
(the site's best feature) becomes discoverable by thumb instead of requiring
pixel-precision.

### ✅ 2.3 Typography scale & contrast
Define a real type scale (≈ 11 / 13 / 15 / 18 / 24 / clamp-hero) in `rem` so user
font-size settings are respected; floor body text at 11px equivalents. Fix the two
contrast failures: `#3A2A14` text → a legible muted tone; nudge `#8B6F4E` →
~`#A08560` (clears WCAG AA at 4.5:1 while keeping the palette). Set all form
controls (Compare selects) to 16px.
**Outcome:** the editorial aesthetic survives — hierarchy comes from the spacing and
tracking we already have, not miniature text. The scoring disclaimer becomes
readable (it's a credibility statement; today it's invisible at 1.35:1). The
iOS focus-zoom bug disappears.

### ✅ 2.4 Bottom-sheet hardening
Body scroll-lock while a sheet/modal is open; `padding-bottom:
env(safe-area-inset-bottom)` (home-indicator clearance); `overscroll-behavior:
contain`; replace the four render-time `window.innerWidth < 640` reads with a single
`useMediaQuery` hook on `matchMedia`.
**Outcome:** sheets feel native — no background scroll-through, no content under the
home indicator, and rotation mid-interaction no longer strands the UI in the wrong
layout.

### ✅ 2.5 Head & shareability fixes
`<meta name="theme-color" content="#1A1008">`; correct the meta description ("20" →
"32 single-origin coffees"); add an `og:image` (a rendered radar over the dark
palette makes link shares beautiful).
**Outcome:** mobile browser chrome matches the page instead of flashing white;
shared links carry an image card; metadata stops underselling the dataset.

### ✅ 2.6 Filter discoverability
Always show the result count ("32 of 32 origins" at rest, not only when filtered),
and make the filter row `position: sticky` beneath the tabs on the cards view.
**Outcome:** users learn the filters exist (the resting count advertises them) and
never scroll back to the top to adjust — filtering becomes a live, reactive control
surface instead of a header artifact.

**Sprint 2 exit criteria:** complete a "find me an earthy, French-press coffee and
read why it's earthy" task entirely by thumb on a 375px viewport; Lighthouse
accessibility ≥ 95; no horizontal scroll anywhere at 320px.

---

## Sprint 3 — Compare Mode 2.0 (the flagship) ✅ COMPLETE (pending device QA)

**Status:** ✅ Implemented on branch `sprint-3-compare`; build & lint clean. All six
items done: array-based `CompareRadar` (colorblind-safe dash patterns + screen blend),
select-from-cards flow with a fixed bottom select bar, sticky-radar `CompareScreen`,
per-vertex `BottomSheet` flavor comparison, rAF score-morph (reduced-motion aware),
and `?compare=` shareable URLs. **Not yet merged to `main`** — awaiting real-device QA
(3-way overlap blend on OLED, `backdrop-filter`, morph smoothness, notch safe-area,
share round-trip in a fresh mobile tab).

**Goal:** turn the site from a reference you *read* into a tool you *use*. A user
selects 2–3 origins while browsing and gets an overlaid, interactive radar pinned to
the top of the viewport, with per-dimension detail beneath. This is the feature that
answers "which of these should I buy?" — the question every visitor actually has.

**Why now:** Sprints 1–2 delivered the parts this reuses (fast memoized cards,
hardened bottom sheets, touch-sized targets, the `useMediaQuery` hook). And we are
not starting from zero: `CompareRadar` already overlays two origins in pure SVG.
The work is generalizing it, making selection touch-native, and pinning the chart.

**Build order matters** — each step is shippable on its own:

### ✅ 3.1 Generalize `CompareRadar` to 2–3 origins
Accept `coffees: Coffee[]` instead of `{scoresA, scoresB}`. Render largest polygon
first (painter's algorithm so small profiles aren't buried). Distinguish series by
**stroke pattern as well as color** — solid / `4 2` dash / `1.5 3` dot — so overlaps
stay legible for colorblind users. Fills at ~18% opacity; `mix-blend-mode: screen`
on the polygon group so overlap regions read as intentional blends on the dark
background. Third series color: `#7A9B6A` (the Earthy sage — distinct hue family
from the existing `#D4A843` gold and `#A98BC7` violet).
**Outcome:** the core visualization supports the 3-way comparison, stays ~15 SVG
nodes (instant on any device), and remains dependency-free.

### ✅ 3.2 Select-from-cards flow
Add a "Compare" toggle to the Origins view. When active, tapping a card *selects*
it (colored border + numbered badge in its series color) instead of opening the
detail modal. A slim bar pinned to the bottom of the viewport — the thumb zone —
shows selected origins as removable chips and a "Compare →" button that enables
at 2 selections, caps at 3.
**Outcome:** selection happens where browsing happens. The current flow (separate
tab, two dropdowns, alphabetical hunting) becomes: see two interesting cards, tap
tap, compare. This is the difference between a feature that exists and a feature
that gets used.

### ✅ 3.3 Sticky-top comparison layout
The comparison screen pins the radar in a `position: sticky; top: 0` header
(~45vh, backdrop-blurred over the page background). Beneath it scroll: per-dimension
grouped bars with a "▲ leads" marker on the max score per dimension, then
process/roast/cultivar panels per origin.
**Outcome:** the user's eye never loses the shape while reading details — the direct
antidote to vertical comparison fatigue, and the reason this beats three cards
side-by-side ever could on a phone.

### ✅ 3.4 Per-vertex tap → multi-origin flavor sheet
Invisible `r=14` hit circles on each radar vertex; tapping "Floral" opens the bottom
sheet showing the Floral highlight (tags + curated note) for *all selected origins
side by side*.
**Outcome:** the moment the curated `highlights` data becomes a comparison tool
instead of a per-origin footnote. "Why does Ethiopian beat Colombian on floral?" is
answered in one tap, in our own words.

### ✅ 3.5 Animated transitions
When an origin is swapped, interpolate the score vectors in JS — one
`requestAnimationFrame` loop lerping 6 numbers per coffee over ~350ms ease-out,
recomputing the polygon string per frame. (SVG `points`/`d` aren't reliably
CSS-transitionable cross-browser; the lerp is 18 multiplications per frame and
cannot stutter.) Guard with `prefers-reduced-motion`.
**Outcome:** profile changes *morph* rather than snap — the polish moment that makes
the feature feel premium, at zero bundle cost.

### ✅ 3.6 Shareable comparisons
Encode selection in the URL (`?compare=Kenyan,Ethiopian,Rwandan`); read it on load.
**Outcome:** every comparison becomes a shareable artifact. For a content site this
is cheap, high-leverage distribution — people argue about coffee in group chats.

**Sprint 3 exit criteria:** select 3 origins from cards by thumb, land on a sticky
radar, tap a vertex, read all three origins' notes in a sheet, share the URL, open
it in a fresh tab and see the same comparison.

---

## Sprint 4 — Honest data, educational filters ✅ COMPLETE

**Status:** ✅ Done (branch `sprint-4-data`); build & lint clean, zero stale `.process`
reads. Schema migrated for all 32 origins: added `species`, `processes:{primary,also}`,
optional `scoredAt`. Roast filter is now an adjacency/range spectrum; a Process filter
row with ⓘ explainers (in the shared BottomSheet) was added; species badges ship on
cards/modal/compare panels. Scores & highlights untouched (no re-scoring).

**Goal:** make the filtering model match how coffee people actually think, and
surface the educational content we already wrote at the moment of decision. This
sprint touches `coffeeData.js`'s shape, so it's deliberately *after* Compare Mode —
schema churn mid-flagship would be self-inflicted pain.

### ✅ 4.1 Roast as a range
Replace exact-match roast filtering with a range model (`roastRange: [min, max]`
over the 5-step scale) or adjacency matching, and replace the five tiny chips with
a **drag-across roast spectrum** built from the existing gradient `RoastBar`
component.
**Outcome:** tapping "Light" finally shows Light–Medium origins (Kenyan, Colombian,
Costa Rican — exactly what a light-roast drinker wants and currently loses). The
filter control itself becomes a piece of the visual identity instead of a chip row.

### ✅ 4.2 Multi-process origins
Move to `processes: { primary, also: [] }`. Ethiopia is already correctly split into
Washed Yirgacheffe and Natural Harrar entries, but Colombia, Costa Rica, and Brazil
all ship significant washed *and* natural/honey volume; the single-process field
understates reality, and the methodology modal itself admits scores shift by process.
**Outcome:** the Process filter becomes honest, cards stay clean (primary badge),
and the detail modal can note "also commonly: Natural, Honey."

### ✅ 4.3 Process filter — with teaching built in
Add a Process filter row to the cards view (today there is none, despite process
being the most flavor-deterministic variable we track — Wet-Hulled vs. Washed
predicts the cup better than country does). Each process chip gets a small ⓘ
affordance opening `PROCESS_EXPLAINERS` in the bottom sheet.
**Outcome:** the most predictive filter exists at all, and the five paragraphs of
teaching copy currently hidden in the detail modal reach users at the moment they're
deciding. A user who learns *why* Monsooned tastes earthy trusts the scores.

### ✅ 4.4 Species badges
Add a `species` field: Vietnamese is Robusta, Filipino Barako is Liberica —
different *species*, currently buried in `cultivars`. Render a small
`ARABICA / ROBUSTA / LIBERICA` badge beside the process badge.
**Outcome:** one field, one tiny component, and the kind of detail that signals
expertise to coffee-literate visitors (and genuinely educates everyone else).

### ✅ 4.5 Baseline consistency note (data hygiene)
The methodology states all scores reference a light-to-medium roast, but the
Vietnamese and Sumatran profiles are explicitly written as dark-roast cups.
Reconcile: either re-baseline those scores or add a per-origin "scored at" roast
note to the methodology.
**Outcome:** a pedantic cupper can no longer catch us contradicting our own
methodology — credibility hygiene for the site's most authority-dependent content.

**Sprint 4 exit criteria:** filter by "Light" and see Light–Medium origins; filter
by process from the cards view; tap ⓘ on "Wet-Hulled" and read the explainer; see
species badges on Vietnamese and Barako.

---

## Sprint 5 — Density, architecture, and depth (forward-looking)

**Goal:** pay down the structural debts that make every future change expensive, and
open the data questions that grow the site's ambition. Lower urgency, higher
horizon — pull items forward opportunistically.

### 5.1 Mobile density mode for Origins
A compact list row (name, region, process badge, ~60px mini-radar, top tasting
note) behind a density toggle, plus region group headers with jump navigation.
**Outcome:** the ~13,000px mobile scroll drops to ~3,000px. Scanning 32 origins
becomes a browse, not an expedition; rich cards remain one tap away via the detail
modal.

### 5.2 Style architecture extraction
Move the inline-style system to CSS custom properties + a stylesheet (or CSS
modules) with type/spacing/color tokens; delete the injected `<style>` string.
**Outcome:** not user-visible by itself, but every future mobile refinement gets
cheaper, per-render style-object churn disappears, and the design system (colors,
scale, radii) becomes one source of truth instead of values repeated across 2,800
lines.

### 5.3 Component file split
Break `CoffeeInfographic.jsx` into per-view modules (`views/`, `components/`,
`lib/similarity.js`).
**Outcome:** comprehension and code review stop requiring a 2,800-line scroll;
views become independently testable; Vite can code-split if we ever want it.

### 5.4 Acidity & body dimensions (data project — decide deliberately)
The six dimensions omit the two most fundamental cupping axes: **acidity** and
**body**. Kenyan vs. Sumatran differ more in acidity than in anything we currently
chart. Adding them means re-scoring 32 origins and re-validating every radar,
highlight, and the PCA map — a content project, not a UI tweak.
**Outcome if done:** the flavor model aligns with how the industry actually cups,
and Compare Mode gets its two most decision-relevant axes. Scope it as its own
effort with a scoring pass per origin.

### 5.5 Display serif for the masthead (optional polish)
One self-hosted display serif (e.g., Fraunces, single ~25KB woff2,
`font-display: swap`) for the H1 only; body stays on zero-cost Georgia.
**Outcome:** a lot of editorial identity for one small file and zero body-text
loading cost.

---

## Guardrails (apply to every sprint)

- **No charting/UI dependencies.** Everything stays hand-built SVG + React. The
  bundle being "React + our code" is a feature of this site.
- **The bottom sheet is the mobile interaction primitive.** New touch surfaces
  (heatmap cells, compare vertices, filter explainers) reuse it — one pattern,
  learned once.
- **Animate only `transform` and `opacity`.** Never layout properties; always honor
  `prefers-reduced-motion`.
- **Dark palette is OLED-tuned** (`#1A1008` base). Keep contrast moves *within* the
  brown/gold family; verify ≥4.5:1 for text.
- **Curated `highlights` notes are the site's soul.** Every new view should create a
  path *into* them, not around them.
