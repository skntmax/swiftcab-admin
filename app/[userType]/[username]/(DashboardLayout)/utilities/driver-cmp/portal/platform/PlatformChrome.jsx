'use client'

import React from 'react'
import { Alert, Box, Paper, Typography } from '@mui/material'

export function PlatformChrome({ title, body, children }) {
  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {body ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 720 }}>
          {body}
        </Typography>
      ) : null}
      {children}
    </Box>
  )
}

export function EstimateNote({ text }) {
  if (!text) return null
  return (
    <Alert severity="info" sx={{ mt: 2 }}>
      {text}
    </Alert>
  )
}

export function StatTile({ label, value, hint }) {
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700, color: 'text.primary' }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
    </Paper>
  )
}
