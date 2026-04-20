# Coffees of the World

An interactive flavor infographic comparing 32 single-origin coffees across six sensory dimensions. Built with React + Vite, deployed as a static site on Vercel.

**Live site:** [tastingterrain.com](https://tastingterrain.com)

---

## What it does

### Origins
The default view. Each coffee origin is shown as a card with a radar chart visualizing its six-dimension flavor profile. Click a dimension dot to reveal curated tasting notes — specific cultivars, altitudes, processing stations, and flavor science behind that score. Click anywhere on the card to open a full detail view with roast level, processing method, cultivars, and recommended brew methods. The detail view also shows a **Similar Origins** section — the three closest coffees by Euclidean distance across all six flavor dimensions.

Cards can be filtered by brew method and roast level (multi-select chips, stackable) and sorted by any flavor dimension using the legend at the top of the page.

### Compare
A dedicated comparison view. Select any two origins from alpha-sorted dropdowns and instantly see an overlaid dual radar chart, a side-by-side score bar for each flavor dimension, and info panels showing each origin's region, roast, processing method, and cultivars. Designed to encourage exploration across all 32 origins.

### Heatmap
A grid view of all 32 origins scored across all six dimensions simultaneously. Useful for comparing origins side-by-side or spotting which coffees lead in a particular dimension. Click any score cell to see the same flavor notes as the card dots. The column headers are clickable chips — hover to see a mini radar for that origin.

### Flavor Map
A PCA (Principal Component Analysis) scatter plot that reduces the six-dimensional flavor space down to two axes and plots all 32 origins in it. Origins that cluster together have similar flavor profiles; outliers are genuinely unique. Points are colored by each coffee's dominant flavor dimension. A `?` toggle explains the chart in plain English for readers unfamiliar with PCA.

The two axes are derived automatically from the data: the labels (shown on each axis) reflect which flavor dimensions contribute most to the variance captured by that component.

### Discover
A recommendation engine. Select one or more flavor tags (e.g. "Jasmine", "Dark Chocolate", "Earthy") and the view returns all matching origins ranked by how closely their tasting notes match your selection. Each result shows a mini radar and a match percentage bar.

### Tags
An index of every flavor tag used across the dataset, organized alphabetically by dimension. Also includes a Processing Method section grouping coffees by how the cherry was prepared after harvest. Hover any coffee chip to see its full radar profile.

---

## The dataset

### Origins
32 single-origin coffees are included:

| Origin | Region | Process | Roast |
|--------|--------|---------|-------|
| Ethiopian | East Africa | Washed | Light |
| Colombian | South America | Washed | Light–Medium |
| Kenyan | East Africa | Washed | Light–Medium |
| Sumatran | Indonesia | Wet-Hulled | Medium–Dark |
| Brazilian | South America | Natural | Medium–Dark |
| Guatemalan | Central America | Washed | Light–Medium |
| Costa Rican | Central America | Honey | Light–Medium |
| Yemeni | Middle East | Natural | Medium |
| Jamaican Blue Mountain | Caribbean | Washed | Medium |
| Hawaiian Kona | Pacific | Washed | Light–Medium |
| Vietnamese | Southeast Asia | Natural | Dark |
| Peruvian | South America | Washed | Light–Medium |
| Mexican | North America | Washed | Light–Medium |
| Rwandan | East Africa | Washed | Light–Medium |
| Indian Monsoon | South Asia | Monsooned | Medium–Dark |
| Panama Geisha | Central America | Washed | Light |
| Burundian | East Africa | Washed | Light–Medium |
| Tanzanian | East Africa | Washed | Light–Medium |
| Honduran | Central America | Washed | Medium |
| Papua New Guinea | Pacific | Washed | Medium |
| Ethiopian Harrar | East Africa | Natural | Light–Medium |
| Sulawesi Toraja | Indonesia | Wet-Hulled | Medium–Dark |
| Bolivian | South America | Washed | Light |
| Salvadoran Pacamara | Central America | Washed | Light–Medium |
| Congolese Kivu | Central Africa | Washed | Medium |
| St. Helena | South Atlantic Island | Washed | Light–Medium |
| Filipino Barako | Southeast Asia | Natural | Medium–Dark |
| Ugandan | East Africa | Washed | Medium |
| Nicaraguan | Central America | Washed | Light–Medium |
| Ecuadorian | South America | Washed | Light |
| Flores | Indonesia | Wet-Hulled | Medium |
| Myanmar | Southeast Asia | Natural | Light–Medium |

### Flavor dimensions
Every origin is scored 1–10 across six dimensions:

| Dimension | What it measures |
|-----------|-----------------|
| **Fruity** | Berry, citrus, stone fruit, dried fruit intensity |
| **Floral** | Jasmine, rose, lavender, aromatic complexity |
| **Sweet** | Caramel, honey, chocolate, sugar sweetness |
| **Nutty** | Hazelnut, almond, cocoa, roasted nut character |
| **Spicy** | Cardamom, pepper, cinnamon, clove, cedar |
| **Earthy** | Peat, tobacco, forest floor, terroir depth |

---

## Scoring methodology

Scores represent the **characteristic expression of each origin at a light-to-medium roast level** (except where the origin is traditionally roasted darker, such as Vietnamese or Sumatran). They are not averages of every lot ever produced — they reflect what makes each origin distinctive when sourced at specialty grade.

### Sources consulted
Scores and tasting notes were derived from a synthesis of:

- **Cup of Excellence** auction reports and jury tasting notes (Ethiopia, Colombia, Peru, Honduras, Guatemala, Rwanda, Burundi)
- **Coffee Review** (coffeereview.com) — over 10,000 published reviews, specifically referenced for Brazil, Kona, Kenyan SL28/SL34, and PNG Sigri Estate lots
- **Sweet Maria's** green coffee library — particularly for Yemen, Ethiopia, and Sumatra processing descriptions
- **World Coffee Research Variety Catalog** — primary source for cultivar data; varietal notes for Geisha, SL28, SL34, Bourbon Amarelo, Typica, Pacamara, and others
- **Intelligentsia Coffee** and **Blue Bottle Coffee** published lot notes for Burundi, Rwanda, and Tanzania
- **Scott Agricultural Laboratories** historical records (Kenyan SL-series varieties)
- **Perfect Daily Grind** origin guides for Mexico, Vietnam, and Central America
- Regional altitude and processing data from origin-country coffee boards (ICO, IHCAFE Honduras, COCAFE Costa Rica)

### Score calibration principles
- Scores reflect **origin-level typicity**, not varietal or micro-lot outliers. A score of 8 on Fruity means this origin reliably and characteristically expresses strong fruit; it does not mean every Kenyan tastes the same.
- Scores are **reference-roast normalized**: a Dark roast Ethiopian would score much lower on Fruity and Floral than shown — the scores assume the roast level noted on each card.
- `null` highlights (no tasting note shown for a dimension) indicate that dimension is not a defining characteristic of the origin, not that it's absent entirely.
- The **processing method** is treated as part of the origin's identity. Costa Rican Honey, Sumatran Wet-Hulled, and Indian Monsooned scores reflect the traditional processing method for that origin, since it fundamentally shapes the cup character.

---

## Processing methods

| Method | Description |
|--------|-------------|
| **Washed** | Cherry pulped, fermented, and fully washed before drying. Produces clean, terroir-transparent, fruit-forward cups. Most common globally. |
| **Natural** | Whole cherry dried intact on raised beds. Fruit sugars absorb into the bean, producing winey, heavy-bodied, fruit-intense cups. |
| **Honey** | Pulp removed but mucilage (sticky fruit layer) left intact during drying. Bridges washed clarity and natural sweetness. Perfected in Costa Rica. |
| **Wet-Hulled** | Parchment removed at ~50% moisture before final drying. Unique to Indonesia (Giling Basah). Produces the characteristic Sumatran body and earthy depth. |
| **Monsooned** | Green coffee exposed to humid monsoon winds for 12–16 weeks. Recreates the accidental transformation that occurred during 19th-century sea voyages. Unique to India's Malabar Coast. |

---

## Tech stack

- **React 19** + **Vite 8** — component UI and bundler
- **No CSS framework** — all styles are inline React style objects
- **No charting library** — radar charts and scatter plots are hand-drawn SVG
- **PCA implementation** — covariance matrix + power iteration, ~30 lines of plain JS, computed once at module load
- **Static deployment** — no server, no database; all data lives in `src/coffeeData.js`
- **Vercel** — auto-deploys on push to `main`

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deploy

Push to GitHub and connect the repo on [vercel.com](https://vercel.com). Vercel auto-detects Vite and sets the correct build command (`npm run build`) and output directory (`dist`).

---

Made with coffee and curiosity by [@neilkod](https://github.com/neilkod)
