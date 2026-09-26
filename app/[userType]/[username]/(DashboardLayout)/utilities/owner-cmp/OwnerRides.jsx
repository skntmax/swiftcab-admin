'use client'
import React, { useEffect, useMemo, useState } from 'react';
import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useOwnerRidesMutation } from '@app/libs/apis/owner';

const statusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'On trip':
      return 'info';
    case 'Active':
      return 'warning';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const formatWhen = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const OwnerRides = ({ todayOnly = false }) => {
  const [getRides, { data: ridesData, isLoading }] = useOwnerRidesMutation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
    getRides(todayOnly ? 'today' : undefined);
  }, [todayOnly]);

  const rides = useMemo(
    () => (Array.isArray(ridesData?.data) ? ridesData.data : []),
    [ridesData]
  );

  const pagedRides = rides.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {todayOnly ? "Today's rides" : 'All rides'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {todayOnly
          ? 'Rides created or scheduled for today on vehicles assigned to this owner.'
          : 'Ride history for vehicles assigned to this owner.'}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 1100, width: '100%' }}>
        {isLoading ? (
          <Typography>Loading rides…</Typography>
        ) : rides.length === 0 ? (
          <Typography>
            {todayOnly ? 'No rides for today.' : 'No rides found for this owner.'}
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Fare</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRides.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatWhen(row.pickup_date || row.created_on)}</TableCell>
                      <TableCell>{row.customer_username || '—'}</TableCell>
                      <TableCell>{row.driver_username || '—'}</TableCell>
                      <TableCell>
                        {row.vhicle_type || row.vhicle_username || '—'}
                        {row.license_plate ? ` · ${row.license_plate}` : ''}
                      </TableCell>
                      <TableCell>
                        {row.source_name || '—'} → {row.destination_name || '—'}
                      </TableCell>
                      <TableCell>
                        {row.total_fare != null ? `₹${row.total_fare}` : '—'}
                        {row.payment_paid ? ' · paid' : ''}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.status || 'Booked'} color={statusColor(row.status)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={rides.length}
              page={page}
              onPageChange={(_, next) => setPage(next)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>
    </>
  );
};

export default OwnerRides;
