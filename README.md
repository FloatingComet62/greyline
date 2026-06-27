# thinkpad_world_wallpaper_revived

A modern, **live** recreation of the classic IBM/ThinkPad **"World Time"** Active
Desktop wallpaper: a world map with **clocks for many cities**, your **home city**
highlighted, and a **day/night terminator** with twilight bands that tracks the sun.

It does *not* run a browser or any resident process. A tiny Python program renders a
PNG once a minute and hands it to your existing wallpaper mechanism — so it is
effectively free on battery.

```
systemd timer (*:*:00) ─▶ thinkpad-wallpaper (≈100 ms, then exits)
      render per output (Pillow): map + clocks + terminator
      └─▶ set wallpaper via the detected backend (sway/swww/hyprpaper/feh)
```

## Features

- **Multi-timezone clocks** placed at each city's real location; **accurate DST**
  worldwide via the OS IANA database (`zoneinfo`).
- **Home city** styled for contrast (accent dot + bold label + optional timezone-column
  highlight); auto-detected from the system timezone or pinned in config.
- **Analytic day/night terminator** — seasonally correct — with discrete **civil /
  nautical / astronomical twilight bands** (subtle by default, tunable).
- **Any resolution / multi-monitor / HiDPI** — each output rendered at native pixels.
- **Two map styles** — `raster` (the nostalgic ThinkPad artwork) or `vector` (drawn from
  public-domain **Natural Earth** data, crisp at any resolution, fully themeable; with
  honest zig-zag timezone boundaries, a green GMT column, and a red International Date
  Line, framed to match the raster).
- **Theming** — `thinkpad-blue` and a sleek `dark` preset, plus custom.
- **Smart label placement** — labels auto-pick a side (right/left/above/below) to avoid
  overlapping each other, the dots, the logo, and the screen edges.
- Optional **ThinkPad wordmark** (bottom-left), toggleable via `logo`.
- **Pluggable backends**, auto-detected: `sway`, `swww`, `hyprpaper`, `x11` (feh/xwallpaper).

## Install

### Nix (flake + home-manager) — recommended

```nix
# flake.nix inputs (private repo — needs a GitHub token / SSH access):
inputs.thinkpad-wallpaper.url = "github:cothinking-dev/thinkpad_world_wallpaper_revived";

# home-manager:
imports = [ inputs.thinkpad-wallpaper.homeManagerModules.default ];

services.thinkpad-wallpaper = {
  enable = true;
  backend = "sway";              # or "auto"
  fontFamily = "Aporetic Sans";  # resolved via fontconfig
  settings = {
    theme = "thinkpad-blue";
    format = "24h";
    twilight = { bands = true; darkness = "subtle"; };
    home = { tz = "auto"; column_highlight = true; };  # "auto" = system tz
    city = [
      { name = "Kuala Lumpur"; lat = 3.14;  lon = 101.69; tz = "Asia/Kuala_Lumpur"; }
      { name = "London";       lat = 51.51; lon = -0.13;  tz = "Europe/London"; }
      { name = "New York";     lat = 40.71; lon = -74.01; tz = "America/New_York"; }
      { name = "Tokyo";        lat = 35.68; lon = 139.69; tz = "Asia/Tokyo"; }
    ];
  };
};
```

Try it without installing: `nix run github:cothinking-dev/thinkpad_world_wallpaper_revived -- --list-outputs`

### pipx (other distros)

```sh
pipx install thinkpad-world-wallpaper-revived      # dep: Pillow only
mkdir -p ~/.config/thinkpad-wallpaper
# edit ~/.config/thinkpad-wallpaper/config.toml (see worldtime/default-config.toml)
systemctl --user enable --now thinkpad-wallpaper.timer   # see systemd/ units
```

## Configuration

Non-Nix users edit `~/.config/thinkpad-wallpaper/config.toml`; the shipped
`worldtime/default-config.toml` is the documented template. Keys: `backend`, `theme`,
`format` (`24h`/`12h`), `[twilight] bands/darkness`,
`[home] tz/column_highlight`, and a `[[city]]` list (`name`, `lat`, `lon`, `tz`).

## CLI

```
thinkpad-wallpaper                 # render all outputs and apply (what the timer runs)
thinkpad-wallpaper --list-outputs  # show detected backend + outputs
thinkpad-wallpaper --out wt.png --res 1920x1200   # render a PNG, no backend
thinkpad-wallpaper --backend swww  # force a backend
```

## How it works

- `geo.py` — lon/lat → pixel affine, least-squares calibrated (`reference/calibrate.py`)
  from the original wallpaper's city offsets (the map is equirectangular).
- `sun.py` — subsolar point + terminator/twilight boundary latitudes.
- `render.py` — composites the overlays in the map's 1400×1050 frame, cover-crops to the
  output (keeping the hour labels), then draws clocks at native resolution.
- `backends/` — the only platform-specific code; everything else is portable.

## Roadmap

- **Done — vector map (Phase B):** `map_style = "vector"` draws the world from
  public-domain Natural Earth data (no IBM/Lenovo artwork), crisp at any resolution,
  with `thinkpad-blue` / `dark` / custom themes. It is the cleanly-licensed alternative
  to the default `raster` map for redistribution (see `NOTICE`).
- Windows / macOS backends.

## Credits & license

GPL-2.0-or-later. Descends from Maxim Proskurnya's GPL "World Time Wallpaper" tribute;
original concept/artwork © IBM/Lenovo. **The bundled raster map is IBM/Lenovo artwork —
see `NOTICE` before publishing this repo.**
