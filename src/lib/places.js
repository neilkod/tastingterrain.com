// Approximate center of each origin's principal growing district, for
// orientation only (the place named in the origin's own tasting notes where
// possible). Not a farm location. Latitude +N / −S, longitude +E / −W.
export const PLACES = {
  "Ethiopian":              { place: "Yirgacheffe",        lat: 6.16,   lon: 38.21 },
  "Colombian":              { place: "Huila",              lat: 2.53,   lon: -75.53 },
  "Kenyan":                 { place: "Nyeri",              lat: -0.42,  lon: 36.95 },
  "Sumatran":               { place: "Gayo Highlands",     lat: 4.62,   lon: 96.85 },
  "Brazilian":              { place: "Sul de Minas",       lat: -21.55, lon: -45.43 },
  "Guatemalan":             { place: "Antigua",            lat: 14.56,  lon: -90.73 },
  "Costa Rican":            { place: "Tarrazú",            lat: 9.66,   lon: -84.02 },
  "Yemeni":                 { place: "Bani Matar",         lat: 15.33,  lon: 43.95 },
  "Jamaican Blue Mountain": { place: "Blue Mountains",     lat: 18.05,  lon: -76.58 },
  "Hawaiian Kona":          { place: "Kona, Big Island",   lat: 19.52,  lon: -155.92 },
  "Vietnamese":             { place: "Đắk Lắk",            lat: 12.67,  lon: 108.04 },
  "Peruvian":               { place: "Cajamarca",          lat: -5.71,  lon: -78.81 },
  "Mexican":                { place: "Sierra Madre de Chiapas", lat: 15.40, lon: -92.50 },
  "Rwandan":                { place: "Lake Kivu shore",    lat: -2.33,  lon: 29.08 },
  "Indian Monsoon":         { place: "Malabar Coast",      lat: 12.87,  lon: 74.84 },
  "Panama Geisha":          { place: "Boquete",            lat: 8.78,   lon: -82.43 },
  "Burundian":              { place: "Kayanza",            lat: -2.92,  lon: 29.63 },
  "Tanzanian":              { place: "Kilimanjaro",        lat: -3.35,  lon: 37.34 },
  "Honduran":               { place: "Marcala",            lat: 14.15,  lon: -88.03 },
  "Papua New Guinea":       { place: "Wahgi Valley",       lat: -5.84,  lon: 144.35 },
  "Ethiopian Harrar":       { place: "Harar",              lat: 9.31,   lon: 42.12 },
  "Sulawesi Toraja":        { place: "Tana Toraja",        lat: -2.97,  lon: 119.90 },
  "Bolivian":               { place: "Caranavi, Yungas",   lat: -15.83, lon: -67.57 },
  "Salvadoran Pacamara":    { place: "Apaneca-Ilamatepec", lat: 13.86,  lon: -89.80 },
  "Congolese Kivu":         { place: "South Kivu",         lat: -2.50,  lon: 28.86 },
  "St. Helena":             { place: "St. Helena Island",  lat: -15.95, lon: -5.70 },
  "Ugandan":                { place: "Mt. Elgon",          lat: 1.33,   lon: 34.38 },
  "Nicaraguan":             { place: "Jinotega",           lat: 13.09,  lon: -86.00 },
  "Ecuadorian":             { place: "Loja",               lat: -4.00,  lon: -79.20 },
  "Flores":                 { place: "Bajawa",             lat: -8.79,  lon: 120.97 },
  "Myanmar":                { place: "Pyin Oo Lwin",       lat: 22.03,  lon: 96.46 },
  "Filipino Barako":        { place: "Batangas",           lat: 13.76,  lon: 121.06 },
};

export function formatCoord(lat, lon) {
  const la = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
  const lo = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
  return `${la} ${lo}`;
}

export function placeOf(name) {
  const p = PLACES[name];
  if (!p) return null;
  return { ...p, coord: formatCoord(p.lat, p.lon) };
}
