'use client'
import React from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function RideHistory() {
  const pathname = usePathname()
  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Ride history</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 560 }}>
        Full history is split by status so you can act on open trips first.
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={1.25}>
          <Typography component={Link} href={`${pathname}?tabs=driver/my-rides/upcoming`} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
            Upcoming rides
          </Typography>
          <Typography component={Link} href={`${pathname}?tabs=driver/my-rides/completed`} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
            Completed rides
          </Typography>
          <Typography component={Link} href={`${pathname}?tabs=driver/my-rides/cancelled`} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
            Cancelled rides
          </Typography>
        </Stack>
      </Paper>
    </>
  )
}

export default RideHistory
