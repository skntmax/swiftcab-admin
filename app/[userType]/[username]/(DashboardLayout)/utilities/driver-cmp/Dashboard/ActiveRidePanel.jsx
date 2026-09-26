'use client'

import React, { useEffect, useState } from 'react'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import RideChatPanel from './RideChatPanel'
import {
  glassCard,
  driverMapPrimaryBtn,
  driverMapOutlinedBtn,
  driverMapDangerOutlinedBtn,
  driverMapGhostBtn,
  driverMapSosBtn,
} from './driverMapUi'

const CANCEL_REASONS = [
  'Customer not at pickup',
  'Customer asked me to cancel',
  'Vehicle issue',
  'Personal emergency',
  'Wrong pickup location',
  'Other',
]

function customerName(ride) {
  const user = ride?.userDetails || ride?.customer || {}
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return full || user.username || 'Customer'
}

function mapsDirUrl(origin, dest, label) {
  if (!dest?.lat || !dest?.lng) {
    return ''
  }
  const destination = `${dest.lat},${dest.lng}`
  const originPart =
    origin?.lat && origin?.lng ? `&origin=${origin.lat},${origin.lng}` : ''
  const name = label ? encodeURIComponent(label) : destination
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${originPart}&travelmode=driving&q=${name}`
}

function fareLabel(ride) {
  const raw = ride?.totalFare ?? ride?.customerViewDetails?.netActiveFare?.netFare
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) {
    return ''
  }
  const rupees = Number.isInteger(n) && n >= 1000 ? n / 100 : n
  return `₹${rupees}`
}

export default function ActiveRidePanel({
  ride,
  socket,
  driverPoint,
  pickupPoint,
  dropPoint,
  rideStarted = false,
  cancelling = false,
  cancelCompleted = false,
  ending = false,
  onCancel,
  onEnterOtp,
  onEndRide,
}) {
  const [panel, setPanel] = useState('actions')
  const [showChat, setShowChat] = useState(false)
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')

  useEffect(() => {
    if (cancelCompleted) {
      setPanel('actions')
      setReason('')
      setOtherReason('')
    }
  }, [cancelCompleted])

  if (!ride) {
    return null
  }

  const pickup = ride.customerViewDetails?.pickup_name || ride.pickup?.name || 'Pickup'
  const drop = ride.customerViewDetails?.drop_name || ride.destination?.name || 'Drop'
  const phone = ride.userDetails?.phone_no || ride.customer?.phone_no
  const statusLabel = rideStarted ? 'On trip' : 'Ride accepted'
  const navTarget = rideStarted ? dropPoint : pickupPoint
  const navLabel = rideStarted ? drop : pickup
  const navHref = mapsDirUrl(driverPoint, navTarget, navLabel)
  const fare = fareLabel(ride)

  const submitCancel = async () => {
    const finalReason = reason === 'Other' ? otherReason.trim() : reason
    if (!finalReason) {
      return
    }
    await onCancel?.(finalReason)
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        right: { xs: 12, md: 16 },
        bottom: { xs: 16, md: 20 },
        zIndex: 21,
        width: { xs: 'calc(100% - 24px)', sm: 360 },
        maxWidth: 380,
        ...glassCard,
        px: 2,
        py: 1.75,
      }}
    >
      <Typography sx={{ fontSize: 11, letterSpacing: 0.5, color: '#c4f82a', textTransform: 'uppercase', fontWeight: 700 }}>
        {statusLabel}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 700, fontSize: 16 }}>{customerName(ride)}</Typography>
      {phone ? (
        <Typography sx={{ mt: 0.25, fontSize: 12, color: '#94A3B8' }}>{phone}</Typography>
      ) : null}
      <Typography sx={{ mt: 1, fontSize: 13, color: '#E2E8F0' }}>Pickup · {pickup}</Typography>
      <Typography sx={{ mt: 0.25, fontSize: 13, color: '#E2E8F0' }}>Drop · {drop}</Typography>
      {fare ? (
        <Typography sx={{ mt: 0.5, fontSize: 13, color: '#c4f82a', fontWeight: 700 }}>{fare}</Typography>
      ) : null}

      {showChat && socket && ride?.rideId ? (
        <RideChatPanel
          socket={socket}
          rideId={ride.rideId}
          onClose={() => setShowChat(false)}
        />
      ) : null}

      {panel === 'actions' ? (
        <Box sx={{ mt: 1.5 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {phone ? (
              <Button
                size="small"
                component="a"
                href={`tel:${phone}`}
                variant="outlined"
                sx={driverMapOutlinedBtn}
              >
                Call
              </Button>
            ) : null}
            {socket && ride?.rideId ? (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowChat((v) => !v)}
                sx={driverMapOutlinedBtn}
              >
                Chat
              </Button>
            ) : null}
            {navHref ? (
              <Button
                size="small"
                component="a"
                href={navHref}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                sx={driverMapOutlinedBtn}
              >
                {rideStarted ? 'Navigate to drop' : 'Navigate to pickup'}
              </Button>
            ) : null}
            {!rideStarted ? (
              <Button
                size="small"
                variant="contained"
                onClick={onEnterOtp}
                sx={driverMapPrimaryBtn}
              >
                Enter OTP
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                disabled={ending}
                onClick={() => setPanel('end')}
                sx={driverMapPrimaryBtn}
              >
                {ending ? 'Ending…' : 'End ride'}
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPanel('cancel')}
              sx={driverMapDangerOutlinedBtn}
            >
              Cancel ride
            </Button>
          </Stack>
        </Box>
      ) : null}

      {panel === 'end' ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: '#E2E8F0' }}>
            End this trip at the drop? This marks the ride complete.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
            <Button
              size="small"
              disabled={ending}
              onClick={() => setPanel('actions')}
              sx={driverMapGhostBtn}
            >
              Back
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={ending}
              onClick={() => onEndRide?.()}
              sx={driverMapPrimaryBtn}
            >
              {ending ? 'Ending…' : 'Confirm end ride'}
            </Button>
          </Stack>
        </Box>
      ) : null}

      {panel === 'cancel' ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: '#CBD5E1', mb: 1 }}>Why are you cancelling?</Typography>
          <Stack spacing={0.75}>
            {CANCEL_REASONS.map((item) => (
              <Button
                key={item}
                size="small"
                variant={reason === item ? 'contained' : 'outlined'}
                onClick={() => setReason(item)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: reason === item ? '#111827' : '#F8FAFC',
                  bgcolor: reason === item ? '#c4f82a' : 'rgba(15, 23, 42, 0.55)',
                  borderColor: reason === item ? '#c4f82a' : 'rgba(255,255,255,0.4)',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: reason === item ? '#d4ff4a' : 'rgba(15, 23, 42, 0.75)',
                    boxShadow: 'none',
                  },
                }}
              >
                {item}
              </Button>
            ))}
          </Stack>
          {reason === 'Other' ? (
            <TextField
              fullWidth
              size="small"
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder="Tell us more"
              sx={{ mt: 1, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
            />
          ) : null}
          <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
            <Button
              size="small"
              onClick={() => setPanel('actions')}
              disabled={cancelling}
              sx={driverMapGhostBtn}
            >
              Back
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={cancelling || !reason || (reason === 'Other' && !otherReason.trim())}
              onClick={submitCancel}
              sx={driverMapSosBtn}
            >
              {cancelling ? 'Cancelling…' : 'Confirm cancel'}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}
