'use client'
import React, { useEffect } from 'react'
import { Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import { useDriverDocumentsMutation } from '@app/libs/apis/driver'
import DocumentPreview from '@components/DocumentPreview'

function statusColor(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Missing') return 'warning'
  return 'info'
}

function ViewDocuments() {
  const [load, { data, isLoading }] = useDriverDocumentsMutation()

  useEffect(() => {
    load()
  }, [])

  const payload = data?.data || {}
  const items = Array.isArray(payload.items) ? payload.items : []

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>View documents</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Open uploaded files. Missing items can be added from Upload documents.
      </Typography>
      {isLoading ? (
        <Typography>Loading documents…</Typography>
      ) : (
        <Grid container spacing={2} sx={{ maxWidth: 1100 }}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.key}>
              <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                <Typography fontWeight={600}>{item.label}</Typography>
                <Chip
                  size="small"
                  sx={{ mt: 1, mb: 1.5 }}
                  label={item.status}
                  color={statusColor(item.status)}
                  variant={item.status === 'Missing' ? 'outlined' : 'filled'}
                />
                <Stack>
                  {item.url ? (
                    <DocumentPreview url={item.url} alt={item.label} height={120} />
                  ) : (
                    <Typography color="text.secondary">Not uploaded</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}

export default ViewDocuments
