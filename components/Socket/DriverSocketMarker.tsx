'use client'

import { Box, Tooltip, Typography } from '@mui/material'
import { SOCKET_STATUS, useSocket } from '@components/Socket/SocketProvider'

export default function DriverSocketMarker() {
  const { status } = useSocket()
  const isOnline = status === SOCKET_STATUS.connected
  const label = isOnline ? 'Socket connected' : 'Socket disconnected'

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        aria-label={label}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          mr: 1.5,
        }}
      >
        <Box
          component="span"
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: isOnline ? '#22c55e' : '#ef4444',
            boxShadow: isOnline
              ? '0 0 0 4px rgba(34, 197, 94, 0.28)'
              : '0 0 0 4px rgba(239, 68, 68, 0.22)',
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
          {isOnline ? 'Online' : 'Offline'}
        </Typography>
      </Box>
    </Tooltip>
  )
}
