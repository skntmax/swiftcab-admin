'use client'
import React, { useEffect } from 'react'
import { Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import { useDriverDashboardMutation } from '@app/libs/apis/driver'
import { vehicleTypeImageSrc, vehicleTypeLabel } from '@utils/vehicleTypeIcon'

const StatCard = ({ label, value, hint }) => (
  <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>{value}</Typography>
    {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
  </Paper>
)

function ViewSummary() {
  const [loadDashboard, { data, isLoading }] = useDriverDashboardMutation()

  useEffect(() => {
    loadDashboard()
  }, [])

  const payload = data?.data || {}
  const stats = payload.stats || {}
  const profile = payload.profile || {}
  const user = profile.driver_profile_id || {}
  const vehicle = profile.vhicleDetails || {}
  const recent = Array.isArray(payload.recentRides) ? payload.recentRides : []
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Driver'

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Dashboard</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Today’s snapshot for {name}: rides, earnings, KYC, and the vehicle assigned to you.
      </Typography>

      {isLoading ? (
        <Typography>Loading dashboard…</Typography>
      ) : (
        <>
          <Grid container spacing={2} sx={{ maxWidth: 1100 }}>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Upcoming" value={stats.upcoming ?? 0} hint="Assigned, not finished" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Completed" value={stats.completed ?? 0} hint="Finished trips" /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Cancelled" value={stats.cancelled ?? 0} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard label="Lifetime booked" value={`₹${stats.booked_fare ?? 0}`} /></Grid>
            <Grid item xs={12} sm={4}><StatCard label="Today" value={`₹${stats.today_fare ?? 0}`} hint="Completed fare" /></Grid>
            <Grid item xs={12} sm={4}><StatCard label="This week" value={`₹${stats.week_fare ?? 0}`} /></Grid>
            <Grid item xs={12} sm={4}><StatCard label="This month" value={`₹${stats.month_fare ?? 0}`} /></Grid>
          </Grid>

          <Grid container spacing={2} sx={{ maxWidth: 1100, mt: 1 }}>
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Account</Typography>
                <Stack spacing={1}>
                  <Typography>KYC: <Chip size="small" label={profile.is_varified || 'PENDING'} color={profile.is_varified === 'VERIFIED' || profile.is_varified === 'COMPLETED' ? 'success' : 'warning'} /></Typography>
                  <Typography>Wallet: ₹{profile.wallet_balance ?? 0}</Typography>
                  <Typography>Code: {profile.wallet_code || '—'}</Typography>
                  <Typography component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {vehicleTypeImageSrc(vehicle) ? (
                      <Box
                        component="img"
                        src={vehicleTypeImageSrc(vehicle)}
                        alt=""
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                      />
                    ) : null}
                    <span>
                      Vehicle: {vehicleTypeLabel(vehicle.vhicle_type) || 'Not assigned'}
                      {vehicle.vehicle_number ? ` · ${vehicle.vehicle_number}` : ''}
                    </span>
                  </Typography>
                  <Typography>Owner: {vehicle.owner_name || vehicle.username || '—'}</Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Recent rides</Typography>
                {recent.length === 0 ? (
                  <Typography color="text.secondary">No rides yet.</Typography>
                ) : recent.map((ride) => (
                  <Box key={ride.id} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">{ride.source_name || '—'} → {ride.destination_name || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ride.customer_username} · ₹{ride.total_fare ?? 0} · {ride.cancelled_by ? 'Cancelled' : ride.ride_finished ? 'Completed' : 'Open'}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default ViewSummary
