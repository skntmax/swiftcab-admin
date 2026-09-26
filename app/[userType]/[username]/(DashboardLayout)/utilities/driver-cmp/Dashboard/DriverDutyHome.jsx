'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import {
  useDriverDashboardMutation,
  useDriverLiveCabsMutation,
  useDriverPlatformGetMutation,
  useDriverPlatformSaveMutation,
} from '@app/libs/apis/driver'
import ActiveRidePanel from './ActiveRidePanel'
import {
  glassCard,
  driverMapPrimaryBtn,
  driverMapOutlinedBtn,
  driverMapSosBtn,
} from './driverMapUi'

const DriverOlaMap = dynamic(() => import('@components/Map/DriverOlaMap'), { ssr: false })

function DriverDutyHome({
  userName,
  socket,
  rideClaimed,
  selectedRide,
  driverPoint,
  pickupPoint,
  dropPoint,
  offerCount = 0,
  rideStarted = false,
  cancelling = false,
  cancelCompleted = false,
  onCancelRide,
  onEnterOtp,
  onEndRide,
  ending = false,
}) {
  const pathname = usePathname()
  const [loadDashboard, { data, isLoading }] = useDriverDashboardMutation()
  const [loadLiveCabs, { data: liveCabsData }] = useDriverLiveCabsMutation()
  const [loadPlatform] = useDriverPlatformGetMutation()
  const [savePlatform, { isLoading: sosBusy }] = useDriverPlatformSaveMutation()
  const [nearbyDrivers, setNearbyDrivers] = useState([])
  const [advisorTip, setAdvisorTip] = useState('')
  const [sosMessage, setSosMessage] = useState('')
  const copilotLoaded = useRef(false)

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    const lat = driverPoint?.lat
    const lng = driverPoint?.lng
    if (!lat || !lng) {
      return undefined
    }
    const fetchNearby = () => {
      loadLiveCabs({ lat, lng })
    }
    fetchNearby()
    const timer = setInterval(fetchNearby, 7000)
    return () => clearInterval(timer)
  }, [driverPoint?.lat, driverPoint?.lng, loadLiveCabs])

  useEffect(() => {
    const drivers = liveCabsData?.data?.drivers || liveCabsData?.drivers
    if (!Array.isArray(drivers)) {
      setNearbyDrivers([])
      return
    }
    setNearbyDrivers(
      drivers
        .filter((cab) => cab?.username && cab.username !== userName)
        .map((cab) => ({
          username: cab.username,
          lat: Number(cab.lat),
          lng: Number(cab.lng),
          map_icon: cab.map_icon,
          map_icon_file: cab.map_icon_file,
          avatar: cab.avatar,
        }))
        .filter((cab) => Number.isFinite(cab.lat) && Number.isFinite(cab.lng)),
    )
  }, [liveCabsData, userName])

  useEffect(() => {
    if (copilotLoaded.current) return
    const lat = driverPoint?.lat
    const lng = driverPoint?.lng
    if (!lat || !lng) return
    copilotLoaded.current = true
    loadPlatform({ path: 'demand', params: { lat, lng } })
      .unwrap()
      .then((res) => {
        const payload = res?.data || res
        setAdvisorTip(payload?.suggestion || '')
      })
      .catch(() => {
        copilotLoaded.current = false
      })
  }, [driverPoint?.lat, driverPoint?.lng, loadPlatform])

  const sendDutySos = async () => {
    const confirmed = window.confirm(
      'Send SOS? This opens a support ticket with your last GPS. If you are in danger, also call local emergency services.',
    )
    if (!confirmed) return
    try {
      const res = await savePlatform({
        path: 'sos',
        body: {
          lat: driverPoint?.lat,
          lng: driverPoint?.lng,
          note: 'SOS from on-duty map',
        },
      }).unwrap()
      const payload = res?.data || res
      setSosMessage(payload?.message || 'SOS recorded')
    } catch (err) {
      setSosMessage(
        err?.data?.message || err?.data?.data || 'Could not send SOS. Call local emergency services.',
      )
    }
  }

  const payload = data?.data || {}
  const stats = payload.stats || {}
  const profile = payload.profile || {}
  const gpsReady = Boolean(driverPoint?.lat && driverPoint?.lng)
  const pickupName = selectedRide?.customerViewDetails?.pickup_name
  const dropName = selectedRide?.customerViewDetails?.drop_name
  const dutyLabel = rideStarted ? 'On trip' : rideClaimed ? 'Ride accepted' : 'On duty'
  const hrefFor = (tabs) => `${pathname}?tabs=${tabs}`

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#0b0b0b',
      }}
    >
      <DriverOlaMap
        driver={driverPoint}
        pickup={pickupPoint}
        drop={dropPoint}
        pickupName={pickupName}
        dropName={dropName}
        nearbyDrivers={nearbyDrivers}
      />

      <Box
        sx={{
          position: 'absolute',
          top: { xs: 12, md: 16 },
          left: { xs: 12, md: 16 },
          zIndex: 20,
          width: { xs: 'calc(100% - 24px)', sm: 340 },
          maxWidth: 360,
          ...glassCard,
          px: 2,
          py: 1.75,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            aria-hidden="true"
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: rideClaimed ? '#FBBF24' : '#22C55E',
              boxShadow: rideClaimed ? '0 0 0 4px rgba(251,191,36,0.25)' : '0 0 0 4px rgba(34,197,94,0.25)',
              '@keyframes dutyPulse': {
                '0%': { opacity: 1 },
                '100%': { opacity: 0.45 },
              },
              animation: 'dutyPulse 1.6s ease-in-out infinite',
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{dutyLabel}</Typography>
          <Chip
            size="small"
            label={gpsReady ? 'Live GPS' : 'Locating'}
            sx={{
              ml: 'auto',
              height: 22,
              bgcolor: gpsReady ? 'rgba(196,248,42,0.18)' : 'rgba(148,163,184,0.2)',
              color: gpsReady ? '#c4f82a' : '#fff',
              '& .MuiChip-label': { px: 1, fontSize: 11, fontWeight: 600 },
            }}
          />
        </Stack>

        <Typography sx={{ mt: 0.75, fontSize: 13, color: '#CBD5E1' }}>{userName}</Typography>
        <Typography sx={{ mt: 0.25, fontSize: 12, color: '#94A3B8' }}>
          {pickupName
            ? `Pickup · ${pickupName}`
            : offerCount > 0
              ? `${offerCount} ride offer${offerCount === 1 ? '' : 's'} waiting`
              : 'Waiting for ride requests'}
        </Typography>
        {dropName ? (
          <Typography sx={{ mt: 0.25, fontSize: 12, color: '#94A3B8' }}>Drop · {dropName}</Typography>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Kpi label="Today" value={isLoading ? '—' : `₹${stats.today_fare ?? 0}`} />
          <Kpi label="Upcoming" value={isLoading ? '—' : String(stats.upcoming ?? 0)} />
          <Kpi label="Wallet" value={isLoading ? '—' : `₹${profile.wallet_balance ?? 0}`} />
        </Stack>

        {advisorTip ? (
          <Typography sx={{ mt: 1.25, fontSize: 12, color: '#E2E8F0', lineHeight: 1.45 }}>
            {advisorTip}{' '}
            <Box component="span" sx={{ color: '#94A3B8' }}>Estimate.</Box>
          </Typography>
        ) : null}
        {sosMessage ? (
          <Typography sx={{ mt: 0.75, fontSize: 12, color: '#FCA5A5' }}>{sosMessage}</Typography>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} useFlexGap flexWrap="wrap">
          <Button
            component={Link}
            href={hrefFor('driver/dashboard/summary')}
            size="small"
            variant="contained"
            sx={driverMapPrimaryBtn}
          >
            Summary
          </Button>
          <Button
            component={Link}
            href={hrefFor('driver/platform/smart-earning')}
            size="small"
            variant="outlined"
            sx={driverMapOutlinedBtn}
          >
            Demand
          </Button>
          <Button
            component={Link}
            href={hrefFor('driver/platform/net-income')}
            size="small"
            variant="outlined"
            sx={driverMapOutlinedBtn}
          >
            Net
          </Button>
          <Button
            component={Link}
            href={hrefFor('driver/platform/copilot')}
            size="small"
            variant="outlined"
            sx={driverMapOutlinedBtn}
          >
            Advisor
          </Button>
          <Button
            type="button"
            size="small"
            variant="contained"
            disabled={sosBusy}
            onClick={sendDutySos}
            aria-label="Send emergency SOS"
            sx={driverMapSosBtn}
          >
            SOS
          </Button>
        </Stack>
      </Box>

      {rideClaimed && selectedRide ? (
        <ActiveRidePanel
          ride={selectedRide}
          socket={socket}
          driverPoint={driverPoint}
          pickupPoint={pickupPoint}
          dropPoint={dropPoint}
          rideStarted={rideStarted}
          cancelling={cancelling}
          cancelCompleted={cancelCompleted}
          ending={ending}
          onCancel={onCancelRide}
          onEnterOtp={onEnterOtp}
          onEndRide={onEndRide}
        />
      ) : (
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, md: 20 },
          left: { xs: 12, md: 16 },
          zIndex: 20,
          ...glassCard,
          px: 2,
          py: 1.25,
          maxWidth: 360,
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
          Stay on this map while waiting. Nearby live cabs refresh every few seconds. Open a tab from the sidebar for rides, documents, or support — On duty brings you back.
        </Typography>
      </Box>
      )}
    </Box>
  )
}

function Kpi({ label, value }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: 1,
        py: 0.75,
        borderRadius: 1.5,
        bgcolor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Typography sx={{ fontSize: 10, letterSpacing: 0.4, color: '#94A3B8', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mt: 0.25 }}>{value}</Typography>
    </Box>
  )
}

export default DriverDutyHome
