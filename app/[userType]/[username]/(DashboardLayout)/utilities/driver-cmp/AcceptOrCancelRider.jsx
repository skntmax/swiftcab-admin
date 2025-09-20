'use client';
import React from 'react';
import { Paper, Typography, Divider, Box, Button } from '@mui/material';
import Draggable from 'react-draggable';
import { CircularProgress } from '@mui/material';
export default function AcceptRideNotification({  open, onClose, onAccept, rideData, loading}) {
  if (!open) return null; // Hide when not open

  const customer = rideData?.customerViewDetails || {};

  return (
    <Draggable handle=".drag-handle" cancel={'button, strong, p'}>
      <Paper
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1500,
          p: 2,
          width: 320,
          boxShadow: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          cursor: 'move'
        }}
      >
        {/* Drag handle */}
        <Typography className="drag-handle" variant="h6" gutterBottom sx={{ cursor: 'move' }}>
          🚕 New Ride Request
        </Typography>

        <Typography variant="body2"><strong>Username:</strong> {rideData?.userDetails?.username}</Typography>
        <Typography variant="body2"><strong>Portal:</strong> {customer.portal}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2" gutterBottom>Trip Details</Typography>
        <Typography variant="body2"><strong>Pickup:</strong> {customer.pickup_name}</Typography>
        <Typography variant="body2"><strong>Drop:</strong> {customer.drop_name}</Typography>
        <Typography variant="body2"><strong>Date:</strong> {customer.pickup_date}</Typography>
        <Typography variant="body2"><strong>Time:</strong> {customer.pickup_time || 'Not specified'}</Typography>
        <Typography variant="body2"><strong>Distance:</strong> {customer.distance?.toFixed(2)} km</Typography>
        <Typography variant="body2"><strong>Travel Type:</strong> {customer.travel_way === '1' ? 'One Way' : 'Round Trip'}</Typography>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button size="small" color="secondary" onClick={onClose} disabled={loading}>
            Decline
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={onAccept}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Accept"}
          </Button>
        </Box>
      </Paper>
    </Draggable>
  );
}
