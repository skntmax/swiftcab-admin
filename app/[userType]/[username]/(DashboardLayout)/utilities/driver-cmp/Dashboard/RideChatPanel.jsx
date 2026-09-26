'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { SOCKET_EVENTS } from '@constants/index'

const DRIVER_MAX = 3
const CUSTOMER_MAX = 5

export default function RideChatPanel({ socket, rideId, onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  const driverCount = messages.filter((m) => m.role === 'driver').length
  const customerCount = messages.filter((m) => m.role === 'customer').length
  const canSend = driverCount < DRIVER_MAX

  const scrollBottom = useCallback(() => {
    const el = listRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (!socket || !rideId) {
      return undefined
    }
    const onMessage = (payload) => {
      if (Number(payload?.rideId) !== Number(rideId)) {
        return
      }
      if (payload?.message) {
        setMessages((prev) => [...prev, payload.message])
      }
    }
    const onHistory = (payload) => {
      if (Number(payload?.rideId) !== Number(rideId)) {
        return
      }
      if (Array.isArray(payload?.messages)) {
        setMessages(payload.messages)
      }
    }
    const onError = (payload) => {
      if (Number(payload?.rideId) === Number(rideId) || !payload?.rideId) {
        setError(payload?.message || 'Could not send message.')
      }
    }

    socket.emit(SOCKET_EVENTS.RIDE_CHAT_HISTORY, { rideId, access: 'private' })
    socket.on(SOCKET_EVENTS.RIDE_CHAT, onMessage)
    socket.on(SOCKET_EVENTS.RIDE_CHAT_HISTORY, onHistory)
    socket.on(SOCKET_EVENTS.RIDE_CHAT_ERROR, onError)

    return () => {
      socket.off(SOCKET_EVENTS.RIDE_CHAT, onMessage)
      socket.off(SOCKET_EVENTS.RIDE_CHAT_HISTORY, onHistory)
      socket.off(SOCKET_EVENTS.RIDE_CHAT_ERROR, onError)
    }
  }, [socket, rideId])

  useEffect(() => {
    scrollBottom()
  }, [messages, scrollBottom])

  const send = () => {
    const text = draft.trim()
    if (!text || !socket || !rideId || !canSend) {
      return
    }
    setError('')
    setSending(true)
    socket.emit(
      SOCKET_EVENTS.RIDE_CHAT,
      { rideId, message: text, access: 'private' },
      () => {
        setSending(false)
      },
    )
    setDraft('')
  }

  return (
    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Trip chat</Typography>
        <Button size="small" onClick={onClose} sx={{ textTransform: 'none', color: '#94A3B8', minWidth: 0 }}>
          Close
        </Button>
      </Stack>
      <Typography sx={{ fontSize: 11, color: '#94A3B8', mb: 1 }}>
        Send up to {DRIVER_MAX} messages first ({driverCount}/{DRIVER_MAX}). Rider can reply up to {CUSTOMER_MAX}{' '}
        times after your first message.
      </Typography>
      <Box
        ref={listRef}
        sx={{
          maxHeight: 140,
          overflowY: 'auto',
          mb: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {messages.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>No messages yet.</Typography>
        ) : (
          messages.map((m) => (
            <Typography
              key={m.id}
              sx={{
                fontSize: 12,
                color: '#E2E8F0',
                textAlign: m.role === 'driver' ? 'right' : 'left',
                mb: 0.5,
              }}
            >
              <Box component="span" sx={{ fontWeight: 700 }}>
                {m.role === 'driver' ? 'You' : 'Rider'}:
              </Box>{' '}
              {m.message}
            </Typography>
          ))
        )}
      </Box>
      {error ? (
        <Typography sx={{ fontSize: 11, color: '#FCA5A5', mb: 1 }}>{error}</Typography>
      ) : null}
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          fullWidth
          value={draft}
          disabled={!canSend || sending}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              send()
            }
          }}
          placeholder={canSend ? 'Message rider…' : 'Chat limit reached'}
          inputProps={{ maxLength: 280 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              fontSize: 13,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
            },
          }}
        />
        <Button
          size="small"
          variant="contained"
          disabled={!canSend || sending || !draft.trim()}
          onClick={send}
          sx={{ textTransform: 'none', bgcolor: '#c4f82a', color: '#111', '&:hover': { bgcolor: '#d4ff4a' } }}
        >
          Send
        </Button>
      </Stack>
    </Box>
  )
}
