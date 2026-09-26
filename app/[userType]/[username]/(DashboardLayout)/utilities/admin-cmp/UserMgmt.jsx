'use client'

import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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
  Tooltip,
  Typography,
} from '@mui/material'
import {
  BlockOutlined,
  CheckCircleOutline,
  DeleteOutline,
  DirectionsCarFilledOutlined,
  GroupOutlined,
  PersonOffOutlined,
  Refresh,
  Search,
  VerifiedOutlined,
  WarehouseOutlined,
} from '@mui/icons-material'
import {
  useBlockUnblockUserMutation,
  useListUsersQuery,
  useRemoveUserMutation,
} from '@app/libs/apis/admin'
import { useAppSelector } from '@app/libs/store'
import { contextProvider } from '@components/AppProvider'

const ACCENT = '#c4f82a'
const INK = '#0b0b0b'

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [delay, value])

  return debounced
}

function initials(user) {
  const value = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'U'
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function displayName(user) {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
}

function verificationChipColor(entry) {
  if (!entry?.applicable) return 'default'
  if (entry.verified) return 'success'
  if (entry.status === 'REJECTED' || entry.status === 'SUSPENDED' || entry.label === 'Action required') return 'error'
  return 'warning'
}

function VerificationChips({ user }) {
  const chips = []
  if (user.driver?.applicable) {
    chips.push({
      key: 'driver',
      icon: <DirectionsCarFilledOutlined />,
      label: `Driver · ${user.driver.label}`,
      color: verificationChipColor(user.driver),
    })
  }
  if (user.owner?.applicable) {
    chips.push({
      key: 'owner',
      icon: <WarehouseOutlined />,
      label: `Owner · ${user.owner.label}`,
      color: verificationChipColor(user.owner),
    })
  }
  if (!chips.length) {
    return <Typography variant="body2" color="text.secondary">—</Typography>
  }
  return (
    <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.5}>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          icon={chip.icon}
          label={chip.label}
          size="small"
          color={chip.color}
          variant={chip.color === 'success' ? 'filled' : 'outlined'}
          sx={{ maxWidth: '100%', '& .MuiChip-label': { whiteSpace: 'nowrap' } }}
          aria-label={chip.label}
        />
      ))}
    </Stack>
  )
}

function StatCard({ icon, label, value, tone }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: '1 1 180px',
        p: 2,
        borderRadius: 3,
        borderColor: 'rgba(15, 23, 42, 0.1)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: tone,
            color: INK,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1.1}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

function LoadingRows() {
  return Array.from({ length: 6 }, (_, index) => (
    <TableRow key={index}>
      <TableCell><Stack direction="row" spacing={1.5} alignItems="center"><Skeleton variant="circular" width={38} height={38} /><Box><Skeleton width={130} /><Skeleton width={90} /></Box></Stack></TableCell>
      <TableCell><Skeleton width={180} /></TableCell>
      <TableCell><Skeleton width={110} /></TableCell>
      <TableCell><Skeleton width={160} /></TableCell>
      <TableCell><Skeleton width={78} /></TableCell>
      <TableCell><Skeleton width={88} /></TableCell>
      <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
    </TableRow>
  ))
}

