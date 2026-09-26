'use client'

import React, { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { DirectionsCar, ExpandMore, FactCheckOutlined, Search, VerifiedOutlined } from '@mui/icons-material'
import { useListVehicleKycQuery } from '@app/libs/apis/admin'
import KycFormStatus from './KycFormStatus'

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function StatCard({ icon, label, value, colour }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minWidth: 180, flex: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${colour}14`, color: colour, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h5" fontWeight={800}>{value ?? '—'}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

export default function KycRequest() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [expanded, setExpanded] = useState(null)
  const debouncedQuery = useDebouncedValue(query)
  const params = useMemo(() => ({ q: debouncedQuery, page, limit, status }), [debouncedQuery, page, limit, status])
  const { data, error, isFetching, refetch } = useListVehicleKycQuery(params)
  const payload = data?.data || {}
  const vehicles = Array.isArray(payload.items) ? payload.items : []
  const summary = payload.summary || {}
  const total = payload.metadata?.total || 0

  useEffect(() => setPage(1), [debouncedQuery, status, limit])

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1500, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={850}>Vehicle KYC review</Typography>
          <Typography color="text.secondary">Review owner vehicles and their supporting documents from one queue.</Typography>
        </Box>
        <Chip icon={<FactCheckOutlined />} label={`${summary.pending || 0} need attention`} color="warning" variant="outlined" />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5}>
        <StatCard icon={<DirectionsCar />} label="Matching vehicles" value={summary.total} colour="#2563eb" />
        <StatCard icon={<FactCheckOutlined />} label="Pending review" value={summary.pending} colour="#d97706" />
        <StatCard icon={<VerifiedOutlined />} label="Verified" value={summary.verified} colour="#059669" />
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Search owner, email, plate or vehicle"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <TextField select size="small" label="KYC status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 190 }}>
            <MenuItem value="all">All statuses</MenuItem>
            {['INITIATED', 'PENDING', 'VERIFIED', 'COMPLETED'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Unable to load vehicle KYC cases. Please retry.</Alert>}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 850 }} aria-label="Vehicle KYC review queue">
          <TableHead><TableRow sx={{ bgcolor: '#f8fafc' }}>
            <TableCell>Owner</TableCell><TableCell>Vehicle</TableCell><TableCell>Plate</TableCell><TableCell>Status</TableCell><TableCell>Last updated</TableCell><TableCell align="right">Review</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {isFetching && !vehicles.length && Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>{Array.from({ length: 6 }).map((__, cell) => <TableCell key={cell}><Skeleton /></TableCell>)}</TableRow>
            ))}
            {!isFetching && !vehicles.length && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><Typography fontWeight={700}>No KYC cases found</Typography><Typography variant="body2" color="text.secondary">Try changing the search or status filter.</Typography></TableCell></TableRow>
            )}
            {vehicles.map((vehicle) => {
              const isOpen = expanded === vehicle.id
              const ownerName = [vehicle.vh_owner?.first_name, vehicle.vh_owner?.last_name].filter(Boolean).join(' ') || vehicle.vh_owner?.username || 'Unknown owner'
              return (
                <Fragment key={vehicle.id}>
                  <TableRow hover selected={isOpen}>
                    <TableCell><Typography fontWeight={700}>{ownerName}</Typography><Typography variant="caption" color="text.secondary">{vehicle.vh_owner?.email}</Typography></TableCell>
                    <TableCell><Typography fontWeight={650}>{vehicle.name || vehicle.v_type?.disc}</Typography><Typography variant="caption" color="text.secondary">{vehicle.manufacturer} {vehicle.model}</Typography></TableCell>
                    <TableCell>{vehicle.license_plate || '—'}</TableCell>
                    <TableCell><Chip size="small" label={vehicle.kyc_varification} color={vehicle.is_kyc ? 'success' : 'warning'} variant={vehicle.is_kyc ? 'filled' : 'outlined'} /></TableCell>
                    <TableCell>{vehicle.updated_on ? new Date(vehicle.updated_on).toLocaleDateString() : '—'}</TableCell>
                    <TableCell align="right"><IconButton aria-label={`${isOpen ? 'Close' : 'Review'} ${vehicle.license_plate || 'vehicle'}`} aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : vehicle.id)}><ExpandMore sx={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }} /></IconButton></TableCell>
                  </TableRow>
                  <TableRow><TableCell colSpan={6} sx={{ py: 0, borderBottom: isOpen ? undefined : 0 }}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit><Box sx={{ py: 3 }}><KycFormStatus fd={[vehicle]} onUpdated={refetch} /></Box></Collapse>
                  </TableCell></TableRow>
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, next) => setPage(next + 1)}
        onRowsPerPageChange={(event) => setLimit(Number(event.target.value))}
      />
    </Box>
  )
}
