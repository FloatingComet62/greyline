# Changelog

All notable changes to greyline are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-07-22

### Added
- **Generic `command` backend** for desktops without a native backend — GNOME, KDE Plasma,
  XFCE, and anything else with a CLI wallpaper-setter. greyline renders a PNG and runs a
  user-supplied shell command with `{path}` (the PNG) and `{output}` (the output name)
  substituted. Configure with `backend = "command"` + `command = "..."` (and optional
  `resolution = "WxH"`), or `--backend command --command '...'`. It **replaces** the desktop
  wallpaper (it is not an overlay). Opt-in only — not part of backend auto-detection.
- README "Desktop environments" section with copy-paste GNOME/KDE/XFCE recipes (flagged
  best-effort / community-verified).
- GitHub issue templates, including a structured **desktop-compatibility report** to help
  verify and fix the DE recipes.

### Changed
- Factored xrandr output enumeration out of the `x11` backend into a shared
  `backends/_util.py` helper (reused by the new `command` backend).

## [0.1.0] — 2026-07-21

### Added
- Initial public release; published to [PyPI](https://pypi.org/project/greyline/)
  (`pipx install greyline` / `uvx greyline`).
- Live world-time wallpaper: vector world map (Natural Earth), multi-timezone clocks with
  accurate DST via `zoneinfo`, an analytic day/night terminator with twilight bands, and an
  accented home city.
- Backends: `sway`, `swww`, `hyprpaper`, `x11` (feh/xwallpaper), auto-detected.
- Nix flake + home-manager module; systemd user timer for once-a-minute rendering.

[0.2.0]: https://github.com/cothinking-dev/greyline/releases/tag/v0.2.0
[0.1.0]: https://github.com/cothinking-dev/greyline/releases/tag/v0.1.0