const UserManagement = () => {
  const { successMessage, errorMessage } = useContext(contextProvider)
  const userRoles = useAppSelector((state) => state.userRoles)
  const roles = Array.isArray(userRoles?.list) ? userRoles.list : []
  const [query, setQuery] = useState('')
  const [selectedRoles, setSelectedRoles] = useState([])
  const [status, setStatus] = useState('all')
  const [verification, setVerification] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [action, setAction] = useState(null)
  const debouncedQuery = useDebouncedValue(query.trim(), 350)

  const params = useMemo(() => ({
    q: debouncedQuery,
    page: page + 1,
    limit: rowsPerPage,
    roles: selectedRoles.map((role) => role.id),
    status,
    verification,
  }), [debouncedQuery, page, rowsPerPage, selectedRoles, status, verification])

  const { data, error, isFetching, refetch } = useListUsersQuery(params)
  const [removeUser, { isLoading: removing }] = useRemoveUserMutation()
  const [blockUnblock, { isLoading: changingStatus }] = useBlockUnblockUserMutation()

  const payload = data?.data || {}
  const users = Array.isArray(payload.users) ? payload.users : []
  const metadata = payload.metadata || { total: 0 }
  const summary = payload.summary || { total: 0, active: 0, inactive: 0, verifiedDrivers: 0, verifiedOwners: 0 }

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil((metadata.total || 0) / rowsPerPage) - 1)
    if (page > lastPage) setPage(lastPage)
  }, [metadata.total, page, rowsPerPage])

  async function confirmAction() {
    if (!action?.user) return
    try {
      let response
      if (action.kind === 'delete') {
        response = await removeUser({ username: action.user.username }).unwrap()
        if (response?.error) throw new Error(response.message || 'Unable to delete user')
        successMessage('User deleted')
      } else {
        response = await blockUnblock({
          username: action.user.username,
          isActive: action.nextActive,
        }).unwrap()
        if (response?.error) throw new Error(response.message || 'Unable to update user')
        successMessage(action.nextActive ? 'User activated' : 'User deactivated')
      }
      setAction(null)
    } catch (requestError) {
      errorMessage(requestError?.data?.message || requestError?.message || 'The user could not be updated')
    }
  }

  const busy = removing || changingStatus

  return (
    <Box sx={{ p: { xs: 1, sm: 2.5 }, maxWidth: 1500, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={850} letterSpacing="-0.03em" color={INK}>
            User management
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            Find accounts, review driver and owner verification, and control account access.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh aria-hidden="true" />}
          onClick={refetch}
          disabled={isFetching}
          sx={{ alignSelf: { xs: 'stretch', md: 'center' }, borderRadius: 2.5, minHeight: 44 }}
        >
          Refresh
        </Button>
      </Stack>

      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1.5} mb={2.5}>
        <StatCard icon={<GroupOutlined />} label="Matching users" value={summary.total || 0} tone="rgba(196, 248, 42, 0.55)" />
        <StatCard icon={<CheckCircleOutline />} label="Active" value={summary.active || 0} tone="rgba(74, 222, 128, 0.28)" />
        <StatCard icon={<VerifiedOutlined />} label="Verified drivers" value={summary.verifiedDrivers || 0} tone="rgba(96, 165, 250, 0.28)" />
        <StatCard icon={<WarehouseOutlined />} label="Verified owners" value={summary.verifiedOwners || 0} tone="rgba(251, 191, 36, 0.28)" />
        <StatCard icon={<PersonOffOutlined />} label="Inactive" value={summary.inactive || 0} tone="rgba(251, 113, 133, 0.2)" />
      </Stack>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, borderColor: 'rgba(15, 23, 42, 0.1)', mb: 2 }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(0)
            }}
            placeholder="Search name, username, email, or phone"
            label="Search users"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search aria-hidden="true" /></InputAdornment>,
            }}
          />
          <Autocomplete
            multiple
            options={roles}
            value={selectedRoles}
            onChange={(_, value) => {
              setSelectedRoles(value)
              setPage(0)
            }}
            getOptionLabel={(option) => option.label || option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={{ minWidth: { lg: 340 } }}
            renderInput={(paramsInput) => <TextField {...paramsInput} label="Roles" placeholder={selectedRoles.length ? '' : 'All roles'} />}
            renderTags={(value, getTagProps) => value.map((role, index) => (
              <Chip {...getTagProps({ index })} key={role.id} label={role.label || role.name} size="small" />
            ))}
          />
          <TextField
            select
            label="Account status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(0)
            }}
            sx={{ minWidth: { lg: 190 } }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            select
            label="Verification"
            value={verification}
            onChange={(event) => {
              setVerification(event.target.value)
              setPage(0)
            }}
            sx={{ minWidth: { lg: 210 } }}
          >
            <MenuItem value="all">All verification</MenuItem>
            <MenuItem value="driver-verified">Verified drivers</MenuItem>
            <MenuItem value="owner-verified">Verified owners</MenuItem>
            <MenuItem value="pending">Needs KYC review</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {(error || data?.error) && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>} sx={{ mb: 2 }}>
          User records could not be loaded.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: 'rgba(15, 23, 42, 0.1)' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1080 }} aria-label="User accounts">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Verification</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Joined</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? <LoadingRows /> : users.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar src={user.avatar || undefined} alt="" sx={{ bgcolor: INK, color: ACCENT, fontWeight: 800 }}>
                        {initials(user)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={750}>{displayName(user)}</Typography>
                        <Typography variant="body2" color="text.secondary">@{user.username}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.phone || 'No phone number'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.5}>
                      {(user.roles || []).map((role) => (
                        <Chip key={role.id} label={role.label || role.name} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <VerificationChips user={user} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={user.isActive ? <CheckCircleOutline /> : <BlockOutlined />}
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      variant={user.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.createdAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(user.createdAt)) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={user.isActive ? 'Deactivate account' : 'Activate account'}>
                      <IconButton
                        aria-label={`${user.isActive ? 'Deactivate' : 'Activate'} ${user.username}`}
                        onClick={() => setAction({ kind: 'status', user, nextActive: !user.isActive })}
                        color={user.isActive ? 'warning' : 'success'}
                      >
                        {user.isActive ? <BlockOutlined /> : <CheckCircleOutline />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <IconButton
                        aria-label={`Delete ${user.username}`}
                        onClick={() => setAction({ kind: 'delete', user })}
                        color="error"
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!isFetching && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Stack alignItems="center" py={7} spacing={1} textAlign="center">
                      <Avatar sx={{ bgcolor: 'rgba(196, 248, 42, 0.3)', color: INK }}><Search /></Avatar>
                      <Typography fontWeight={800}>No users found</Typography>
                      <Typography variant="body2" color="text.secondary">Try a different search, role, or status filter.</Typography>
                      <Button onClick={() => { setQuery(''); setSelectedRoles([]); setStatus('all'); setVerification('all') }}>Clear filters</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={metadata.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value))
            setPage(0)
          }}
          labelRowsPerPage="Users per page"
        />
      </Paper>

      <Dialog open={Boolean(action)} onClose={busy ? undefined : () => setAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={800}>
          {action?.kind === 'delete'
            ? 'Delete user?'
            : `${action?.nextActive ? 'Activate' : 'Deactivate'} account?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {action?.kind === 'delete'
              ? <>This permanently deletes <strong>{action?.user?.username}</strong> and cannot be undone.</>
              : <><strong>{action?.user?.username}</strong> will {action?.nextActive ? 'regain' : 'lose'} access to SwiftCab.</>}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAction(null)} disabled={busy}>Cancel</Button>
          <Button
            onClick={confirmAction}
            disabled={busy}
            variant="contained"
            color={action?.kind === 'delete' || !action?.nextActive ? 'error' : 'success'}
          >
            {busy ? 'Saving…' : action?.kind === 'delete' ? 'Delete user' : action?.nextActive ? 'Activate' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement
