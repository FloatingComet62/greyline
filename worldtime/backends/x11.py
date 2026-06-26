"""X11 backend — feh (preferred) or xwallpaper, single combined root image.

X11 has one root window, so per-output rendering isn't separable here; we report
the connected outputs for sizing but set them together via feh's per-output flags.
"""
import re
import shutil
import subprocess


def _tool():
    return shutil.which("feh") or shutil.which("xwallpaper")


def available():
    import os
    return bool(os.environ.get("DISPLAY")) and _tool() is not None


def outputs():
    result = []
    if shutil.which("xrandr"):
        raw = subprocess.run(
            ["xrandr", "--query"], capture_output=True, text=True
        ).stdout
        for line in raw.splitlines():
            m = re.match(r"([\w.-]+)\s+connected.*?(\d+)x(\d+)\+\d+\+\d+", line)
            if m:
                result.append({
                    "name": m.group(1),
                    "width": int(m.group(2)),
                    "height": int(m.group(3)),
                    "scale": 1.0,
                })
    if not result:
        result.append({"name": "default", "width": 1920, "height": 1080, "scale": 1.0})
    return result


def apply(name, png_path):
    tool = _tool()
    if tool and tool.endswith("feh"):
        subprocess.run([tool, "--bg-fill", png_path],
                       capture_output=True, text=True, check=True)
    elif tool:  # xwallpaper
        subprocess.run([tool, "--output", name, "--zoom", png_path],
                       capture_output=True, text=True, check=True)
