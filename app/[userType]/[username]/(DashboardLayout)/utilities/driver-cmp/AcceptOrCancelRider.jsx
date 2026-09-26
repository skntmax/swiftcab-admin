'use client';
import React, { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Box, Button, LinearProgress } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { RIDE_OFFER_POPUP_MS } from '@/constants/realtime';

export default function AcceptRideNotification({
  open,
  onClose,
  onAccept,
  rideData,
  loading,
  stackIndex = 0,
  offeredAt,
}) {
  const [remainingMs, setRemainingMs] = useState(RIDE_OFFER_POPUP_MS);

  useEffect(() => {
    if (!open) return;
    const started = typeof offeredAt === 'number' ? offeredAt : Date.now();
    const tick = () => {
      const left = Math.max(0, RIDE_OFFER_POPUP_MS - (Date.now() - started));
      setRemainingMs(left);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [open, offeredAt]);

  if (!open) return null;

  const customer = rideData?.customerViewDetails || {};
  const distanceKm =
    typeof customer.distance === 'number' ? customer.distance.toFixed(1) : customer.distance;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const progress = Math.max(0, Math.min(100, (remainingMs / RIDE_OFFER_POPUP_MS) * 100));

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        right: { xs: 12, sm: 24 + stackIndex * 10 },
        bottom: { xs: 16, sm: 24 + stackIndex * 12 },
        zIndex: 1500 + stackIndex,
        p: 2,
        width: { xs: 'calc(100% - 24px)', sm: 340 },
        borderRadius: 3,
        backgroundColor: 'background.paper',
      }}
    >
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 1.5, borderRadius: 1, height: 4 }}
      />
      <Typography variant="subtitle1" fontWeight={700}>
        New ride nearby
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {rideData?.userDetails?.username || 'Customer'} · {remainingSec}s
      </Typography>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="body2"><strong>Pickup</strong> {customer.pickup_name || '—'}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Drop</strong> {customer.drop_name || '—'}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {distanceKm ? `${distanceKm} km` : 'Distance pending'}
        {customer.travel_way === '1' ? ' · One way' : ''}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
        <Button size="medium" color="inherit" onClick={onClose} disabled={loading} fullWidth>
          Decline
        </Button>
        <Button
          size="medium"
          variant="contained"
          onClick={onAccept}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Accept'}
        </Button>
      </Box>
    </Paper>
  );
}
