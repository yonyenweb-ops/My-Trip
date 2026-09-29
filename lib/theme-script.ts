// Shared by the inline <head> script (runs before first paint, so there's no flash)
// and by lib/theme.ts. Kept free of "use client" so the server layout can import it.

export const THEME_KEY = "trip-money-theme";
export const THEME_COLORS = { light: "#f5f7f6", dark: "#172033" };

export const THEME_SCRIPT = `(function(){
  var t = "light";
  try { t = localStorage.getItem("${THEME_KEY}") || "light"; } catch (e) {}
  var d = document.documentElement;
  d.dataset.theme = t;
  var dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = dark ? "${THEME_COLORS.dark}" : "${THEME_COLORS.light}";
})();`;
