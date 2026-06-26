"""Phase B: a scalable vector world map drawn from Natural Earth data (public domain).

Draws ocean + land + country borders + a timezone grid with Pillow at the target
resolution (supersampled for smooth coastlines). No raster ThinkPad artwork is used,
so the result is crisp at any resolution and fully theme-able (blue / dark / custom)
— and cleanly licensed (Natural Earth is public domain).

Projection is plain equirectangular: lon -180..180 across the width, lat
`lat_top`..`lat_bottom` down the height. The same mapping is used for the terminator
and city clocks (see render.equirect_projection), so everything lines up exactly.
"""
import functools
import json
import os

from PIL import Image, ImageDraw

GEO_DIR = os.path.join(os.path.dirname(__file__), "geodata")

# Rings lying entirely south of this latitude are dropped (Antarctica) so the map's
# bottom is clean ocean, symmetric with the Arctic-ocean top.
ANTARCTICA_LAT = -55.0


@functools.lru_cache(maxsize=4)
def _outer_rings(filename):
    """Outer rings of every polygon in a GeoJSON file: list of [(lon, lat), ...].

    Holes are ignored (negligible at 110m; e.g. the Caspian reads as land).
    """
    with open(os.path.join(GEO_DIR, filename)) as f:
        gj = json.load(f)
    rings = []
    for feat in gj["features"]:
        geom = feat["geometry"]
        coords = geom["coordinates"]
        polys = [coords] if geom["type"] == "Polygon" else coords
        for poly in polys:
            if poly:
                rings.append(poly[0])
    return rings


def build_base(out_w, out_h, theme, font, to_px, ss=2):
    """Render the vector world map base (ocean, land, borders, timezone grid).

    `to_px(lon, lat) -> (x, y)` is the output-space projection (supplied by render so the
    map, terminator and clocks share one mapping). `theme` provides
    ocean/land/border/grid/grid_label colours. `ss` is the supersampling factor.
    The whole canvas is filled with ocean first, so any vertical margins (from an
    undistorted projection on a wide screen) read as seamless ocean, not letterbox bars.
    """
    W, H = out_w * ss, out_h * ss
    img = Image.new("RGBA", (W, H), tuple(theme["ocean"]) + (255,))
    d = ImageDraw.Draw(img)

    def px(lon, lat):
        x, y = to_px(lon, lat)
        return x * ss, y * ss

    # Drop Antarctica — its polygon has a straight -90 data edge that reads as an ugly
    # cut-off line. Skip any ring lying entirely below this latitude.
    def keep(ring):
        return max(lat for _lon, lat in ring) >= ANTARCTICA_LAT

    # Land fill.
    land = tuple(theme["land"]) + (255,)
    for ring in _outer_rings("ne_110m_land.geojson"):
        if keep(ring):
            d.polygon([px(lon, lat) for lon, lat in ring], fill=land)

    # Country borders (thin strokes).
    border = tuple(theme["border"]) + (255,)
    bw = max(1, round(ss))
    for ring in _outer_rings("ne_110m_admin_0_countries.geojson"):
        if not keep(ring):
            continue
        pts = [px(lon, lat) for lon, lat in ring]
        d.line(pts + [pts[0]], fill=border, width=bw)

    # Timezone grid: a vertical line every 15° (one hour).
    grid = tuple(theme["grid"])
    for off in range(-12, 13):
        x = px(off * 15, 0.0)[0]
        d.line([(x, 0), (x, H)], fill=grid, width=max(1, ss))

    img = img.resize((out_w, out_h), Image.LANCZOS)

    # Per-column UTC-offset labels, drawn at native res (after downscale) for crisp text.
    d2 = ImageDraw.Draw(img)
    label_col = tuple(theme["grid_label"])
    for off in range(-12, 13):
        x = to_px(off * 15, 0.0)[0]
        text = "0" if off == 0 else f"{off:+d}"
        d2.text((x, out_h - 3), text, anchor="ms", font=font, fill=label_col)

    return img
