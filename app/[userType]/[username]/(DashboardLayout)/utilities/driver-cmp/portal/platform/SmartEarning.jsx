'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useDriverPlatformGetMutation, useDriverPlatformSaveMutation } from '@app/libs/apis/driver'
import { EstimateNote, PlatformChrome, StatTile } from './PlatformChrome'

function coords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({})
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { maximumAge: 60000, timeout: 4000 },
    )
  })
}

function SmartEarning() {
  const [load] = useDriverPlatformGetMutation()
  const [save, { isLoading: saving }] = useDriverPlatformSaveMutation()
  const [analytics, setAnalytics] = useState(null)
  const [demand, setDemand] = useState(null)
  const [incentives, setIncentives] = useState(null)
  const [prefs, setPrefs] = useState({
    serviceType: 'any',
    maxDistanceKm: 40,
    acceptCash: true,
    acceptOnline: true,
    acceptScheduled: true,
    peakHoursOnly: false,
  })
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const geo = await coords()
      const [a, d, i, p] = await Promise.allSettled([
        load({ path: 'analytics' }).unwrap(),
        load({ path: 'demand', params: geo }).unwrap(),
        load({ path: 'incentives' }).unwrap(),
        load({ path: 'preferences' }).unwrap(),
      ])
      if (cancelled) return
      const pick = (result) => (result.status === 'fulfilled' ? result.value?.data || result.value : null)
      setAnalytics(pick(a))
      setDemand(pick(d))
      setIncentives(pick(i))
      const prefsPayload = pick(p)
      if (prefsPayload?.serviceType) setPrefs(prefsPayload)
      setBusy(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [load])

  const challenges = Array.isArray(incentives?.challenges) ? incentives.challenges : []
  const hours = demand?.historicalByHour || []

  return (
    <PlatformChrome
      title="Smart earning"
      body="Demand, incentives, and ride preferences. Forecasts are estimates from your recent trips and nearby supply — not guaranteed earnings."
    >
      {busy ? (
        <Typography>Loading earning intelligence…</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile label="Today fare" value={`₹${analytics?.todayFare ?? 0}`} hint={`${analytics?.todayRides ?? 0} completed`} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile label="Avg fare" value={`₹${analytics?.avgFare ?? 0}`} hint="Last 14 days" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile label="Dead km" value={`${analytics?.deadKm ?? 0} km`} hint="Empty repositioning estimate" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile label="Best window" value={analytics?.bestTimeToGoOnline || '—'} hint="From your history" />
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
            <Typography fontWeight={700}>Live demand estimate</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Next 30 min: {demand?.predictedDemand30m || '—'} · Nearby drivers: {demand?.supplyNearby ?? '—'} · Wait ~{demand?.expectedWaitMinutes ?? '—'} min
            </Typography>
            <Typography sx={{ mt: 1 }}>{demand?.suggestion}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 2, overflowX: 'auto' }}>
              {hours.map((row) => (
                <Box
                  key={row.hour}
                  sx={{
                    minWidth: 28,
                    height: 48,
                    bgcolor: row.hour === demand?.hour ? '#0F172A' : '#E2E8F0',
                    color: row.hour === demand?.hour ? '#fff' : '#0F172A',
                    borderRadius: 1,
                    textAlign: 'center',
                    pt: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: 10 }}>{row.hour}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{row.rides}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 1.5 }}>Incentive tracker</Typography>
            {challenges.map((item) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">{item.title}</Typography>
                  <Typography variant="body2">{item.progress}/{item.target}</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (item.progress / item.target) * 100)}
                  sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary">{item.reward}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 1.5 }}>Ride preferences</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Service type"
                  value={prefs.serviceType}
                  onChange={(e) => setPrefs((p) => ({ ...p, serviceType: e.target.value }))}
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value="bike">Bike</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                  <MenuItem value="cab">Cab</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max trip distance (km)"
                  value={prefs.maxDistanceKm}
                  onChange={(e) => setPrefs((p) => ({ ...p, maxDistanceKm: Number(e.target.value) }))}
                />
              </Grid>
            </Grid>
            <Stack sx={{ mt: 1 }}>
              <FormControlLabel control={<Checkbox checked={!!prefs.acceptCash} onChange={(e) => setPrefs((p) => ({ ...p, acceptCash: e.target.checked }))} />} label="Accept cash" />
              <FormControlLabel control={<Checkbox checked={!!prefs.acceptOnline} onChange={(e) => setPrefs((p) => ({ ...p, acceptOnline: e.target.checked }))} />} label="Accept UPI / online" />
              <FormControlLabel control={<Checkbox checked={!!prefs.acceptScheduled} onChange={(e) => setPrefs((p) => ({ ...p, acceptScheduled: e.target.checked }))} />} label="Accept scheduled rides" />
              <FormControlLabel control={<Checkbox checked={!!prefs.peakHoursOnly} onChange={(e) => setPrefs((p) => ({ ...p, peakHoursOnly: e.target.checked }))} />} label="Prefer peak hours" />
            </Stack>
            <Button
              variant="contained"
              disabled={saving}
              sx={{ mt: 1 }}
              onClick={() => save({ path: 'preferences', method: 'PUT', body: prefs })}
            >
              Save preferences
            </Button>
          </Paper>
          <EstimateNote text={demand?.disclaimer || analytics?.disclaimer} />
        </>
      )}
    </PlatformChrome>
  )
}

export default SmartEarning
