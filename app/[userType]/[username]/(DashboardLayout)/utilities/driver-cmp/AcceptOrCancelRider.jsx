'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box
} from '@mui/material';

export default function AcceptRideModal({ open, onClose, onAccept, rideData }) {
  const customer = rideData?.customerViewDetails || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Ride Request</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>Customer Info</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Username:</strong> {rideData?.userDetails?.username}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Portal:</strong> {customer.portal}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box my={2}>
          <Typography variant="h6" gutterBottom>Trip Details</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Pickup:</strong> {customer.pickup_name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Drop:</strong> {customer.drop_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Pickup Date:</strong> {customer.pickup_date}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Pickup Time:</strong> {customer.pickup_time || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Distance:</strong> {customer.distance?.toFixed(2)} km</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Travel Type:</strong> {customer.travel_way === '1' ? 'One Way' : 'Round Trip'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Vehicle Type ID:</strong> {customer.vhicleType}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            <strong>UTM Source:</strong> {customer.utm_source}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Correlation ID:</strong> {customer.correlationId}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">Decline</Button>
        <Button onClick={onAccept} variant="contained" color="primary">Accept</Button>
      </DialogActions>
    </Dialog>
  );
}
