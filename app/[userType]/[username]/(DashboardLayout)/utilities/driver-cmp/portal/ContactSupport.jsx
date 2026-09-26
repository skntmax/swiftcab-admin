'use client'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { useCreateDriverSupportTicketMutation, useDriverSupportTicketsMutation } from '@app/libs/apis/driver'
import { contextProvider } from '@components/AppProvider'

const CATEGORIES = ['Rides', 'Payments', 'Documents', 'Account', 'Safety', 'General']

function ContactSupport() {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const [loadTickets, { data, isLoading }] = useDriverSupportTicketsMutation()
  const [createTicket, { isLoading: saving }] = useCreateDriverSupportTicketMutation()
  const [form, setForm] = useState({ subject: '', category: 'General', message: '' })

  useEffect(() => {
    loadTickets()
  }, [])

  const tickets = Array.isArray(data?.data) ? data.data : []

  const onSubmit = async () => {
    if (!form.subject || !form.message) {
      errorMessage('Subject and message are required')
      return
    }
    const response = await createTicket(form).unwrap()
    if (response?.error || response?.status === 500) {
      errorMessage(response?.message || 'Could not create ticket')
      return
    }
    successMessage(response?.message || 'Ticket created')
    setForm({ subject: '', category: 'General', message: '' })
    loadTickets()
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>Contact support</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Raise a ticket for rides, payouts, documents, or safety. You will also get an inbox notification.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 720, mb: 4 }}>
        <Stack spacing={2}>
          <TextField select label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField label="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          <TextField label="Message" multiline minRows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
          <Button variant="contained" disabled={saving} onClick={onSubmit}>{saving ? 'Sending…' : 'Submit ticket'}</Button>
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>Your tickets</Typography>
      {isLoading ? (
        <Typography>Loading tickets…</Typography>
      ) : tickets.length === 0 ? (
        <Typography color="text.secondary">No tickets yet.</Typography>
      ) : (
        <Stack spacing={1.5} sx={{ maxWidth: 1100 }}>
          {tickets.map((ticket) => (
            <Paper key={ticket.id} elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>#{ticket.id} · {ticket.subject}</Typography>
                <Chip size="small" label={ticket.status} color={ticket.status === 'RESOLVED' ? 'success' : 'warning'} />
              </Stack>
              <Typography variant="body2" color="text.secondary">{ticket.category}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{ticket.message}</Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  )
}

export default ContactSupport
