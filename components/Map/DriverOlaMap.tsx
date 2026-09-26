'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { OlaMaps } from 'olamaps-web-sdk'
import { vehicleTypeImageSrc } from '@utils/vehicleTypeIcon'

export type DriverMapPoint = {
  lat: number
  lng: number
}

type NearbyDriver = {
  username?: string
  lat: number
  lng: number
  map_icon?: string | null
  map_icon_file?: string | null
  avatar?: string | null
}

type DriverOlaMapProps = {
  driver?: DriverMapPoint | null
  pickup?: DriverMapPoint | null
  drop?: DriverMapPoint | null
  pickupName?: string
  dropName?: string
  nearbyDrivers?: NearbyDriver[]
}

type MarkerLike = {
  setLngLat: (lngLat: [number, number]) => MarkerLike
  remove?: () => void
}

type MapLike = {
  isStyleLoaded?: () => boolean
  setCenter?: (lngLat: [number, number]) => void
  easeTo?: (opts: { center: [number, number]; zoom?: number; duration?: number }) => void
  fitBounds?: (bounds: [[number, number], [number, number]], opts?: { padding?: number; duration?: number }) => void
  getSource?: (id: string) => { setData: (data: unknown) => void } | undefined
  addSource?: (id: string, source: unknown) => void
  addLayer?: (layer: unknown) => void
  getLayer?: (id: string) => unknown
  resize?: () => void
  remove?: () => void
}

const ROUTE_SOURCE = 'driver-route'
const ROUTE_LAYER = 'driver-route-layer'

function isUsablePoint(point: DriverMapPoint | null | undefined): point is DriverMapPoint {
  return Boolean(
    point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      !(point.lat === 0 && point.lng === 0),
  )
}

function nearbyCabElement(cab: NearbyDriver): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = 'width:56px;height:56px;cursor:default;'
  const src = vehicleTypeImageSrc(cab)
  const label = (cab.username || 'Cab').slice(0, 2).toUpperCase()
  if (src) {
    el.innerHTML = `
      <div style="
        width:56px;height:56px;
        display:flex;align-items:center;justify-content:center;
        filter:drop-shadow(0 4px 8px rgba(0,0,0,.35));
      ">
        <img src="${src}" alt="${label}" style="width:100%;height:100%;object-fit:contain;pointer-events:none;" />
      </div>
    `
    return el
  }
  el.innerHTML = `
    <div style="
      width:28px;height:28px;border-radius:50%;
      background:#2563eb;border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:10px;font-weight:700;
    ">${label}</div>
  `
  return el
}

function markerElement(label: string, color: string): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = 'width:32px;height:40px;cursor:default;'
  el.innerHTML = `
    <div style="position:relative;width:32px;height:40px;">
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.35);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:11px;font-weight:700;
      ">${label}</div>
    </div>
  `
  return el
}

/** Google / Ola encoded polyline → [lng, lat][] */
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    coordinates.push([lng / 1e5, lat / 1e5])
  }
  return coordinates
}

function boundsOf(points: DriverMapPoint[]): [[number, number], [number, number]] | null {
  const usable = points.filter(isUsablePoint)
  if (usable.length === 0) {
    return null
  }
  const lngs = usable.map((p) => p.lng)
  const lats = usable.map((p) => p.lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

function mapsUrl(point: DriverMapPoint, label?: string): string {
  const q = `${point.lat},${point.lng}`
  const name = label ? encodeURIComponent(label) : q
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&destination_place_id=&travelmode=driving&q=${name}`
}

function olaNavUrl(origin: DriverMapPoint, dest: DriverMapPoint): string {
  return `https://www.olamaps.io/navigate?lat=${dest.lat}&lng=${dest.lng}&origin=${origin.lat},${origin.lng}`
}

async function fetchOlaRoute(
  origin: DriverMapPoint,
  destination: DriverMapPoint,
): Promise<{ coords: [number, number][]; distanceKm: number | null; durationMin: number | null }> {
  const apiKey = process.env.NEXT_PUBLIC_OLAMAP_KEY
  const base = (process.env.NEXT_PUBLIC_OLA_API_URL || 'https://api.olamaps.io').replace(/\/+$/, '')
  const url = `${base}/routing/v1/directions?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&api_key=${apiKey}`
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) {
    throw new Error(`Ola directions ${res.status}`)
  }
  const json = await res.json()
  const route = json?.routes?.[0] || json?.data?.routes?.[0]
  const encoded = route?.overview_polyline || route?.geometry
  const coords = typeof encoded === 'string' && encoded.length > 0 ? decodePolyline(encoded) : []
  const meters = Number(route?.legs?.[0]?.distance || route?.distance)
  const seconds = Number(route?.legs?.[0]?.duration || route?.duration)
  return {
    coords,
    distanceKm: Number.isFinite(meters) ? meters / 1000 : null,
    durationMin: Number.isFinite(seconds) ? seconds / 60 : null,
  }
}

function upsertRoute(map: MapLike, coords: [number, number][]) {
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      },
    ],
  }
  const source = map.getSource?.(ROUTE_SOURCE)
  if (source) {
    source.setData(geojson)
    return
  }
  map.addSource?.(ROUTE_SOURCE, { type: 'geojson', data: geojson })
  if (!map.getLayer?.(ROUTE_LAYER)) {
    map.addLayer?.({
      id: ROUTE_LAYER,
      type: 'line',
      source: ROUTE_SOURCE,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#111111',
        'line-width': 5,
        'line-opacity': 0.9,
      },
    })
  }
}

