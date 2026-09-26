'use client'

import React, { useContext, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { Launch, VerifiedOutlined } from '@mui/icons-material'
import { useUpdateKycStatusMutation } from '@app/libs/apis/admin'
import { contextProvider } from '@components/AppProvider'

const STATUS_OPTIONS = ['INITIATED', 'PENDING', 'VERIFIED', 'COMPLETED']

const DETAIL_FIELDS = [
  ['license_plate', 'License plate'],
  ['manufacturer', 'Manufacturer'],
  ['model', 'Model'],
  ['year', 'Year'],
  ['color', 'Colour'],
  ['engine_number', 'Engine number'],
  ['chassis_number', 'Chassis number'],
  ['fuel_type', 'Fuel type'],
  ['transmission', 'Transmission'],
]

function readableValue(name, value) {
  if (!value) return 'Not provided'
  if (name === 'year') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : String(date.getFullYear())
  }
  return String(value)
}

function DocumentPreview({ label, url, image }) {
  if (!url) {
    return <Alert severity="warning" variant="outlined">{label} has not been uploaded.</Alert>
  }
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, height: '100%' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
      {image && (
        <Box
          component="img"
          src={url}
          alt={label}
          sx={{ mt: 1, width: '100%', height: 180, objectFit: 'cover', borderRadius: 2, bgcolor: '#f8fafc' }}
        />
      )}
      <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ mt: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        Open document <Launch fontSize="inherit" />
      </Link>
    </Paper>
  )
}

function VehicleReview({ vehicle, onUpdated }) {
  const [status, setStatus] = useState(vehicle.kyc_varification || 'PENDING')
  const [updateKyc, { isLoading }] = useUpdateKycStatusMutation()
  const { successMessage, errorMessage } = useContext(contextProvider)

  useEffect(() => setStatus(vehicle.kyc_varification || 'PENDING'), [vehicle.kyc_varification])

  async function saveStatus() {
    try {
      const response = await updateKyc({
        vhicleId: vehicle.id,
        ownerId: vehicle.vhicle_owner_id,
        kycStatus: status,
      }).unwrap()
      if (response?.error) throw new Error(response.message || 'Unable to update KYC')
      successMessage('Vehicle KYC status updated')
      onUpdated?.()
    } catch (error) {
      errorMessage(error?.data?.message || error?.message || 'Unable to update KYC')
    }
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h6" fontWeight={800}>{vehicle.name || vehicle.username}</Typography>
          <Typography variant="body2" color="text.secondary">Vehicle ID #{vehicle.id}</Typography>
        </Box>
        <Chip label={vehicle.kyc_varification} color={vehicle.is_kyc ? 'success' : 'warning'} />
      </Stack>

      <Grid container spacing={1.5}>
        {DETAIL_FIELDS.map(([name, label]) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>{readableValue(name, vehicle[name])}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}><DocumentPreview label="Vehicle front" url={vehicle.ss_one} image /></Grid>
        <Grid item xs={12} md={4}><DocumentPreview label="Vehicle rear" url={vehicle.ss_two} image /></Grid>
        <Grid item xs={12} md={4}><DocumentPreview label="Registration certificate" url={vehicle.rc_doc} /></Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <FormControl fullWidth size="small">
            <InputLabel id={`kyc-status-${vehicle.id}`}>Review decision</InputLabel>
            <Select
              labelId={`kyc-status-${vehicle.id}`}
              value={status}
              label="Review decision"
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<VerifiedOutlined />}
            onClick={saveStatus}
            disabled={isLoading || status === vehicle.kyc_varification}
            sx={{ minWidth: 180, minHeight: 44 }}
          >
            {isLoading ? 'Saving…' : 'Save decision'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default function KycFormStatus({ fd, onUpdated }) {
  const vehicles = Array.isArray(fd) ? fd : fd ? [fd] : []
  return (
    <Stack spacing={3}>
      {vehicles.map((vehicle) => <VehicleReview key={vehicle.id} vehicle={vehicle} onUpdated={onUpdated} />)}
    </Stack>
  )
}
