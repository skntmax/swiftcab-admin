'use client'

import React, { useEffect, useState } from 'react'
import { Alert, Chip, Paper, Stack, Typography } from '@mui/material'
import { useDriverPlatformGetMutation } from '@app/libs/apis/driver'
import { PlatformChrome } from './PlatformChrome'

function Copilot() {
  const [load] = useDriverPlatformGetMutation()
  const [data, setData] = useState(null)

  useEffect(() => {
    const run = async () => {
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
      const res = await load({ path: 'copilot', params: geo }).unwrap()
      setData(res?.data || res)
    }
    run().catch(() => {})
  }, [load])

  const messages = Array.isArray(data?.messages) ? data.messages : []

  return (
    <PlatformChrome
      title="AI earning advisor"
      body="Read-only advice from your trips, targets, and nearby supply. Do not use the phone while moving. Nothing here is a guaranteed payout."
    >
      <Alert severity="warning" sx={{ mb: 2 }}>{data?.safety || 'Avoid interacting with the app while driving.'}</Alert>
      <Stack spacing={1.5}>
        {messages.map((item) => (
          <Paper key={item.id} elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              {item.estimate ? <Chip size="small" label="Estimate" variant="outlined" /> : <Chip size="small" color="success" label="Recorded" />}
            </Stack>
            <Typography>{item.text}</Typography>
          </Paper>
        ))}
      </Stack>
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Voice-safe questions (read later, parked)</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(data?.voiceHints || []).map((hint) => (
          <Chip key={hint} label={hint} variant="outlined" />
        ))}
      </Stack>
    </PlatformChrome>
  )
}

export default Copilot
