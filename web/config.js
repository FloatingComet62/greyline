// Themes (port of render.py THEMES) + the default 10 cities (default-config.toml).
// Colours are [r,g,b] or [r,g,b,a] (a is 0–255); use rgba() to get a canvas string.

export const THEMES = {
  dark: {
    night: [2, 4, 8], text: [220, 224, 235], text_stroke: [0, 0, 0, 220],
    dot: [170, 185, 220], dot_outline: [0, 0, 0, 210],
    home: [255, 209, 64], home_stroke: [30, 24, 0, 220], column: [255, 255, 255, 20],
    ocean: [11, 14, 20], land: [30, 34, 43], border: [74, 82, 100],
    grid: [255, 255, 255, 48], grid_label: [130, 138, 158], idl: [208, 72, 72],
    gmt: [88, 184, 128, 52], day_wash: [140, 165, 220, 18], night_alpha: 12,
  },
  blue: {
    night: [6, 12, 34], text: [226, 232, 255], text_stroke: [4, 8, 26, 220],
    dot: [210, 220, 255], dot_outline: [4, 8, 26, 200],
    home: [255, 70, 70], home_stroke: [40, 0, 0, 220], column: [255, 255, 255, 26],
    ocean: [61, 97, 210], land: [42, 71, 160], border: [120, 150, 230],
    grid: [255, 255, 255, 38], grid_label: [200, 210, 255], idl: [224, 60, 60],
    gmt: [90, 220, 130, 64], day_wash: [255, 255, 255, 10],
  },
};

// Per-band overlay alpha by darkness preset (render.py DARKNESS_ALPHA).
export const DARKNESS_ALPHA = { subtle: 28, medium: 40, dramatic: 55 };

export const CITIES = [
  { name: "San Francisco", lat: 37.77, lon: -122.42, tz: "America/Los_Angeles" },
  { name: "New York", lat: 40.71, lon: -74.01, tz: "America/New_York" },
  { name: "Buenos Aires", lat: -34.61, lon: -58.38, tz: "America/Argentina/Buenos_Aires" },
  { name: "London", lat: 51.51, lon: -0.13, tz: "Europe/London" },
  { name: "Paris", lat: 48.85, lon: 2.35, tz: "Europe/Paris" },
  { name: "Moscow", lat: 55.76, lon: 37.62, tz: "Europe/Moscow" },
  { name: "Beijing", lat: 39.90, lon: 116.41, tz: "Asia/Shanghai" },
  { name: "Tokyo", lat: 35.68, lon: 139.69, tz: "Asia/Tokyo" },
  { name: "Jakarta", lat: -6.21, lon: 106.85, tz: "Asia/Jakarta" },
  { name: "Sydney", lat: -33.87, lon: 151.21, tz: "Australia/Sydney" },
];

export const rgba = (c) => `rgba(${c[0]},${c[1]},${c[2]},${(c.length > 3 ? c[3] : 255) / 255})`;
export const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

// Wall-clock parts for a city, via the browser's IANA database (replaces zoneinfo).
function parts(tz, date) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date).reduce((a, x) => (a[x.type] = x.value, a), {});
  if (p.hour === "24") p.hour = "00";
  return p;
}

// UTC offset (hours, may be fractional e.g. 5.75) of a tz at `date` — for the home column.
export function tzOffsetHours(tz, date) {
  const p = parts(tz, date);
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 3600000;
}

// City clock label lines: [name, "HH:MM" or "H:MM AM/PM"] (render.py _fmt_time).
export function labelLines(city, date, fmt) {
  const p = parts(city.tz, date);
  let time;
  if (fmt === "12h") {
    const h = +p.hour % 12 || 12;
    time = `${h}:${p.minute} ${+p.hour < 12 ? "AM" : "PM"}`;
  } else {
    time = `${p.hour}:${p.minute}`;
  }
  return [city.name, time];
}