const toolBtn: CSSProperties = {
  border: '1px solid #e4e4e7',
  background: '#fff',
  color: '#18181b',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}

export default function DriverOlaMap({
  driver,
  pickup,
  drop,
  pickupName,
  dropName,
  nearbyDrivers = [],
}: DriverOlaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const olaRef = useRef<OlaMaps | null>(null)
  const mapRef = useRef<MapLike | null>(null)
  const markersRef = useRef<{ driver?: MarkerLike; pickup?: MarkerLike; drop?: MarkerLike }>({})
  const nearbyMarkersRef = useRef<MarkerLike[]>([])
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number | null; durationMin: number | null } | null>(null)
  const [routeBusy, setRouteBusy] = useState(false)
  const [routeError, setRouteError] = useState('')
  const [follow, setFollow] = useState(true)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OLAMAP_KEY
    const container = containerRef.current
    if (!apiKey || !container) {
      return
    }

    const olaMaps = new OlaMaps({ apiKey })
    olaRef.current = olaMaps
    const mapInstance = olaMaps.init({
      style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
      container,
      center: [77.209, 28.6139],
      zoom: 14,
    })
    mapRef.current = mapInstance as MapLike
    const map = mapRef.current
    const paintSize = () => {
      map.resize?.()
    }
    requestAnimationFrame(paintSize)
    const resizeObserver = typeof ResizeObserver !== 'undefined' && container
      ? new ResizeObserver(paintSize)
      : null
    resizeObserver?.observe(container)
    window.addEventListener('resize', paintSize)

    return () => {
      window.removeEventListener('resize', paintSize)
      resizeObserver?.disconnect()
      try {
        markersRef.current.driver?.remove?.()
        markersRef.current.pickup?.remove?.()
        markersRef.current.drop?.remove?.()
        nearbyMarkersRef.current.forEach((marker) => marker.remove?.())
        nearbyMarkersRef.current = []
        mapRef.current?.remove?.()
      } catch {
        /* map already gone */
      }
      markersRef.current = {}
      mapRef.current = null
      olaRef.current = null
    }
  }, [])

  useEffect(() => {
    const mapInstance = mapRef.current
    const olaMaps = olaRef.current
    if (!mapInstance || !olaMaps) {
      return
    }

    const waitUntilReady = () => {
      if (!(mapInstance.isStyleLoaded && mapInstance.isStyleLoaded())) {
        window.setTimeout(waitUntilReady, 120)
        return
      }

      const upsert = (
        key: 'driver' | 'pickup' | 'drop',
        point: DriverMapPoint | null | undefined,
        label: string,
        color: string,
      ) => {
        if (!isUsablePoint(point)) {
          markersRef.current[key]?.remove?.()
          markersRef.current[key] = undefined
          return
        }
        const existing = markersRef.current[key]
        if (existing) {
          existing.setLngLat([point.lng, point.lat])
          return
        }
        markersRef.current[key] = olaMaps
          .addMarker({ element: markerElement(label, color), anchor: 'bottom', offset: [0, 0] })
          .setLngLat([point.lng, point.lat])
          .addTo(mapInstance) as MarkerLike
      }

      upsert('driver', driver, 'You', '#111111')
      upsert('pickup', pickup, 'P', '#16a34a')
      upsert('drop', drop, 'D', '#dc2626')

      if (follow && isUsablePoint(driver) && typeof mapInstance.easeTo === 'function') {
        mapInstance.easeTo({ center: [driver.lng, driver.lat], duration: 600 })
      } else if (follow && isUsablePoint(driver) && typeof mapInstance.setCenter === 'function') {
        mapInstance.setCenter([driver.lng, driver.lat])
      }
    }

    waitUntilReady()
  }, [driver?.lat, driver?.lng, pickup?.lat, pickup?.lng, drop?.lat, drop?.lng, follow])

  useEffect(() => {
    const mapInstance = mapRef.current
    const olaMaps = olaRef.current
    if (!mapInstance || !olaMaps) {
      return
    }
    const paintNearby = () => {
      if (!(mapInstance.isStyleLoaded && mapInstance.isStyleLoaded())) {
        window.setTimeout(paintNearby, 120)
        return
      }
      nearbyMarkersRef.current.forEach((marker) => marker.remove?.())
      nearbyMarkersRef.current = []
      nearbyDrivers.forEach((cab) => {
        if (!isUsablePoint(cab)) {
          return
        }
        const marker = olaMaps
          .addMarker({ element: nearbyCabElement(cab), anchor: 'bottom', offset: [0, 0] })
          .setLngLat([cab.lng, cab.lat])
          .addTo(mapInstance) as MarkerLike
        nearbyMarkersRef.current.push(marker)
      })
    }
    paintNearby()
  }, [nearbyDrivers])

  const recenter = () => {
    const map = mapRef.current
    if (!map || !isUsablePoint(driver)) {
      return
    }
    setFollow(true)
    map.easeTo?.({ center: [driver.lng, driver.lat], zoom: 15, duration: 500 })
    map.setCenter?.([driver.lng, driver.lat])
  }

  const fitTrip = () => {
    const map = mapRef.current
    const box = boundsOf([driver, pickup, drop].filter(Boolean) as DriverMapPoint[])
    if (!map || !box) {
      return
    }
    setFollow(false)
    map.fitBounds?.(box, { padding: 72, duration: 600 })
  }

  const drawRoute = async () => {
    const map = mapRef.current
    const origin = isUsablePoint(driver) ? driver : isUsablePoint(pickup) ? pickup : null
    const destination = isUsablePoint(pickup) && isUsablePoint(driver) ? pickup : drop
    if (!map || !origin || !isUsablePoint(destination)) {
      setRouteError('Need your GPS and a pickup to draw the route')
      return
    }
    setRouteBusy(true)
    setRouteError('')
    try {
      const result = await fetchOlaRoute(origin, destination)
      if (result.coords.length === 0) {
        setRouteError('No route from Ola Directions')
        return
      }
      upsertRoute(map, result.coords)
      setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin })
      setFollow(false)
      const box = boundsOf([origin, destination])
      if (box) {
        map.fitBounds?.(box, { padding: 72, duration: 600 })
      }
    } catch (err) {
      console.error(err)
      setRouteError('Ola Directions failed. Try Recenter or Navigate.')
    } finally {
      setRouteBusy(false)
    }
  }

  const navTarget = isUsablePoint(pickup) ? pickup : drop
  const navLabel = isUsablePoint(pickup) ? pickupName : dropName

  if (!process.env.NEXT_PUBLIC_OLAMAP_KEY) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#18181b', color: '#a1a1aa', fontSize: 14 }}>
        Set NEXT_PUBLIC_OLAMAP_KEY to show the live map
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: '100%' }} />
      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 16,
          zIndex: 15,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 220,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
          <button type="button" style={toolBtn} onClick={recenter}>
            My location
          </button>
          <button type="button" style={toolBtn} onClick={fitTrip}>
            Fit trip
          </button>
          <button type="button" style={toolBtn} onClick={drawRoute} disabled={routeBusy}>
            {routeBusy ? 'Routing…' : 'Ola route'}
          </button>
          {navTarget ? (
            <a
              href={mapsUrl(navTarget, navLabel)}
              target="_blank"
              rel="noreferrer"
              style={{ ...toolBtn, textDecoration: 'none' }}
            >
              Navigate
            </a>
          ) : null}
          {isUsablePoint(driver) && navTarget ? (
            <a
              href={olaNavUrl(driver, navTarget)}
              target="_blank"
              rel="noreferrer"
              style={{ ...toolBtn, textDecoration: 'none' }}
            >
              Ola nav
            </a>
          ) : null}
        </div>
        {routeInfo ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              color: '#3f3f46',
            }}
          >
            {routeInfo.distanceKm != null ? `${routeInfo.distanceKm.toFixed(1)} km` : 'Route'}
            {routeInfo.durationMin != null ? ` · ${Math.max(1, Math.round(routeInfo.durationMin))} min` : ''}
            <span style={{ color: '#71717a' }}> · Ola Directions</span>
          </div>
        ) : null}
        {routeError ? (
          <div style={{ background: '#fff', color: '#b91c1c', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
            {routeError}
          </div>
        ) : null}
      </div>
    </div>
  )
}
