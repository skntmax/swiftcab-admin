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
import { useDriverRidesMutation } from '@app/libs/apis/driver';

const TITLES = {
  upcoming: {
    title: 'Upcoming rides',
    subtitle: 'Rides assigned to you that are not finished or cancelled.',
    empty: 'No upcoming rides.',
  },
  completed: {
    title: 'Completed rides',
    subtitle: 'Trips you have finished.',
    empty: 'No completed rides yet.',
  },
  cancelled: {
    title: 'Cancelled rides',
    subtitle: 'Rides assigned to you that were cancelled.',
    empty: 'No cancelled rides.',
  },
};

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

const DriverRides = ({ scope = 'upcoming' }) => {
  const copy = TITLES[scope] || TITLES.upcoming;
  const [getRides, { data: ridesData, isLoading }] = useDriverRidesMutation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
    getRides(scope);
  }, [scope]);

  const rides = useMemo(
    () => (Array.isArray(ridesData?.data) ? ridesData.data : []),
    [ridesData]
  );

  const pagedRides = rides.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {copy.title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        {copy.subtitle}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 1100, width: '100%' }}>
        {isLoading ? (
          <Typography>Loading rides…</Typography>
        ) : rides.length === 0 ? (
          <Typography>{copy.empty}</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Owner</TableCell>
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
                      <TableCell>{row.owner_username || '—'}</TableCell>
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
                        <Chip size="small" label={row.status || scope} color={statusColor(row.status)} />
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

export default DriverRides;
