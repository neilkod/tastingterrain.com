// ─── Derived data: indexes, similarity, PCA, roast, URL state ───────────────
// Everything here is computed once at module load from coffeeData.js.
import { coffees } from "../coffeeData";
import { DIMS, ROAST_LEVELS } from "./constants";

// ─── Tags ────────────────────────────────────────────────────────────────────
// Tags in the data carry a leading emoji ("🫐 Blueberry"). The redesign sets
// them typographically, so we key and display tags by their text label. This
// also merges variants that differed only by emoji ("🍋 Orange Zest" and
// "🍊 Orange Zest"), which previously split Discover/Tags results.
export function tagLabel(tag) {
  return tag.replace(/^\S+\s/, "");
}

// Unique set of tag labels an origin carries, across all dimensions.
export function labelsOf(coffee) {
  const s = new Set();
  coffee.highlights.forEach((h) => h && h.tags.forEach((t) => s.add(tagLabel(t))));
  return s;
}

// Inverted index per dimension: [label, coffee[]] sorted alphabetically.
export const TAG_INDEX = DIMS.map((_, dimIdx) => {
  const map = new Map();
  coffees.forEach((coffee) => {
    const h = coffee.highlights[dimIdx];
    if (!h) return;
    h.tags.forEach((tag) => {
      const label = tagLabel(tag);
      if (!map.has(label)) map.set(label, []);
      const list = map.get(label);
      if (!list.includes(coffee)) list.push(coffee);
    });
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, cs]) => [label, cs.slice().sort((a, b) => a.name.localeCompare(b.name))]);
});

