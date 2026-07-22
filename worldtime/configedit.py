"""Comment-preserving edits to the user's config.toml, for `greyline config` /
`greyline city` / `greyline init`.

Reading stays on stdlib tomllib (config.py); writing goes through tomlkit so the
heavily-commented default template keeps its comments and layout across edits, and
so [[city]] arrays-of-tables are handled correctly. All config writes funnel through
here (one path).
"""
import os
import shutil
import tempfile
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import tomlkit

from . import config

# Known enum/value constraints, checked before writing so `set` can't produce a
# config that renders wrong. Keys are dotted paths.
_ENUMS = {
    "theme": {"dark", "blue"},
    "format": {"24h", "12h"},
    "map_style": {"vector", "raster"},
    "backend": {"auto", "sway", "swww", "hyprpaper", "x11", "command"},
    "twilight.darkness": {"subtle", "medium", "dramatic"},
}


def ensure_config(path=None):
    """Return the user config path, creating it from the packaged default if absent."""
    path = path or config.user_config_path()
    if not os.path.isfile(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        shutil.copyfile(config.DEFAULT_CONFIG, path)
    return path


def _load(path):
    with open(path, "r") as f:
        return tomlkit.parse(f.read())


def _save(path, doc):
    # Atomic: write a sibling temp file then replace, so a crash never truncates config.
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".greyline-", suffix=".toml")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(tomlkit.dumps(doc))
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise


def _coerce(value):
    """Coerce a CLI string to bool/int/float/str, matching the config schema's types."""
    low = value.lower()
    if low in ("true", "false"):
        return low == "true"
    try:
        return int(value)
    except ValueError:
        pass
    try:
        return float(value)
    except ValueError:
        pass
    return value


def _validate(dotted, value):
    if dotted in _ENUMS and value not in _ENUMS[dotted]:
        allowed = ", ".join(sorted(_ENUMS[dotted]))
        raise ValueError(f"{dotted}: {value!r} is not one of: {allowed}")
    if dotted == "home.tz" and value != "auto":
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError):
            raise ValueError(f"home.tz: {value!r} is not a valid IANA timezone")


# --- public operations (each loads, mutates, saves) ---

def set_key(path, dotted, raw_value):
    """Set a (possibly nested) dotted key, e.g. 'twilight.darkness' -> 'medium'."""
    value = _coerce(raw_value)
    _validate(dotted, value)
    doc = _load(path)
    parts = dotted.split(".")
    node = doc
    for p in parts[:-1]:
        if p not in node or not isinstance(node[p], (dict, tomlkit.items.Table)):
            node[p] = tomlkit.table()
        node = node[p]
    node[parts[-1]] = value
    _save(path, doc)
    return value


def unset_key(path, dotted):
    """Remove a dotted key if present. Returns True if something was removed."""
    doc = _load(path)
    parts = dotted.split(".")
    node = doc
    for p in parts[:-1]:
        if p not in node:
            return False
        node = node[p]
    if parts[-1] in node:
        del node[parts[-1]]
        _save(path, doc)
        return True
    return False


def get_key(path, dotted):
    """Return the value at a dotted key from the merged effective config, or None."""
    cfg = config.load(path)
    node = cfg
    for p in dotted.split("."):
        if not isinstance(node, dict) or p not in node:
            return None
        node = node[p]
    return node


def list_cities(path):
    return config.load(path).get("city", [])


def add_city(path, name, lat, lon, tz, home=False, label_side=None):
    try:
        ZoneInfo(tz)
    except (ZoneInfoNotFoundError, ValueError):
        raise ValueError(f"{tz!r} is not a valid IANA timezone")
    doc = _load(path)
    if "city" not in doc:
        doc["city"] = tomlkit.aot()
    entry = tomlkit.table()
    entry["name"] = name
    entry["lat"] = float(lat)
    entry["lon"] = float(lon)
    entry["tz"] = tz
    if label_side:
        entry["label_side"] = label_side
    doc["city"].append(entry)
    if home:
        if "home" not in doc:
            doc["home"] = tomlkit.table()
        doc["home"]["tz"] = tz
    _save(path, doc)


def remove_city(path, name):
    """Remove cities matching name (case-insensitive). Returns the count removed."""
    doc = _load(path)
    cities = doc.get("city")
    if not cities:
        return 0
    keep = [c for c in cities if str(c.get("name", "")).lower() != name.lower()]
    removed = len(cities) - len(keep)
    if removed:
        new = tomlkit.aot()
        for c in keep:
            new.append(c)
        doc["city"] = new
    _save(path, doc)
    return removed
