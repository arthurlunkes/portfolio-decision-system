import { computed, readonly, ref } from "vue";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "pds-theme";
const theme = ref<ThemeMode>("light");
let initialized = false;

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;

  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

function detectPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(mode: ThemeMode) {
  theme.value = mode;
  applyThemeClass(mode);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}

function toggleTheme() {
  setTheme(theme.value === "dark" ? "light" : "dark");
}

function initTheme() {
  if (initialized) return;

  theme.value = detectPreferredTheme();
  applyThemeClass(theme.value);
  initialized = true;
}

export function useTheme() {
  return {
    theme: readonly(theme),
    isDark: computed(() => theme.value === "dark"),
    initTheme,
    setTheme,
    toggleTheme,
  };
}