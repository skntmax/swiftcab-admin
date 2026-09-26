'use client'

import React, { useEffect, useState } from 'react'
import { Alert, Button, Checkbox, FormControlLabel, Grid, Paper, Stack, Typography } from '@mui/material'
import { useDriverPlatformGetMutation, useDriverPlatformSaveMutation } from '@app/libs/apis/driver'
import { PlatformChrome, StatTile } from './PlatformChrome'

function Growth() {
  const [load] = useDriverPlatformGetMutation()
  const [save, { isLoading: saving }] = useDriverPlatformSaveMutation()
  const [data, setData] = useState(null)
  const [savings, setSavings] = useState(null)

  const refresh = async () => {
    const [g, s] = await Promise.all([
      load({ path: 'growth' }).unwrap(),
      load({ path: 'savings' }).unwrap(),
    ])
    setData(g?.data || g)
    setSavings(s?.data || s)
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [])

  return (
    <PlatformChrome
      title="Driver growth"
      body="Consent-based earnings snapshot for eligible partner products, plus training tracks. Loans and insurance are never guaranteed by SwiftCab."
    >
      <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!savings?.creditConsent}
              onChange={(e) => setSavings((s) => ({ ...s, creditConsent: e.target.checked }))}
            />
          }
          label="I consent to share my completed-ride totals with eligible financial partners"
        />
        <Button
          variant="contained"
          disabled={saving}
          sx={{ ml: 1 }}
          onClick={async () => {
            await save({ path: 'savings', method: 'PUT', body: savings }).unwrap()
            refresh()
          }}
        >
          Save consent
        </Button>
        {data?.creditSnapshot ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}><StatTile label="Completed rides" value={String(data.creditSnapshot.completedRides ?? 0)} /></Grid>
            <Grid item xs={12} sm={4}><StatTile label="This month" value={`₹${data.creditSnapshot.monthFareRupees ?? 0}`} /></Grid>
            <Grid item xs={12} sm={4}><StatTile label="Trip records" value={String(data.creditSnapshot.tripRecords ?? 0)} /></Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>Enable consent to view a shareable earnings snapshot.</Alert>
        )}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {data?.creditSnapshot?.note || 'Partner underwriting is independent. SwiftCab does not approve loans.'}
        </Typography>
      </Paper>

      <Typography fontWeight={700} sx={{ mt: 3, mb: 1 }}>Skill tracks</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(data?.training || []).map((item) => (
          <Paper key={item.id} elevation={3} sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="body2">{item.title}</Typography>
          </Paper>
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{data?.fleet}</Typography>
    </PlatformChrome>
  )
}

export default Growth
