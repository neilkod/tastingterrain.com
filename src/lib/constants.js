// ─── Shared constants ────────────────────────────────────────────────────────
// Data-driven colors live here (one source); CSS reads them through the `--c`
// custom property set inline by components. Brand palette lives in tokens.css.

export const DIMS = ["Fruity", "Floral", "Sweet", "Nutty", "Spicy", "Earthy"];
export const DIM_DESCS = [
  "berries, citrus, stone fruit",
  "jasmine, rose, herbal",
  "caramel, honey, sugar",
  "hazelnut, almond, cocoa",
  "pepper, clove, cinnamon",
  "cedar, tobacco, soil",
];
export const DIM_ABBR = ["Fr", "Fl", "Sw", "Nu", "Sp", "Ea"];
export const NUM = DIMS.length;

// Graphic fills (radar tints, heatmap cells, swatches) — tuned for parchment.
export const DIM_COLORS = [
  "#C2405F", // Fruity  — raspberry
  "#8466B5", // Floral  — violet
  "#D2A02E", // Sweet   — honey
  "#A0703F", // Nutty   — hazel
  "#D26A2A", // Spicy   — paprika
  "#6B8A47", // Earthy  — moss
];
// Text-safe variants (≥ 4.5:1 on --paper) for labels set in a dimension's hue.
export const DIM_INK = [
  "#A82E4E",
  "#6A4C9C",
  "#7A570A",
  "#80522A",
  "#A2420F",
  "#4A6630",
];

// Scoring rationale per dimension (methodology modal).
export const DIM_METHOD = [
  "Presence of berry, citrus, stone fruit, or tropical notes. High scores are typical of high-altitude East African and some Central American origins. Natural processing amplifies fruit intensity significantly.",
  "Aromatic floral complexity: jasmine, rose, bergamot, herbal. Scores above 8 are rare and almost exclusively associated with Geisha varietals or washed Ethiopian Yirgacheffe lots.",
  "Perceived sweetness and body: caramel, honey, sugar, chocolate. Not added sugar — sweetness inherent in the bean. Natural-process and honey-process coffees score highest. Strongly correlated with full body.",
  "Nut and cocoa character: hazelnut, almond, walnut, dark chocolate. Most prominent in Brazilian, Colombian, and low-altitude Central American origins, especially at medium roast.",
  "Spice and aromatic warmth: pepper, cardamom, clove, cinnamon. Scores above 6 are primarily found in Yemeni and Indian origins. Often present as a background note in many others.",
  "Terroir-driven characteristics: cedar, tobacco, wet soil, mushroom. Highest in Indonesian origins processed by wet-hulling (giling basah). Low scores indicate clean, terroir-neutral cups.",
];

export const PROCESS_EXPLAINERS = {
  "Washed": "The cherry skin and fruit pulp are removed before drying, then the bean is fermented in water tanks and thoroughly rinsed. This strips away most fruit sugars, producing a clean, transparent cup where terroir and varietal character shine through. The world's most common method.",
  "Natural": "The whole cherry is dried intact on raised beds — sometimes for 4–6 weeks — allowing fruit sugars to slowly absorb into the bean. The result is a heavier body, lower acidity, and intense fruit character: think blueberry, wine, and dark berry. Unpredictable but often spectacular.",
  "Honey": "The skin is removed but the sticky mucilage layer (the 'honey') is left on the bean during drying. The more mucilage retained, the sweeter and more fruit-forward the cup. Yellow Honey ≈ 50%, Red Honey ≈ 75%, Black Honey ≈ 100% mucilage remaining. Costa Rica perfected this method.",
  "Wet-Hulled": "Unique to Indonesia (called Giling Basah). The parchment layer is removed while the bean is still at ~50% moisture — far earlier than any other method — then dried further. This fundamentally alters the bean's cellular structure, producing the characteristic low acidity, full body, and earthy, sometimes herbal depth that defines Sumatran and Sulawesi coffees.",
  "Monsooned": "Unique to India's Malabar Coast. Green coffee is spread in open warehouses and exposed to humid monsoon winds for 12–16 weeks. The beans swell to nearly twice their size, absorb moisture, and lose almost all acidity. The process recreates what happened accidentally to Indian coffee during 19th-century sea voyages to Europe — and the result is unlike anything else: malty, spicy, and deeply earthy.",
  "Pulped Natural": "A Brazilian hybrid between washed and natural. The skin is removed (pulped) but the bean is dried with most of its mucilage still attached — no fermentation tank, no full-cherry drying. The result sits between the two parent methods: more body and sweetness than a washed coffee, but cleaner and less wild than a full natural. The backbone of much of Brazil's specialty crop.",
};

// One key color per process — rendered as a small map-legend square.
export const PROCESS_COLORS = {
  "Washed":         "#3F6E8C", // slate water
  "Natural":        "#8E3B46", // dried cherry
  "Honey":          "#C9962A", // mucilage gold
  "Wet-Hulled":     "#2F6B5E", // tropical teal
  "Monsooned":      "#6B4A86", // monsoon plum
  "Pulped Natural": "#A8742A", // ochre
};

// Species: Arabica is the quiet default; the exceptions are flagged in rust.
export const SPECIES_FLAG = { Robusta: true, Liberica: true };

// Region hues for the Flavor Map — deepened to read on parchment.
export const REGION_COLORS = {
  "East Africa":           "#C27C12",
  "Central Africa":        "#B3402A",
  "South Atlantic Island": "#4F8BA6",
  "South America":         "#3F8A3E",
  "Central America":       "#1F8A7C",
  "North America":         "#7C8C1C",
  "Middle East":           "#9C7A3A",
  "South Asia":            "#B0457E",
  "Southeast Asia":        "#7A52A6",
  "Indonesia":             "#D0601E",
  "Pacific":               "#2E86B0",
  "Caribbean":             "#2C4A8E",
};

export const ROAST_LEVELS = ["Light", "Light–Medium", "Medium", "Medium–Dark", "Dark"];
export const ROAST_COLORS = ["#E9C98C", "#C99A4E", "#94623A", "#5E3A22", "#2A1A10"];

export const BREW_METHODS = [
  "AeroPress", "Chemex", "Cold Brew", "Drip", "Espresso",
  "French Press", "Ibrik / Turkish", "Moka Pot", "Phin Filter", "Pour Over",
];

// Compare series: terracotta / cobalt / forest, distinguished by stroke
// pattern as well as hue (solid / dashed / dotted) for colorblind users.
export const SERIES_COLORS = ["#B4472A", "#2C4A8E", "#3E7552"];
export const SERIES_DASH = ["none", "6 3", "1.5 3.5"];

// Breakpoints — mirrored from tokens.css.
export const MQ = {
  mobile: "(max-width: 639px)",
  tablet: "(max-width: 899px)",
};
