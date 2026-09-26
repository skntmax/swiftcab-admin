function positiveInt(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback
}

export const AUTH_SESSION = {
  refreshIntervalMs: positiveInt(process.env.NEXT_PUBLIC_AUTH_REFRESH_INTERVAL_MS, 60 * 60 * 1000),
  idleMs: positiveInt(process.env.NEXT_PUBLIC_AUTH_IDLE_MS, 30 * 60 * 1000),
  idlePromptMs: positiveInt(process.env.NEXT_PUBLIC_AUTH_IDLE_PROMPT_MS, 60 * 1000),
  refreshTtlMs: positiveInt(process.env.NEXT_PUBLIC_AUTH_REFRESH_TTL_MS, 7 * 24 * 60 * 60 * 1000),
  accessTtlMs: positiveInt(process.env.NEXT_PUBLIC_AUTH_ACCESS_TTL_MS, 2 * 60 * 60 * 1000),
}

export function apiBaseUrl() {
  return String(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
}
