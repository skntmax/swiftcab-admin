'use client'
import React, { useEffect } from 'react'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useDriverDetailsMutation } from '@app/libs/apis/driver'
import { vehicleTypeImageSrc, vehicleTypeLabel } from '@utils/vehicleTypeIcon'

function DriverProfilePageView() {
  const [getDriverDetails, { data, isLoading }] = useDriverDetailsMutation()

  useEffect(() => {
    getDriverDetails()
  }, [])

  const profile = data?.data || {}
  const user = profile.driver_profile_id || {}
  const vehicle = profile.vhicleDetails || {}
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Driver'
  const kycOk = profile.is_varified === 'VERIFIED' || profile.is_varified === 'COMPLETED'

  if (isLoading) {
    return <Typography>Loading profile…</Typography>
  }

  if (!profile?.id && !user?.username) {
    return (
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 720 }}>
        <Typography variant="h6">No driver profile yet</Typography>
        <Typography color="text.secondary">Upload documents to create your driver profile, then return here.</Typography>
      </Paper>
    )
  }

  const docs = [
    ['Licence', profile.DL],
    ['RC', profile.RC],
    ['Insurance', profile.insurance],
    ['Aadhaar', profile.adhar_card],
    ['PAN', profile.pan_card],
    ['Passbook', profile.passbook],
  ]

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Driver profile</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Read-only view of your account, KYC, assigned vehicle, and bank details.
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: 1100 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Avatar src={profile.profile_pic || user.avatar || ''} sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }} />
            <Typography variant="h6">{name}</Typography>
            <Typography color="text.secondary">{user.username}</Typography>
            <Chip sx={{ mt: 1.5 }} label={profile.is_varified || 'PENDING'} color={kycOk ? 'success' : 'warning'} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Contact</Typography>
            <Stack spacing={0.75}>
              <Typography>Email: {user.email || '—'}</Typography>
              <Typography>Phone: {user.phone_no || '—'}</Typography>
              <Typography>Wallet: ₹{profile.wallet_balance ?? 0} · {profile.wallet_code || '—'}</Typography>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Assigned vehicle</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {vehicleTypeImageSrc(vehicle) ? (
                <Box
                  component="img"
                  src={vehicleTypeImageSrc(vehicle)}
                  alt=""
                  sx={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              ) : null}
              <Stack>
                <Typography>
                  {vehicleTypeLabel(vehicle.vhicle_type) || 'Not assigned'}
                  {vehicle.vehicle_id ? ` · ${vehicle.vehicle_id}` : ''}
                  {vehicle.vh_model ? ` · ${vehicle.vh_model}` : ''}
                </Typography>
                <Typography color="text.secondary">Owner: {vehicle.owner_name || vehicle.username || '—'}</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Bank</Typography>
            <Typography>{profile.drive_has_bank_account?.bank_name || '—'}</Typography>
            <Typography>Branch: {profile.bank_have_branch?.branch_name || '—'}</Typography>
            <Typography>IFSC: {profile.ifsc || '—'}</Typography>
            <Typography>Account: {profile.bank_account_no || '—'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Documents</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {docs.map(([label, url]) => (
                <Chip
                  key={label}
                  label={url ? `${label} · uploaded` : `${label} · missing`}
                  color={url ? 'success' : 'default'}
                  component={url ? Link : 'div'}
                  href={url || undefined}
                  clickable={Boolean(url)}
                  target={url ? '_blank' : undefined}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default DriverProfilePageView
