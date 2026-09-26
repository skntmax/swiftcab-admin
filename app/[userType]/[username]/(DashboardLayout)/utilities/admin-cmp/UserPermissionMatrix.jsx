'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { GitBranch, Grid3x3, LayoutGrid, Network } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useGetUserPermissionHierarchyMutation,
  useGetUserPermissionsMatrixMutation,
} from '@app/libs/apis/admin';
import { useAppSelector } from '@app/libs/store';
import AdminMatrixShell, { ACCENT } from './AdminMatrixShell';
import UserPermissionHierarchyTree from './UserPermissionHierarchyTree';
import UserSidebarAccessDialog from './UserSidebarAccessDialog';

const CELL = 28;

const cellState = (user, permissionId) => {
  const inRole = user.rolePermissionIds?.includes(permissionId);
  const inOverride = user.overridePermissionIds?.includes(permissionId);
  const inEffective = user.effectivePermissionIds?.includes(permissionId);

  if (inEffective) {
    return user.hasOverride ? 'effective-override' : 'effective-role';
  }
  if (user.hasOverride && inRole && !inOverride) {
    return 'blocked-by-override';
  }
  if (inOverride && !inRole) {
    return 'override-only';
  }
  if (inRole) {
    return 'role-only';
  }
  return 'none';
};

const readPayload = (result) => {
  if (!result) return null;
  const body = result?.data ?? result;
  if (body?.tree || body?.users || body?.permissions) return body;
  if (body?.data && typeof body.data === 'object') return body.data;
  return body;
};

const CELL_STYLES = {
  'effective-role': { bg: '#22c55e', border: '#16a34a', label: 'Visible (role default)' },
  'effective-override': { bg: '#c4f82a', border: '#84cc16', label: 'Visible (user override active)' },
  'role-only': { bg: 'rgba(59,130,246,0.35)', border: 'rgba(59,130,246,0.55)', label: 'From role (no override on user)' },
  'blocked-by-override': { bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.45)', label: 'Role grants it, but user override hides it' },
  'override-only': { bg: 'rgba(245,158,11,0.35)', border: 'rgba(245,158,11,0.65)', label: 'In override list but not in role capabilities' },
  none: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', label: 'Not granted' },
};

function MatrixCell({ user, permission, onEdit }) {
  const state = cellState(user, permission.id);
  const style = CELL_STYLES[state];

  return (
    <Tooltip
      title={
        <Stack spacing={0.25}>
          <Typography variant="caption" fontWeight={700}>
            {user.username} · {permission.permission_name}
          </Typography>
          <Typography variant="caption">{style.label}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Click to edit user sidebar access
          </Typography>
        </Stack>
      }
      arrow
    >
      <Box
        role="button"
        tabIndex={0}
        aria-label={`${user.username} — ${permission.permission_name}: ${style.label}`}
        onClick={() => onEdit(user)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onEdit(user);
          }
        }}
        sx={{
          width: CELL,
          height: CELL,
          minWidth: CELL,
          borderRadius: 1,
          bgcolor: style.bg,
          border: `1px solid ${style.border}`,
          cursor: 'pointer',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
          '&:hover': { transform: 'scale(1.08)', boxShadow: 2 },
        }}
      />
    </Tooltip>
  );
}

function UserCard({ user, permissionMap, onEdit }) {
  const effective = user.effectivePermissionIds?.map((id) => permissionMap.get(id)).filter(Boolean) || [];
  const blocked = user.hasOverride
    ? user.rolePermissionIds
        ?.filter((id) => !user.effectivePermissionIds?.includes(id))
        .map((id) => permissionMap.get(id))
        .filter(Boolean) || []
    : [];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: user.hasOverride ? 'warning.light' : 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Stack spacing={0.5}>
          <Typography fontWeight={700}>{user.username}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(user.roles || []).map((role) => (
              <Chip key={role} size="small" label={role} variant="outlined" />
            ))}
            {user.hasOverride ? (
              <Chip size="small" color="warning" label="User override" />
            ) : (
              <Chip size="small" variant="outlined" label="Role defaults" />
            )}
          </Stack>
        </Stack>
        <Button size="small" variant="outlined" onClick={() => onEdit(user)}>
          Edit
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Visible in sidebar ({effective.length})
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
        {effective.length > 0 ? (
          effective.map((perm) => (
            <Chip key={perm.id} size="small" label={perm.permission_name} sx={{ bgcolor: 'rgba(196,248,42,0.2)' }} />
          ))
        ) : (
          <Typography variant="caption" color="text.secondary">
            No visible tabs
          </Typography>
        )}
      </Stack>

      {blocked.length > 0 ? (
        <>
          <Typography variant="caption" color="error.main" sx={{ mt: 1.5, display: 'block' }}>
            Hidden by override ({blocked.length})
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
            {blocked.map((perm) => (
              <Chip key={perm.id} size="small" label={perm.permission_name} color="error" variant="outlined" />
            ))}
          </Stack>
        </>
      ) : null}
    </Box>
  );
}

