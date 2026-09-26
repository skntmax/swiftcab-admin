'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { DASHBOARD_SURFACE } from '@utils/theme/driverTheme'

function DashboardPageShell({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: DASHBOARD_SURFACE,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3.5 },
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  )
}

export function DriverEmptyState({ title, body }) {
  return (
    <>
      <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 560 }}>
        {body}
      </Typography>
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: '#fff',
          px: 3,
          py: 5,
          color: 'text.secondary',
        }}
      >
        {body}
      </Box>
    </>
  )
}

export default DashboardPageShell
