export const THEME_STORAGE_KEY = 'portfolio-theme'

export function normalizeTheme(preference) {
  return preference === 'light' || preference === 'dark' ? preference : 'system'
}

export function getThemePreference() {
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

function systemThemeQuery() {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)') || null
  } catch {
    return null
  }
}

export function applyTheme(preference) {
  const theme = normalizeTheme(preference)
  const resolved = theme === 'system' ? (systemThemeQuery()?.matches ? 'dark' : 'light') : theme
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolved
    document.documentElement.style.colorScheme = resolved
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#161616' : '#ffffff')
  }
  return resolved
}

export function saveThemePreference(preference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizeTheme(preference))
  } catch {
    // The control continues to work when storage is unavailable.
  }
}

export function watchSystemTheme(onChange) {
  const query = systemThemeQuery()
  if (!query) return () => {}
  if (query.addEventListener) {
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }
  if (query.addListener) {
    query.addListener(onChange)
    return () => query.removeListener(onChange)
  }
  return () => {}
}
