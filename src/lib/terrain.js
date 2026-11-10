// ─── Flavor terrain ──────────────────────────────────────────────────────────
// Turns the 32 origins' PCA positions into a topographic surface (one gaussian
// peak per origin, height = total flavor expression) and traces its contour
// lines with marching squares. Pure JS, no dependencies; a few ms per call and
// memoized per size. Where profiles converge, peaks merge into ridges: the
// map literally shows which coffees taste alike.
import { coffees } from "../coffeeData";
import { PCA_UNIT } from "./data";

// Marching-squares edge pairs per case. Edges: t(op) r(ight) b(ottom) l(eft).
const CASES = {
  1: [["l", "b"]], 2: [["b", "r"]], 3: [["l", "r"]], 4: [["t", "r"]],
  5: [["l", "t"], ["b", "r"]], 6: [["t", "b"]], 7: [["l", "t"]],
  8: [["l", "t"]], 9: [["t", "b"]], 10: [["t", "r"], ["l", "b"]],
  11: [["t", "r"]], 12: [["l", "r"]], 13: [["b", "r"]], 14: [["l", "b"]],
};

const SUMS = coffees.map((c) => c.scores.reduce((s, v) => s + v, 0));
const SUM_MIN = Math.min(...SUMS);
const SUM_MAX = Math.max(...SUMS);

// Map unit PCA coords into a padded box (y flipped: up = higher PC2).
export function placePeaks(width, height, pad) {
  const padX = typeof pad === "number" ? pad : pad.x;
  const padY = typeof pad === "number" ? pad : pad.y;
  return PCA_UNIT.map(([u, v], i) => ({
    x: padX + u * (width - 2 * padX),
    y: height - padY - v * (height - 2 * padY),
    h: 0.62 + 0.38 * ((SUMS[i] - SUM_MIN) / (SUM_MAX - SUM_MIN || 1)),
  }));
}

function smoothPath(pts, closed) {
  const r = (n) => Math.round(n * 10) / 10;
  if (pts.length < 3) return `M${pts.map((p) => `${r(p[0])} ${r(p[1])}`).join("L")}`;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = "";
  if (closed) {
    const m0 = mid(pts[pts.length - 1], pts[0]);
    d = `M${r(m0[0])} ${r(m0[1])}`;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], m = mid(p, pts[(i + 1) % pts.length]);
      d += `Q${r(p[0])} ${r(p[1])} ${r(m[0])} ${r(m[1])}`;
    }
    return d + "Z";
  }
  d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const m = mid(pts[i], pts[i + 1]);
    d += `Q${r(pts[i][0])} ${r(pts[i][1])} ${r(m[0])} ${r(m[1])}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${r(last[0])} ${r(last[1])}`;
}

const cache = new Map();

/**
 * @param {number} width, height  SVG user-space size
 * @param {object} opts  pad (px or {x,y}), res (grid px), sigma (fraction of
 *                       the shorter side), levels (count)
 * @returns {{ peaks, contours: {d, index}[] }}
 */
export function buildTerrain(width, height, { pad = 60, res = 6, sigma = 0.055, levels = 12 } = {}) {
  const key = [width, height, JSON.stringify(pad), res, sigma, levels].join("|");
  if (cache.has(key)) return cache.get(key);

  const peaks = placePeaks(width, height, pad);
  const s = sigma * Math.min(width, height) * 1.25;
  const twoS2 = 2 * s * s;
  const cols = Math.ceil(width / res) + 1;
  const rows = Math.ceil(height / res) + 1;

  // Sample the field.
  const field = new Float32Array(cols * rows);
  let max = 0;
  for (let j = 0; j < rows; j++) {
    const y = j * res;
    for (let i = 0; i < cols; i++) {
      const x = i * res;
      let v = 0;
      for (const p of peaks) {
        const dx = x - p.x, dy = y - p.y;
        v += p.h * Math.exp(-(dx * dx + dy * dy) / twoS2);
      }
      // Low, broad undulation so the ground between peaks reads as land.
      v += 0.05 * (Math.sin(x / width * 5.1 + 1.3) * Math.cos(y / height * 4.3 - 0.7) + 1);
      // Saturating compression: dense clusters plateau into ridges instead of
      // one towering massif, so isolated origins still get their own rings.
      v = 1 - Math.exp(-1.35 * v);
      field[j * cols + i] = v;
      if (v > max) max = v;
    }
  }

  const at = (i, j) => field[j * cols + i];
  const contours = [];

  for (let li = 0; li < levels; li++) {
    const L = max * (0.1 + (0.86 * li) / (levels - 1));
    const pts = new Map();     // edgeKey → [x, y]
    const adj = new Map();     // edgeKey → neighbour keys
    const link = (a, b) => {
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      adj.get(a).push(b);
      adj.get(b).push(a);
    };
    const edgePoint = (i, j, e) => {
      // Edge keys are shared between neighbouring cells.
      let k, x, y;
      if (e === "t" || e === "b") {
        const jj = e === "t" ? j : j + 1;
        k = `h${i},${jj}`;
        if (!pts.has(k)) {
          const a = at(i, jj), b = at(i + 1, jj);
          const t = (L - a) / (b - a || 1e-9);
          x = (i + t) * res; y = jj * res;
          pts.set(k, [x, y]);
        }
      } else {
        const ii = e === "l" ? i : i + 1;
        k = `v${ii},${j}`;
        if (!pts.has(k)) {
          const a = at(ii, j), b = at(ii, j + 1);
          const t = (L - a) / (b - a || 1e-9);
          x = ii * res; y = (j + t) * res;
          pts.set(k, [x, y]);
        }
      }
      return k;
    };

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const c =
          (at(i, j) >= L ? 8 : 0) | (at(i + 1, j) >= L ? 4 : 0) |
          (at(i + 1, j + 1) >= L ? 2 : 0) | (at(i, j + 1) >= L ? 1 : 0);
        const segs = CASES[c];
        if (!segs) continue;
        for (const [e1, e2] of segs) link(edgePoint(i, j, e1), edgePoint(i, j, e2));
      }
    }

    // Chain segments into polylines: open chains first (degree-1 ends at the
    // border), then closed loops.
    const seen = new Set();
    let d = "";
    const walk = (start) => {
      const chain = [start];
      seen.add(start);
      let cur = start;
      for (;;) {
        const next = (adj.get(cur) || []).find((n) => !seen.has(n));
        if (!next) break;
        seen.add(next);
        chain.push(next);
        cur = next;
      }
      const closed = chain.length > 2 && (adj.get(cur) || []).includes(start);
      if (chain.length > 1) d += smoothPath(chain.map((k) => pts.get(k)), closed);
    };
    for (const [k, n] of adj) if (n.length === 1 && !seen.has(k)) walk(k);
    for (const k of adj.keys()) if (!seen.has(k)) walk(k);

    if (d) contours.push({ d, index: li % 4 === 2 });
  }

  const out = { peaks, contours };
  cache.set(key, out);
  return out;
}
