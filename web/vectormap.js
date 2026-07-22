// Vector world map base — port of vectormap.py:build_base to canvas.
// Canvas path fills/strokes are anti-aliased, so the Python supersample (ss=2) is dropped.
import { rgb, rgba } from "./config.js";

const FILES = [
  "ne_110m_land.geojson",
  "ne_110m_admin_0_countries.geojson",
  "ne_10m_time_zones.geojson",
  "ne_10m_geographic_lines.geojson",
];
const POLAR_CAP_LAT = 89.0, SEAM_LON = 179.5;

let cache = null;

export async function loadGeo(base = "./data/") {
  if (cache) return cache;
  const [land, countries, zones, lines] = await Promise.all(
    FILES.map((f) => fetch(base + f).then((r) => r.json())));
  cache = {
    land: outerRings(land),
    countries: outerRings(countries),
    zones: zoneFeatures(zones),
    dateLine: namedLines(lines, "Date Line"),
  };
  return cache;
}

function outerRings(gj) {
  const rings = [];
  for (const f of gj.features) {
    const g = f.geometry; if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const p of polys) if (p && p[0]) rings.push(p[0]);
  }
  return rings;
}
function zoneFeatures(gj) {
  const out = [];
  for (const f of gj.features) {
    const g = f.geometry; if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    out.push([f.properties.zone ?? null, polys.filter((p) => p && p[0]).map((p) => p[0])]);
  }
  return out;
}
function namedLines(gj, sub) {
  const segs = [];
  for (const f of gj.features) {
    if (!(f.properties.name || "").includes(sub)) continue;
    const g = f.geometry;
    if (g.type === "LineString") segs.push(g.coordinates);
    else for (const s of g.coordinates) segs.push(s);
  }
  return segs;
}

export function buildBase(ctx, w, h, theme, proj, geo, homeOffset, gridFontPx) {
  const px = (lon, lat) => proj.toPx(lon, lat);
  const dx = px(360, 0)[0] - px(0, 0)[0];

  function* wrapCopies(pts) {
    let lo = Infinity, hi = -Infinity;
    for (const p of pts) { if (p[0] < lo) lo = p[0]; if (p[0] > hi) hi = p[0]; }
    for (const k of [0, dx, -dx]) {
      if (hi + k < 0 || lo + k > w) continue;
      yield k ? pts.map(([x, y]) => [x + k, y]) : pts;
    }
  }
  const project = (ring) => ring.map(([lon, lat]) => px(lon, lat));
  const trace = (c) => { ctx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < c.length; i++) ctx.lineTo(c[i][0], c[i][1]); };

  ctx.fillStyle = rgb(theme.ocean); ctx.fillRect(0, 0, w, h);
  ctx.lineJoin = "round"; ctx.lineCap = "round";

  // land
  ctx.fillStyle = rgb(theme.land);
  for (const ring of geo.land) {
    const base = project(ring);
    for (const c of wrapCopies(base)) { ctx.beginPath(); trace(c); ctx.closePath(); ctx.fill(); }
  }
  // country borders
  ctx.strokeStyle = rgb(theme.border); ctx.lineWidth = 1;
  for (const ring of geo.countries) {
    const base = project(ring);
    for (const c of wrapCopies(base)) { ctx.beginPath(); trace(c); ctx.closePath(); ctx.stroke(); }
  }
  // GMT column + home column (fill the real zone polygons)
  const fillZone = (offset, color) => {
    ctx.fillStyle = rgba(color);
    for (const [zone, rings] of geo.zones) {
      if (zone === null || Math.abs(zone - offset) > 0.01) continue;
      for (const ring of rings) {
        const base = project(ring);
        for (const c of wrapCopies(base)) { ctx.beginPath(); trace(c); ctx.closePath(); ctx.fill(); }
      }
    }
  };
  fillZone(0, theme.gmt);
  if (homeOffset != null) fillZone(homeOffset, theme.column);

  // timezone grid — each zone polygon's meridional edges (skip polar caps + antimeridian seams)
  ctx.strokeStyle = rgba(theme.grid); ctx.lineWidth = 1;
  for (const [, rings] of geo.zones) {
    for (const ring of rings) {
      const n = ring.length, base = project(ring), keep = [];
      for (let i = 0; i < n; i++) {
        const [lon0, lat0] = ring[i], [lon1, lat1] = ring[(i + 1) % n];
        const cap = (lat0 >= POLAR_CAP_LAT && lat1 >= POLAR_CAP_LAT) || (lat0 <= -POLAR_CAP_LAT && lat1 <= -POLAR_CAP_LAT);
        const seam = Math.abs(lon0) >= SEAM_LON && Math.abs(lon1) >= SEAM_LON;
        keep.push(!(cap || seam));
      }
      for (const c of wrapCopies(base)) {
        let run = [];
        const flush = () => { if (run.length >= 2) { ctx.beginPath(); trace(run); ctx.stroke(); } run = []; };
        for (let i = 0; i < n; i++) {
          if (keep[i]) { if (!run.length) run = [c[i]]; run.push(c[(i + 1) % n]); }
          else flush();
        }
        flush();
      }
    }
  }
  // International Date Line (red)
  ctx.strokeStyle = rgb(theme.idl); ctx.lineWidth = 2;
  for (const seg of geo.dateLine) {
    const base = project(seg);
    for (const c of wrapCopies(base)) { ctx.beginPath(); trace(c); ctx.stroke(); }
  }
  // bottom UTC-offset labels
  ctx.fillStyle = rgb(theme.grid_label);
  ctx.font = `${gridFontPx}px system-ui, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  for (let off = -12; off <= 12; off++) {
    const x = px(off * 15, 0)[0];
    if (x < 0 || x > w) continue;
    ctx.fillText(off === 0 ? "0" : (off > 0 ? `+${off}` : `${off}`), x, h - 3);
  }
}
