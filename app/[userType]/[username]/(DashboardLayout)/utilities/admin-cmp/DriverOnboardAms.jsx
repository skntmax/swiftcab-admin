'use client'

import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
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
import { AssignmentTurnedIn, ExpandMore, Launch, PersonSearch, ReportProblemOutlined, Search } from '@mui/icons-material'
import { useDecideOnboardingCaseMutation, useOnboardingQueueQuery } from '@app/libs/apis/admin'
import { contextProvider } from '@components/AppProvider'

const REASON_CODES = [
  'DOCUMENT_UNCLEAR', 'DOCUMENT_EXPIRED', 'DOCUMENT_MISMATCH', 'VEHICLE_NOT_ELIGIBLE',
  'IDENTITY_REVIEW_REQUIRED', 'TRAINING_INCOMPLETE', 'DUPLICATE_ACCOUNT',
]

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function statusColour(status) {
  if (status === 'ACTION_REQUIRED') return 'error'
  if (status === 'UNDER_REVIEW' || status === 'DOCUMENTS_SUBMITTED') return 'warning'
  return 'default'
}

function ReviewDetails({ item, onDecision }) {
  const documents = Array.isArray(item.documents) ? item.documents : []
  const verification = item.verification || {}
  const images = [
    ['Selfie', verification.selfieUrl],
    ['Vehicle front', verification.vehicleFrontUrl],
    ['Vehicle rear', verification.vehicleRearUrl],
    ['Number plate', verification.vehiclePlateUrl],
  ].filter(([, url]) => Boolean(url))

  return (
    <Stack spacing={2.5} sx={{ py: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, flex: 1 }}>
          <Typography variant="overline" color="text.secondary">Driver profile</Typography>
          <Typography fontWeight={800}>{item.profile?.fullName || `${item.driver?.firstName || ''} ${item.driver?.lastName || ''}`.trim() || item.driver?.username}</Typography>
          <Typography variant="body2">{item.phone || item.driver?.phone}</Typography>
          <Typography variant="body2" color="text.secondary">{[item.profile?.city, item.profile?.state, item.profile?.pincode].filter(Boolean).join(', ') || 'Address not provided'}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, flex: 1 }}>
          <Typography variant="overline" color="text.secondary">Readiness</Typography>
          <Typography fontWeight={750}>Documents {item.documentProgress?.complete || 0}/{item.documentProgress?.total || 0}</Typography>
          <Typography fontWeight={750}>Training {item.training?.completed || 0}/{item.training?.total || 0}</Typography>
          <Typography variant="body2" color="text.secondary">Payout {item.payoutVerified ? 'verified' : 'not verified'} · {item.earningPlan || 'No earning plan'}</Typography>
        </Paper>
      </Stack>

      <Box>
        <Typography variant="subtitle1" fontWeight={800} mb={1}>Documents</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          {documents.map((document) => (
            <Chip
              key={document.id || document.document_type}
              component={document.file_url ? Link : 'div'}
              href={document.file_url || undefined}
              target={document.file_url ? '_blank' : undefined}
              clickable={Boolean(document.file_url)}
              icon={document.file_url ? <Launch /> : undefined}
              label={`${document.catalog?.name || document.document_type}: ${document.verification_status}`}
              color={document.verification_status === 'REJECTED' ? 'error' : document.file_url ? 'success' : 'default'}
              variant="outlined"
            />
          ))}
          {!documents.length && <Alert severity="warning">No documents are attached to this case.</Alert>}
        </Stack>
      </Box>

      {images.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={800} mb={1}>Identity and vehicle photos</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 1.5 }}>
            {images.map(([label, url]) => (
              <Link key={label} href={url} target="_blank" rel="noopener noreferrer" underline="none">
                <Box component="img" src={url} alt={label} sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }} />
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Link>
            ))}
          </Box>
        </Box>
      )}

      {item.rejectionReason && <Alert severity="warning"><strong>Previous feedback:</strong> {item.rejectionReason}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
        <Button color="error" variant="outlined" onClick={() => onDecision(item, 'REJECT')}>Reject</Button>
        <Button color="warning" variant="outlined" onClick={() => onDecision(item, 'ACTION_REQUIRED')}>Request changes</Button>
        <Button color="success" variant="contained" onClick={() => onDecision(item, 'APPROVE')}>Approve driver</Button>
      </Stack>
    </Stack>
  )
}