// ─── Processes ───────────────────────────────────────────────────────────────
// Every distinct primary processing method, most common first.
export const ALL_PROCESSES = (() => {
  const counts = new Map();
  coffees.forEach((c) => {
    counts.set(c.processes.primary, (counts.get(c.processes.primary) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([p]) => p);
})();

// True when an origin offers `process` as primary or among `also`.
export function originHasProcess(coffee, process) {
  return coffee.processes.primary === process || coffee.processes.also.includes(process);
}

// process → coffees[] (matches primary OR also)
export const PROCESS_INDEX = (() => {
  const map = new Map();
  coffees.forEach((coffee) => {
    [coffee.processes.primary, ...coffee.processes.also].forEach((process) => {
      if (!map.has(process)) map.set(process, []);
      if (!map.get(process).some((c) => c.name === coffee.name)) {
        map.get(process).push(coffee);
      }
    });
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([process, cs]) => [process, cs.slice().sort((a, b) => a.name.localeCompare(b.name))]);
})();

// ─── Catalog numbering ───────────────────────────────────────────────────────
// Each origin's stable specimen number: its position in the alphabetical list.
export const SORTED_BY_NAME = coffees.slice().sort((a, b) => a.name.localeCompare(b.name));
export const ORIGIN_NO = new Map(SORTED_BY_NAME.map((c, i) => [c.name, i + 1]));
export const sortedCoffeeNames = SORTED_BY_NAME.map((c) => c.name);
export const COFFEE_BY_NAME = new Map(coffees.map((c) => [c.name, c]));

export function pad2(n) {
  return String(n).padStart(2, "0");
}

// Index of an origin's strongest dimension (first on ties).
export function dominantDim(coffee) {
  return coffee.scores.indexOf(Math.max(...coffee.scores));
}

// ─── Similarity ──────────────────────────────────────────────────────────────
export function getSimilar(coffee, n = 3) {
  return coffees
    .filter((c) => c.name !== coffee.name)
    .map((c) => ({
      coffee: c,
      dist: Math.sqrt(c.scores.reduce((sum, s, i) => sum + (s - coffee.scores[i]) ** 2, 0)),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n)
    .map((d) => d.coffee);
}

// ─── PCA ─────────────────────────────────────────────────────────────────────
function computePCA2D(vectors) {
  const n = vectors.length, d = vectors[0].length;
  const means = Array.from({ length: d }, (_, j) => vectors.reduce((s, r) => s + r[j], 0) / n);
  const X = vectors.map((r) => r.map((v, j) => v - means[j]));
  const C = Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (__, j) => X.reduce((s, r) => s + r[i] * r[j], 0) / (n - 1))
  );
  function powerIter(M, seed) {
    let v = seed.slice();
    const norm = (w) => Math.sqrt(w.reduce((s, x) => s + x * x, 0)) || 1;
    v = v.map((x) => x / norm(v));
    for (let k = 0; k < 300; k++) {
      const mv = M.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
      v = mv.map((x) => x / norm(mv));
    }
    return v;
  }
  const pc1 = powerIter(C, [1, 0, 0, 0, 0, 0]);
  const ev1 = C.reduce((s, row, i) => s + pc1[i] * row.reduce((ss, c, j) => ss + c * pc1[j], 0), 0);
  const C2 = C.map((row, i) => row.map((val, j) => val - ev1 * pc1[i] * pc1[j]));
  const pc2 = powerIter(C2, [0, 1, 0, 0, 0, 0]);
  const projected = X.map((r) => [
    r.reduce((s, v, i) => s + v * pc1[i], 0),
    r.reduce((s, v, i) => s + v * pc2[i], 0),
  ]);
  return { projected, pc1, pc2 };
}

export const { projected: PCA_COORDS, pc1: PC1_LOAD, pc2: PC2_LOAD } =
  computePCA2D(coffees.map((c) => c.scores));

// PCA coordinates normalized to 0–1 on both axes (y up).
export const PCA_UNIT = (() => {
  const xs = PCA_COORDS.map((p) => p[0]);
  const ys = PCA_COORDS.map((p) => p[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  return PCA_COORDS.map(([x, y]) => [
    (x - xMin) / (xMax - xMin || 1),
    (y - yMin) / (yMax - yMin || 1),
  ]);
})();

export function pcAxisLabels(loadings) {
  const sorted = loadings
    .map((v, i) => ({ i, v, abs: Math.abs(v) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 2);
  const pos = sorted.filter((d) => d.v >= 0).map((d) => DIMS[d.i]).join(" · ") || "mixed";
  const neg = sorted.filter((d) => d.v < 0).map((d) => DIMS[d.i]).join(" · ") || "mixed";
  return { pos, neg };
}

export function pcaLabelText(name) {
  const overrides = {
    "Ethiopian Harrar":       "Eth. Harrar",
    "Jamaican Blue Mountain": "Jamaican",
    "Hawaiian Kona":          "Kona",
    "Papua New Guinea":       "Papua NG",
    "Sulawesi Toraja":        "Sulawesi",
    "Salvadoran Pacamara":    "Pacamara",
    "Congolese Kivu":         "Congolese",
    "St. Helena":             "St. Helena",
    "Filipino Barako":        "Barako",
    "Indian Monsoon":         "Monsoon",
    "Panama Geisha":          "Geisha",
  };
  return overrides[name] ?? name.split(" ")[0];
}

// Greedy label de-collision: tries 8 anchor positions per point, picks the one
// with the lowest overlap against labels already placed.
export function computeLabelPositions(pts, labels, { charW = 4.5, textH = 9, dotR = 7.5 } = {}) {
  const candidates = [
    { dx: dotR,  dy: 4,             anchor: "start"  },
    { dx: dotR,  dy: -5,            anchor: "start"  },
    { dx: -dotR, dy: 4,             anchor: "end"    },
    { dx: -dotR, dy: -5,            anchor: "end"    },
    { dx: 0,     dy: -(dotR + 2),   anchor: "middle" },
    { dx: 0,     dy: dotR + textH,  anchor: "middle" },
    { dx: dotR,  dy: 13,            anchor: "start"  },
    { dx: -dotR, dy: 13,            anchor: "end"    },
    { dx: 0,     dy: -(dotR + 12),  anchor: "middle" },
    { dx: 0,     dy: dotR + textH + 10, anchor: "middle" },
  ];
  // Every point's own mark is an obstacle too, so labels never sit on a dot.
  const marks = pts.map(({ cx, cy }) => ({ l: cx - 4, r: cx + 4, t: cy - 4, b: cy + 4 }));
  const placed = [...marks];
  return pts.map(({ cx, cy }, i) => {
    const w = labels[i].length * charW;
    let best = null, bestScore = Infinity;
    for (const c of candidates) {
      const tx = cx + c.dx, ty = cy + c.dy;
      const l = c.anchor === "start" ? tx : c.anchor === "end" ? tx - w : tx - w / 2;
      const r = l + w, t = ty - textH, b = ty;
      let score = 0;
      for (const p of placed) {
        score += Math.max(0, Math.min(r, p.r) - Math.max(l, p.l)) *
                 Math.max(0, Math.min(b, p.b) - Math.max(t, p.t));
      }
      if (score < bestScore) { bestScore = score; best = { c, l, r, t, b }; }
      if (score === 0) break;
    }
    placed.push(best);
    return { x: cx + best.c.dx, y: cy + best.c.dy, anchor: best.c.anchor };
  });
}

// ─── Roast ───────────────────────────────────────────────────────────────────
export function roastIndexOf(roast) {
  return ROAST_LEVELS.indexOf(roast);
}

// True when an origin's roast falls inside the selected range, widened by ±1
// so a single-level pick still surfaces adjacent roasts.
export function roastInRange(roast, range) {
  if (range == null) return true;
  const i = roastIndexOf(roast);
  if (i === -1) return false;
  return i >= range.lo - 1 && i <= range.hi + 1;
}

// ─── Shareable compare URL ───────────────────────────────────────────────────
// ?compare=Name1,Name2,Name3 — unknown names dropped, selection capped at 3.
export function readCompareFromURL() {
  if (typeof window === "undefined") return [];
  const param = new URLSearchParams(window.location.search).get("compare");
  if (!param) return [];
  const names = param.split(",").map((s) => decodeURIComponent(s.trim()));
  const seen = new Set();
  const valid = [];
  for (const name of names) {
    const c = COFFEE_BY_NAME.get(name);
    if (c && !seen.has(name)) { seen.add(name); valid.push(c); }
    if (valid.length === 3) break;
  }
  return valid;
}

export function writeCompareToURL(selected) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (selected.length > 0) {
    url.searchParams.set("compare", selected.map((c) => encodeURIComponent(c.name)).join(","));
  } else {
    url.searchParams.delete("compare");
  }
  window.history.replaceState(null, "", url);
}
