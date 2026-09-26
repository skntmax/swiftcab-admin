'use client'
import React, { useEffect } from 'react'
import { Alert, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useDriverDocumentsMutation } from '@app/libs/apis/driver'

function DocumentStatus() {
  const [load, { data, isLoading }] = useDriverDocumentsMutation()

  useEffect(() => {
    load()
  }, [])

  const payload = data?.data || {}
  const items = Array.isArray(payload.items) ? payload.items : []
  const missing = items.filter((item) => !item.uploaded).length

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Document status</Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Overall KYC: {payload.kycStatus || 'PENDING'}. Missing files block going fully online.
      </Typography>
      {payload.comment && <Alert severity="info" sx={{ mb: 2, maxWidth: 1100 }}>{payload.comment}</Alert>}
      {missing > 0 && <Alert severity="warning" sx={{ mb: 2, maxWidth: 1100 }}>{missing} document(s) still missing.</Alert>}

      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, maxWidth: 1100 }}>
        {isLoading ? (
          <Typography sx={{ p: 2 }}>Loading status…</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.uploaded ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                  <Chip
                    size="small"
                    label={item.status}
                    color={item.status === 'Approved' ? 'success' : item.status === 'Missing' ? 'warning' : 'info'}
                    variant={item.status === 'Missing' ? 'outlined' : 'filled'}
                  />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </>
  )
}

export default DocumentStatus