export default function DriverOnboardAms() {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [expanded, setExpanded] = useState(null)
  const [decision, setDecision] = useState(null)
  const [reasonCode, setReasonCode] = useState('')
  const [comment, setComment] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const params = useMemo(() => ({ q: debouncedQuery, page, limit, status }), [debouncedQuery, page, limit, status])
  const { data, error, isFetching } = useOnboardingQueueQuery(params)
  const [decide, { isLoading: isSaving }] = useDecideOnboardingCaseMutation()
  const payload = data?.data || {}
  const items = Array.isArray(payload.items) ? payload.items : []
  const summary = payload.summary || {}

  useEffect(() => setPage(1), [debouncedQuery, status, limit])

  function openDecision(item, action) {
    setDecision({ item, action })
    setReasonCode('')
    setComment('')
  }

  async function submitDecision() {
    if (!decision) return
    if (decision.action !== 'APPROVE' && !reasonCode) {
      errorMessage('Select a reason code before continuing')
      return
    }
    try {
      const response = await decide({
        driverId: decision.item.driverId,
        action: decision.action,
        reasonCode: reasonCode || undefined,
        comment: comment.trim() || undefined,
      }).unwrap()
      if (response?.error) throw new Error(response.message || 'Unable to save decision')
      successMessage(decision.action === 'APPROVE' ? 'Driver approved' : 'Review decision saved')
      setDecision(null)
      setExpanded(null)
    } catch (saveError) {
      errorMessage(saveError?.data?.message || saveError?.message || 'Unable to save decision')
    }
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1500, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box><Typography variant="h4" fontWeight={850}>Driver onboarding</Typography><Typography color="text.secondary">Review complete onboarding cases in submission order.</Typography></Box>
        <Stack direction="row" spacing={1}><Chip icon={<PersonSearch />} label={`${summary.awaitingReview || 0} awaiting review`} color="warning" variant="outlined" /><Chip icon={<ReportProblemOutlined />} label={`${summary.actionRequired || 0} action required`} color="error" variant="outlined" /></Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField fullWidth size="small" label="Search driver, phone or email" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
          <TextField select size="small" label="Queue status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 210 }}>
            <MenuItem value="all">All review cases</MenuItem>
            {['UNDER_REVIEW', 'DOCUMENTS_SUBMITTED', 'ACTION_REQUIRED'].map((item) => <MenuItem key={item} value={item}>{item.replaceAll('_', ' ')}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>Unable to load the onboarding queue.</Alert>}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 900 }} aria-label="Driver onboarding review queue">
          <TableHead><TableRow sx={{ bgcolor: '#f8fafc' }}><TableCell>Driver</TableCell><TableCell>Service</TableCell><TableCell>Progress</TableCell><TableCell>Documents</TableCell><TableCell>Status</TableCell><TableCell>Submitted</TableCell><TableCell align="right">Review</TableCell></TableRow></TableHead>
          <TableBody>
            {isFetching && !items.length && Array.from({ length: 5 }).map((_, row) => <TableRow key={row}>{Array.from({ length: 7 }).map((__, cell) => <TableCell key={cell}><Skeleton /></TableCell>)}</TableRow>)}
            {!isFetching && !items.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><AssignmentTurnedIn color="disabled" sx={{ fontSize: 44 }} /><Typography fontWeight={800}>No onboarding cases found</Typography><Typography variant="body2" color="text.secondary">The selected queue is clear.</Typography></TableCell></TableRow>}
            {items.map((item) => {
              const isOpen = expanded === item.id
              const name = item.profile?.fullName || item.driver?.username || item.phone
              return <Fragment key={item.id}>
                <TableRow hover selected={isOpen}>
                  <TableCell><Stack direction="row" spacing={1.25} alignItems="center"><Avatar src={item.profile?.profilePhotoUrl}>{String(name || '?')[0]}</Avatar><Box><Typography fontWeight={750}>{name}</Typography><Typography variant="caption" color="text.secondary">{item.driver?.phone || item.phone}</Typography></Box></Stack></TableCell>
                  <TableCell>{item.selectedService || '—'}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}><Stack spacing={0.5}><Typography variant="caption">Step {item.currentStep}/10 · {item.completionPercent || 0}%</Typography><LinearProgress variant="determinate" value={Math.min(100, item.completionPercent || 0)} /></Stack></TableCell>
                  <TableCell>{item.documentProgress?.complete || 0}/{item.documentProgress?.total || 0}</TableCell>
                  <TableCell><Chip size="small" label={item.status} color={statusColour(item.status)} variant="outlined" /></TableCell>
                  <TableCell>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell align="right"><IconButton aria-label={`${isOpen ? 'Close' : 'Review'} ${name}`} aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : item.id)}><ExpandMore sx={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }} /></IconButton></TableCell>
                </TableRow>
                <TableRow><TableCell colSpan={7} sx={{ py: 0, borderBottom: isOpen ? undefined : 0 }}><Collapse in={isOpen} timeout="auto" unmountOnExit><ReviewDetails item={item} onDecision={openDecision} /></Collapse></TableCell></TableRow>
              </Fragment>
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={payload.metadata?.total || 0} page={page - 1} rowsPerPage={limit} rowsPerPageOptions={[5, 10, 25, 50]} onPageChange={(_, next) => setPage(next + 1)} onRowsPerPageChange={(event) => setLimit(Number(event.target.value))} />

      <Dialog open={Boolean(decision)} onClose={() => !isSaving && setDecision(null)} fullWidth maxWidth="sm">
        <DialogTitle>{decision?.action === 'APPROVE' ? 'Approve driver' : decision?.action === 'REJECT' ? 'Reject onboarding' : 'Request changes'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}><Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">This decision will be recorded in the review history and shared with the driver.</Typography>
          {decision?.action !== 'APPROVE' && <TextField select required label="Reason code" value={reasonCode} onChange={(event) => setReasonCode(event.target.value)}>{REASON_CODES.map((code) => <MenuItem key={code} value={code}>{code.replaceAll('_', ' ')}</MenuItem>)}</TextField>}
          <TextField multiline minRows={3} label={decision?.action === 'APPROVE' ? 'Approval note (optional)' : 'Clear instructions for the driver'} value={comment} onChange={(event) => setComment(event.target.value)} />
        </Stack></DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setDecision(null)} disabled={isSaving}>Cancel</Button><Button variant="contained" color={decision?.action === 'REJECT' ? 'error' : decision?.action === 'ACTION_REQUIRED' ? 'warning' : 'success'} onClick={submitDecision} disabled={isSaving}>{isSaving ? 'Saving…' : 'Confirm decision'}</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
