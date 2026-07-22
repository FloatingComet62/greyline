"""End-to-end smoke: both map styles produce an RGB image of the requested size."""
import os
from datetime import datetime, timezone

import pytest

from worldtime import render

CITIES = [
    {"name": "London", "lat": 51.51, "lon": -0.13, "tz": "Europe/London", "home": True},
    {"name": "Tokyo", "lat": 35.68, "lon": 139.69, "tz": "Asia/Tokyo", "home": False},
]
DT = datetime(2024, 6, 20, 9, 30, tzinfo=timezone.utc)


@pytest.mark.parametrize("style", ["raster", "vector"])
def test_render_returns_rgb_at_size(style):
    if style == "raster" and not os.path.isfile(render.BASE_1400):
        pytest.skip("raster map artwork not bundled (IBM/Lenovo art, see NOTICE)")
    img = render.render(CITIES, dt=DT, out_size=(480, 300), map_style=style)
    assert img.size == (480, 300)
    assert img.mode == "RGB"


def test_unknown_theme_falls_back():
    img = render.render(CITIES, dt=DT, out_size=(320, 200), theme="does-not-exist")
    assert img.size == (320, 200)


def test_hex_parsing_and_bad_values():
    assert render._hex("#e64553") == (230, 69, 83)
    assert render._hex("990000") == (153, 0, 0)  # no leading '#'
    assert render._hex("#fff") == (255, 255, 255)  # #rgb shorthand
    assert render._hex("000000") == (0, 0, 0)  # black is a real colour, not "unset"
    # Unparseable values return None (theme default) instead of raising.
    for bad in (None, 990000, "", "#ggg", "#12345", "notacolor"):
        assert render._hex(bad) is None


def test_logo_scale_shrinks_the_logo():
    from PIL import Image
    th = render.THEMES["dark"]
    full = render._draw_logo(Image.new("RGBA", (1000, 600)), th, render.LOGO_PNG,
                             logo_scale=1.0)
    half = render._draw_logo(Image.new("RGBA", (1000, 600)), th, render.LOGO_PNG,
                             logo_scale=0.5)
    w_full, w_half = full[2] - full[0], half[2] - half[0]
    assert w_half < w_full and abs(w_half - w_full / 2) <= 2