export default function UserPermissionMatrix() {
  const pathname = usePathname();
  const userRoles = useAppSelector((state) => state.userRoles);
  const rolesList = userRoles?.list || [];

  const [view, setView] = useState('matrix');
  const [filterRoleNames, setFilterRoleNames] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sidebarUser, setSidebarUser] = useState(null);
  const [hierarchyUser, setHierarchyUser] = useState(null);
  const [hierarchyTree, setHierarchyTree] = useState(null);
  const [hierarchyError, setHierarchyError] = useState('');
  const [meta, setMeta] = useState({ page: 1, rowPerPage: 10, total: 0 });

  const [fetchMatrix, { data: matrixData, isLoading }] = useGetUserPermissionsMatrixMutation();
  const [fetchHierarchy, { isLoading: hierarchyLoading }] = useGetUserPermissionHierarchyMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const roleIdsForFilter = useMemo(() => {
    if (!rolesList.length || filterRoleNames.length === 0) return [];
    return rolesList.filter((role) => filterRoleNames.includes(role.name)).map((role) => role.id);
  }, [rolesList, filterRoleNames]);

  const loadMatrix = useCallback(() => {
    fetchMatrix({
      pn: meta.page,
      limit: meta.rowPerPage,
      search: debouncedSearch || undefined,
      ...(roleIdsForFilter.length ? { role_id: roleIdsForFilter } : {}),
    });
  }, [fetchMatrix, meta.page, meta.rowPerPage, debouncedSearch, roleIdsForFilter]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  const payload = useMemo(() => readPayload(matrixData), [matrixData]);

  useEffect(() => {
    if (payload?.metadata?.total != null) {
      setMeta((prev) => ({ ...prev, total: Number(payload.metadata.total) || 0 }));
    }
  }, [payload?.metadata?.total]);

  const permissions = payload?.permissions || [];
  const users = payload?.users || [];
  const permissionMap = useMemo(
    () => new Map(permissions.map((perm) => [perm.id, perm])),
    [permissions],
  );

  useEffect(() => {
    if (view !== 'hierarchy' || !hierarchyUser?.id) {
      return;
    }

    let cancelled = false;
    setHierarchyError('');
    setHierarchyTree(null);

    fetchHierarchy({ userId: hierarchyUser.id })
      .unwrap()
      .then((res) => {
        if (cancelled) return;
        const payload = readPayload(res);
        setHierarchyTree(payload?.tree ?? null);
        if (!payload?.tree) {
          setHierarchyError('API returned no hierarchy tree for this user.');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setHierarchyTree(null);
        const message =
          err?.data?.message ||
          err?.message ||
          'Could not load hierarchy — restart swc-api if the route was just added.';
        setHierarchyError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [view, hierarchyUser?.id, fetchHierarchy]);

  useEffect(() => {
    if (view === 'hierarchy' && users.length && !hierarchyUser) {
      setHierarchyUser(users[0]);
    }
  }, [view, users, hierarchyUser]);

  useEffect(() => {
    if (view === 'hierarchy' && hierarchyUser && users.length) {
      const stillVisible = users.some((user) => user.id === hierarchyUser.id);
      if (!stillVisible) {
        setHierarchyUser(users[0]);
      }
    }
  }, [view, users, hierarchyUser]);

  const assignRolesHref = `${pathname}?tabs=assing-roles`;

  return (
    <AdminMatrixShell
      icon={Network}
      title="User permission matrix"
      subtitle="Visual map of which sidebar tabs each user can see — role capabilities, user overrides, and effective sidebar result."
      action={
        <Button component={Link} href={assignRolesHref} variant="outlined" size="small">
          Assign roles
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <Alert severity="info" variant="outlined">
          <strong>Green/lime</strong> = visible in sidebar · <strong>Blue</strong> = role only (no override) ·{' '}
          <strong>Red tint</strong> = role had it but user override removed it · Click any cell to edit that user.
        </Alert>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Tabs value={view} onChange={(_event, value) => setView(value)} sx={{ minHeight: 40 }}>
            <Tab icon={<Grid3x3 size={16} aria-hidden="true" />} iconPosition="start" label="Heatmap" value="matrix" />
            <Tab icon={<LayoutGrid size={16} aria-hidden="true" />} iconPosition="start" label="By user" value="cards" />
            <Tab icon={<GitBranch size={16} aria-hidden="true" />} iconPosition="start" label="Hierarchy" value="hierarchy" />
          </Tabs>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ ml: { md: 'auto' } }}>
            {Object.entries(CELL_STYLES).map(([key, style]) => (
              <Stack key={key} direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: style.bg, border: `1px solid ${style.border}` }} />
                <Typography variant="caption" color="text.secondary">
                  {style.label.split('(')[0].trim()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {rolesList.length > 0 ? (
            <Autocomplete
              multiple
              sx={{ flex: 1 }}
              options={rolesList.map((role) => role.name)}
              value={filterRoleNames}
              onChange={(_event, value) => {
                setFilterRoleNames(value);
                setMeta((prev) => ({ ...prev, page: 1 }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Filter by role" placeholder="All users with roles or overrides" />
              )}
            />
          ) : null}
          <TextField
            sx={{ flex: 1 }}
            label="Search users"
            placeholder="Username or email"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setMeta((prev) => ({ ...prev, page: 1 }));
            }}
          />
        </Stack>

        {view === 'hierarchy' ? (
          <Stack spacing={2}>
            <Autocomplete
              options={users}
              value={hierarchyUser}
              onChange={(_event, value) => setHierarchyUser(value)}
              getOptionLabel={(option) => `${option.username} (${option.email})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="User for hierarchy" placeholder="Pick a user to explore the tree" />
              )}
            />
            {!users.length ? (
              <Alert severity="warning">Load users first (use Heatmap tab filters or clear search), then pick one for the tree.</Alert>
            ) : hierarchyLoading ? (
              <Stack alignItems="center" py={8}>
                <CircularProgress size={28} sx={{ color: ACCENT }} />
              </Stack>
            ) : (
              <UserPermissionHierarchyTree tree={hierarchyTree} errorMessage={hierarchyError} />
            )}
          </Stack>
        ) : isLoading ? (
          <Stack alignItems="center" py={8}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
          </Stack>
        ) : users.length === 0 ? (
          <Alert severity="warning">No users match this filter.</Alert>
        ) : view === 'matrix' ? (
          <Box
            sx={{
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              maxHeight: 'min(70vh, 720px)',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `minmax(180px, 220px) repeat(${permissions.length}, ${CELL}px)`,
                gap: 0.5,
                p: 1.5,
                minWidth: 'max-content',
              }}
            >
              <Box sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper', p: 0.5 }}>
                <Typography variant="caption" fontWeight={700}>
                  User \ Permission
                </Typography>
              </Box>
              {permissions.map((perm) => (
                <Tooltip key={perm.id} title={perm.permission_identifer || perm.permission_name} arrow>
                  <Box
                    sx={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'text.secondary',
                      height: 96,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.25,
                    }}
                  >
                    {perm.permission_name}
                  </Box>
                </Tooltip>
              ))}

              {users.map((user) => (
                <React.Fragment key={user.id}>
                  <Box
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      bgcolor: 'background.paper',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      pr: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: CELL,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user.username}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {user.hasOverride ? (
                        <Chip label="override" size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />
                      ) : null}
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {user.effectivePermissionIds?.length || 0} visible
                      </Typography>
                    </Stack>
                  </Box>
                  {permissions.map((perm) => (
                    <MatrixCell key={`${user.id}-${perm.id}`} user={user} permission={perm} onEdit={setSidebarUser} />
                  ))}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {users.map((user) => (
              <UserCard key={user.id} user={user} permissionMap={permissionMap} onEdit={setSidebarUser} />
            ))}
          </Box>
        )}

        {view !== 'hierarchy' ? (
          <TablePagination
            component="div"
            count={meta.total}
            page={meta.page - 1}
            onPageChange={(_event, newPage) => setMeta((prev) => ({ ...prev, page: newPage + 1 }))}
            rowsPerPage={meta.rowPerPage}
            onRowsPerPageChange={(event) =>
              setMeta((prev) => ({ ...prev, rowPerPage: parseInt(event.target.value, 10), page: 1 }))
            }
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        ) : null}

        <UserSidebarAccessDialog
          open={Boolean(sidebarUser)}
          user={sidebarUser}
          onClose={() => {
            setSidebarUser(null);
            loadMatrix();
            if (hierarchyUser?.id && view === 'hierarchy') {
              fetchHierarchy({ userId: hierarchyUser.id })
                .unwrap()
                .then((res) => setHierarchyTree(readPayload(res)?.tree ?? null))
                .catch((err) =>
                  setHierarchyError(err?.data?.message || err?.message || 'Failed to refresh hierarchy'),
                );
            }
          }}
        />
      </Stack>
    </AdminMatrixShell>
  );
}
