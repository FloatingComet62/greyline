"""Command backend: availability gating, output sizing, and {path}/{output} substitution."""
import pytest

from worldtime.backends import command


def test_available_requires_command(monkeypatch):
    monkeypatch.delenv("GREYLINE_COMMAND", raising=False)
    assert command.available() is False
    monkeypatch.setenv("GREYLINE_COMMAND", "feh --bg-fill {path}")
    assert command.available() is True


def test_outputs_uses_explicit_resolution(monkeypatch):
    monkeypatch.setenv("GREYLINE_RESOLUTION", "2560x1440")
    outs = command.outputs()
    assert outs == [{"name": "screen", "width": 2560, "height": 1440, "scale": 1.0}]


def test_outputs_falls_back_to_default_without_xrandr(monkeypatch):
    monkeypatch.delenv("GREYLINE_RESOLUTION", raising=False)
    monkeypatch.setattr(command._util, "xrandr_outputs", lambda: [])
    outs = command.outputs()
    assert outs == [{"name": "screen", "width": 1920, "height": 1080, "scale": 1.0}]


def test_outputs_prefers_largest_xrandr_output(monkeypatch):
    monkeypatch.delenv("GREYLINE_RESOLUTION", raising=False)
    monkeypatch.setattr(command._util, "xrandr_outputs", lambda: [
        {"name": "HDMI-1", "width": 1920, "height": 1080, "scale": 1.0},
        {"name": "DP-1", "width": 3840, "height": 2160, "scale": 1.0},
    ])
    w, h = command.outputs()[0]["width"], command.outputs()[0]["height"]
    assert (w, h) == (3840, 2160)


def test_apply_substitutes_path_and_output(monkeypatch):
    calls = {}

    def fake_run(cmd, shell=False, check=False):
        calls["cmd"], calls["shell"], calls["check"] = cmd, shell, check

    monkeypatch.setenv("GREYLINE_COMMAND", "set-wp --output {output} --img {path}")
    monkeypatch.setattr(command.subprocess, "run", fake_run)
    command.apply("DP-1", "/run/greyline/DP-1.png")
    assert calls["cmd"] == "set-wp --output DP-1 --img /run/greyline/DP-1.png"
    assert calls["shell"] is True and calls["check"] is True


def test_apply_without_command_errors(monkeypatch):
    monkeypatch.delenv("GREYLINE_COMMAND", raising=False)
    with pytest.raises(RuntimeError):
        command.apply("screen", "/tmp/x.png")
