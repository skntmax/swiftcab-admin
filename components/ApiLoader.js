import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'

function ApiLoader({ width, height }) {
  const size = parseInt(width, 10) || parseInt(height, 10) || 20
  return <CircularProgress size={size} color="inherit" />
}

export default ApiLoader
