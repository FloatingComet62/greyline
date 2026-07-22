// Projection — port of geo.py constants + render.py:_vector_projection.
// Full-globe equirectangular, centred at lon 12°, equator-centred; latitude uses the
// raster art's px-per-degree ratio (|BY|/|AX|) so continents keep their familiar shape.
export const REF_W = 1400, REF_H = 1050;
export const AX = 4.207694, BY = -5.260840;
export const VECTOR_LON_CENTER = 12.0, VECTOR_LAT_CENTER = 0.0;

export function makeProjection(w, h) {
  const ppdLon = w / 360;
  const ppdLat = ppdLon * (Math.abs(BY) / Math.abs(AX));
  const cx = w / 2, cy = h / 2;
  return {
    scale: w / REF_W,
    toPx: (lon, lat) => [cx + (lon - VECTOR_LON_CENTER) * ppdLon,
                         cy + (VECTOR_LAT_CENTER - lat) * ppdLat],
    xToLon: (x) => VECTOR_LON_CENTER + (x - cx) / ppdLon,
    latToY: (lat) => cy + (VECTOR_LAT_CENTER - lat) * ppdLat,
  };
}
