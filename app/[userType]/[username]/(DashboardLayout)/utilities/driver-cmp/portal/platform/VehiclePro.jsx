'use client'

import React, { useEffect, useState } from 'react'
import { Button, Chip, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { useDriverPlatformGetMutation, useDriverPlatformSaveMutation } from '@app/libs/apis/driver'
import { PlatformChrome, StatTile } from './PlatformChrome'

function VehiclePro() {
  const [load] = useDriverPlatformGetMutation()
  const [save, { isLoading: saving }] = useDriverPlatformSaveMutation()
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ kind: 'service', dueOn: '', note: '' })

  const refresh = () => load({ path: 'vehicle' }).unwrap().then((res) => setData(res?.data || res))

  useEffect(() => {
    refresh().catch(() => {})
  }, [])

  const vehicle = data?.vehicle
  const docs = data?.documents || {}
  const reminders = Array.isArray(data?.reminders) ? data.reminders : []

  return (
    <PlatformChrome
      title="Vehicle & professional tools"
      body="Assigned vehicle, document coverage, and maintenance due dates. Fleet owner settlement stays on the owner console."
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}><StatTile label="Vehicle" value={vehicle?.number || 'Not assigned'} hint={vehicle?.manufacturer} /></Grid>
        <Grid item xs={12} sm={4}><StatTile label="DL / RC / Insurance" value={`${docs.dl ? 'DL' : '—'} · ${docs.rc ? 'RC' : '—'} · ${docs.insurance ? 'INS' : '—'}`} /></Grid>
        <Grid item xs={12} sm={4}><StatTile label="Reminders" value={String(reminders.filter((row) => !row.done).length)} /></Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mt: 2 }}>
        <Typography fontWeight={700}>Add a reminder</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField select label="Kind" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))} sx={{ minWidth: 160 }}>
            <MenuItem value="service">Service</MenuItem>
            <MenuItem value="insurance">Insurance renewal</MenuItem>
            <MenuItem value="puc">PUC</MenuItem>
            <MenuItem value="tyres">Tyres</MenuItem>
            <MenuItem value="battery">Battery</MenuItem>
          </TextField>
          <TextField type="date" label="Due" InputLabelProps={{ shrink: true }} value={form.dueOn} onChange={(e) => setForm((f) => ({ ...f, dueOn: e.target.value }))} />
          <TextField label="Note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          <Button
            variant="contained"
            disabled={saving}
            onClick={async () => {
              await save({ path: 'vehicle/reminders', body: form }).unwrap()
              refresh()
            }}
          >
            Save
          </Button>
        </Stack>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {reminders.map((row) => (
            <Stack key={row.id} direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={row.kind} />
              <Typography variant="body2">{row.due_on ? String(row.due_on).slice(0, 10) : 'No date'}</Typography>
              <Typography variant="body2" color="text.secondary">{row.note || ''}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </PlatformChrome>
  )
}

export default VehiclePro
