// Day/night terminator math — near-verbatim port of sun.py (NOAA approximation).
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

export function subsolarPoint(date) {
  // `date` is a JS Date; we read its UTC fields.
  const y = date.getUTCFullYear();
  const doy = Math.floor((Date.UTC(y, date.getUTCMonth(), date.getUTCDate())
                          - Date.UTC(y, 0, 0)) / 86400000);  // 1-based day of year
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const g = 2 * Math.PI / 365 * (doy - 1 + (hour - 12) / 24);

  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.001480 * Math.sin(3 * g);
  const sublat = dec * R2D;

  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const minutesUtc = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  let sublon = (720 - (minutesUtc + eot)) / 4;
  sublon = (((sublon + 180) % 360) + 360) % 360 - 180;
  return [sublat, sublon];
}

export function boundaryLat(lon, sublat, sublon, elevation = 0) {
  const dec = sublat * D2R, h = (lon - sublon) * D2R, e = elevation * D2R;
  const a = Math.sin(dec), b = Math.cos(dec) * Math.cos(h);
  const r = Math.hypot(a, b);
  if (r < 1e-9) return 0;
  const arg = Math.max(-1, Math.min(1, Math.sin(e) / r));
  const lat = (Math.asin(arg) - Math.atan2(b, a)) * R2D;
  return Math.max(-90, Math.min(90, lat));
}

export const nightIsSouth = (sublat) => sublat > 0;
