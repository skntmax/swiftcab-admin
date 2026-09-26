'use client'

import React, { useEffect, useState } from 'react'
import { Alert, Button, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import { useDriverPlatformGetMutation, useDriverPlatformSaveMutation } from '@app/libs/apis/driver'
import { PlatformChrome, StatTile } from './PlatformChrome'

function Protection() {
  const [load] = useDriverPlatformGetMutation()
  const [save, { isLoading: saving }] = useDriverPlatformSaveMutation()
  const [data, setData] = useState(null)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load({ path: 'protection' }).unwrap().then((res) => setData(res?.data || res)).catch(() => {})
  }, [load])

  const sendSos = async () => {
    const geo = await new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({})
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({}),
        { timeout: 4000 },
      )
    })
    const res = await save({ path: 'sos', body: { ...geo, note: note || 'SOS from driver console' } }).unwrap()
    setMessage(res?.data?.message || res?.message || 'SOS recorded')
    const next = await load({ path: 'protection' }).unwrap()
    setData(next?.data || next)
  }

  const benefits = data?.benefits || []

  return (
    <PlatformChrome
      title="Protection & safety"
      body="Insurance follows the policy you uploaded. SOS opens a support ticket immediately. Call local emergency services if you are in danger."
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}><StatTile label="Safety score" value={data?.safetyScore ?? '—'} hint="Coaching metric from cancel rate, not a penalty" /></Grid>
        <Grid item xs={12} sm={4}><StatTile label="KYC" value={data?.kycStatus || 'PENDING'} /></Grid>
        <Grid item xs={12} sm={4}><StatTile label="Insurance file" value={data?.insuranceOnFile ? 'On file' : 'Missing'} /></Grid>
      </Grid>
      {data?.restReminder ? <Alert severity="warning" sx={{ mt: 2 }}>{data.restReminder}</Alert> : null}

      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2, border: '1px solid #FCA5A5' }}>
        <Typography fontWeight={700} color="error">Emergency SOS</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Records your location and creates a high-priority ticket. Do not use this while driving.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField fullWidth label="What happened?" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button color="error" variant="contained" disabled={saving} onClick={sendSos}>Send SOS</Button>
        </Stack>
        {message ? <Alert severity="success" sx={{ mt: 1.5 }}>{message}</Alert> : null}
      </Paper>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {benefits.map((item) => (
          <Grid item xs={12} md={4} key={item.id}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Typography fontWeight={700}>{item.title}</Typography>
              <Chip size="small" label={item.status} sx={{ mt: 1, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">{item.note}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </PlatformChrome>
  )
}

export default Protection
