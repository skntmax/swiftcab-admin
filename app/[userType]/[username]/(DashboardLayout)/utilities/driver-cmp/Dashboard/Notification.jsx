'use client'
import React, { useEffect } from 'react'
import { Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { useDriverNotificationsMutation, useMarkDriverNotificationsReadMutation } from '@app/libs/apis/driver'

function Notification() {
  const [load, { data, isLoading }] = useDriverNotificationsMutation()
  const [markRead, { isLoading: saving }] = useMarkDriverNotificationsReadMutation()

  const refresh = () => load()

  useEffect(() => {
    refresh()
  }, [])

  const rows = Array.isArray(data?.data) ? data.data : []

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, maxWidth: 1100 }}>
        <div>
          <Typography variant="h5">Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Ride, document, and account alerts for this login.</Typography>
        </div>
        <Button variant="outlined" disabled={saving} onClick={() => markRead({}).then(refresh)}>
          Mark all read
        </Button>
      </Stack>

      {isLoading ? (
        <Typography>Loading notifications…</Typography>
      ) : rows.length === 0 ? (
        <Typography>No notifications yet.</Typography>
      ) : (
        <Stack spacing={1.5} sx={{ maxWidth: 1100 }}>
          {rows.map((row) => (
            <Paper key={row.id} elevation={2} sx={{ p: 2.5, borderRadius: 2, opacity: row.is_read ? 0.7 : 1 }}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <div>
                  <Typography fontWeight={600}>{row.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{row.body}</Typography>
                  <Typography variant="caption">{row.created_on ? new Date(row.created_on).toLocaleString() : ''}</Typography>
                </div>
                <Stack alignItems="flex-end" spacing={1}>
                  <Chip size="small" label={row.type} />
                  {!row.is_read && (
                    <Button size="small" onClick={() => markRead({ notificationId: row.id }).then(refresh)}>
                      Mark read
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  )
}

export default Notification
