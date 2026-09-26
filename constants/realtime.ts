/**
 * Keep in sync with `env/realtime.cjs` (monorepo root).
 * Driver ride-request stack + live-map timings used by the admin UI.
 */
export const REALTIME = {
  DRIVER_LIVE_STALE_SEC: 15 * 60,
  DRIVER_LIVE_RADIUS_KM: 5,
  RIDE_OFFER_POPUP_SEC: 10,
  RIDE_OFFER_STACK_MAX: 5,
} as const;

export const RIDE_OFFER_POPUP_MS = REALTIME.RIDE_OFFER_POPUP_SEC * 1000;
