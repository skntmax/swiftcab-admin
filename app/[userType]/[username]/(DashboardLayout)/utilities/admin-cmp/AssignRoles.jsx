'use client';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
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
} from '@mui/material';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGetUserByRoleMutation, useUpdateRolesMutation } from '@app/libs/apis/admin';
import { useAppSelector } from '@app/libs/store';
import { contextProvider } from '@components/AppProvider';
import AdminMatrixShell, { ACCENT, INK } from './AdminMatrixShell';
import UserSidebarAccessDialog from './UserSidebarAccessDialog';

const ROLE_COLORS = [
  '#E91E63', '#3F51B5', '#009688', '#F44336', '#9C27B0', '#4CAF50', '#FF5722',
  '#795548', '#607D8B', '#FFC107', '#00BCD4', '#CDDC39', '#8BC34A', '#673AB7',
  '#2196F3', '#FF9800', '#F06292', '#00ACC1', '#C2185B', '#388E3C', '#1976D2',
];

const roleColor = (role, rolesList) => {
  const idx = rolesList.findIndex((item) => item.name === role?.name || item.id === role?.id);
  return ROLE_COLORS[(idx >= 0 ? idx : role?.id || 0) % ROLE_COLORS.length];
};

const sameRoleIds = (left, right) => {
  const a = [...(left || [])].sort((x, y) => x - y);
  const b = [...(right || [])].sort((x, y) => x - y);
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const AssignRoles = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefilterRole = searchParams.get('role');
  const userRoles = useAppSelector((state) => state.userRoles);
  const rolesList = userRoles?.list || [];
  const { successMessage, errorMessage } = useContext(contextProvider);

  const [filterRoleNames, setFilterRoleNames] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [draftRolesByUser, setDraftRolesByUser] = useState({});
  const [originalRolesByUser, setOriginalRolesByUser] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);
  const [sidebarUser, setSidebarUser] = useState(null);

  const [meta, setMeta] = useState({
    page: 1,
    rowPerPage: 10,
    rowsPerPageOption: [5, 10, 25, 50],
    total: 0,
  });

  const [getUser, { data: getUserData, isLoading: getUserDataLoading }] = useGetUserByRoleMutation();
  const [updateRole] = useUpdateRolesMutation();

  const roleIdsForFilter = useMemo(() => {
    if (!rolesList.length) return [];
    if (filterRoleNames.length === 0) {
      return rolesList.map((role) => role.id);
    }
    return rolesList
      .filter((role) => filterRoleNames.includes(role.name))
      .map((role) => role.id);
  }, [rolesList, filterRoleNames]);

  useEffect(() => {
    if (!rolesList.length || !prefilterRole) return;
    if (rolesList.some((role) => role.name === prefilterRole)) {
      setFilterRoleNames([prefilterRole]);
    }
  }, [rolesList, prefilterRole]);

  const fetchUsers = useCallback(() => {
    if (roleIdsForFilter.length === 0) return;
    getUser({
      role_id: roleIdsForFilter,
      pn: meta.page,
      limit: meta.rowPerPage,
    });
  }, [getUser, meta.page, meta.rowPerPage, roleIdsForFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const users = getUserData?.data?.users;
    if (!Array.isArray(users)) return;

    const nextDraft = {};
    const nextOriginal = {};
    users.forEach((user) => {
      nextDraft[user.id] = [...(user.role || [])];
      nextOriginal[user.id] = [...(user.roleId || [])];
    });
    setDraftRolesByUser(nextDraft);
    setOriginalRolesByUser(nextOriginal);

    if (getUserData?.data?.metadata?.total != null) {
      setMeta((prev) => ({ ...prev, total: Number(getUserData.data.metadata.total) || 0 }));
    }
  }, [getUserData]);

  const roleNamesToIds = useCallback(
    (names) =>
      rolesList
        .filter((role) => (names || []).includes(role.name))
        .map((role) => role.id),
    [rolesList],
  );

  const hasChanges = useCallback(
    (userId) => {
      const draftIds = roleNamesToIds(draftRolesByUser[userId]);
      const originalIds = originalRolesByUser[userId] || [];
      return !sameRoleIds(draftIds, originalIds);
    },
    [draftRolesByUser, originalRolesByUser, roleNamesToIds],
  );

  const saveRoles = async (userId) => {
    const roleIds = roleNamesToIds(draftRolesByUser[userId]);
    setSavingUserId(userId);
    try {
      const res = await updateRole({ userId, role_id: roleIds }).unwrap();
      successMessage?.(res?.message || 'Roles updated successfully');
      fetchUsers();
    } catch (err) {
      errorMessage?.(err?.data?.message || err?.message || 'Failed to update roles');
    } finally {
      setSavingUserId(null);
    }
  };

  const resetRow = (userId) => {
    const originalNames = rolesList
      .filter((role) => (originalRolesByUser[userId] || []).includes(role.id))
      .map((role) => role.name);
    setDraftRolesByUser((prev) => ({ ...prev, [userId]: originalNames }));
  };

  const filteredUsers = useMemo(() => {
    const users = getUserData?.data?.users || [];
    const query = searchText.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        String(user.username || '').toLowerCase().includes(query) ||
        String(user.email || '').toLowerCase().includes(query),
    );
  }, [getUserData?.data?.users, searchText]);

  const handleChangePage = (_event, newPage) => {
    setMeta((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setMeta((prev) => ({
      ...prev,
      rowPerPage: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  return (
    <AdminMatrixShell
      icon={Shield}
      title="Assign roles & user sidebar access"
      subtitle="Gate 3: assign roles to users, then optionally restrict which sidebar tabs each user sees (intersected with their role capabilities)."
      step={5}
      totalSteps={5}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component={Link}
            href={`${pathname}?tabs=user-permission-matrix`}
            size="small"
            variant="outlined"
          >
            Permission matrix
          </Button>
          <Chip
            label={`${meta.total} user${meta.total === 1 ? '' : 's'}`}
            sx={{ bgcolor: 'rgba(196,248,42,0.12)', color: ACCENT, border: `1px solid rgba(196,248,42,0.35)` }}
          />
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        <Alert severity="info" variant="outlined">
          Role assignment controls which role the user logs in as. Use <strong>Sidebar</strong> on a row to limit visible tabs for that specific user without changing their role.
        </Alert>
        {rolesList.length > 0 && (
          <Autocomplete
            multiple
            options={rolesList.map((role) => role.name)}
            getOptionLabel={(option) => option}
            value={filterRoleNames}
            onChange={(_event, newValue) => {
              setFilterRoleNames(newValue);
              setMeta((prev) => ({ ...prev, page: 1 }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const role = rolesList.find((item) => item.name === option);
                return (
                  <Chip
                    key={option}
                    label={role?.label || option}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{
                      bgcolor: roleColor(role || { name: option }, rolesList),
                      color: '#fff',
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter users by role"
                placeholder={filterRoleNames.length ? 'Users matching any selected role' : 'Leave empty to include all roles'}
                helperText={filterRoleNames.length === 0 ? 'Showing users who have at least one role assigned.' : undefined}
              />
            )}
          />
        )}

        <TextField
          label="Search on this page"
          placeholder="Username or email"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          fullWidth
        />

      {getUserDataLoading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={28} sx={{ color: ACCENT }} />
        </Stack>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Username</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell sx={{ minWidth: 360 }}><b>Roles</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const draftNames = draftRolesByUser[user.id] || [];
                  const dirty = hasChanges(user.id);
                  const isSaving = savingUserId === user.id;

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Autocomplete
                          multiple
                          size="small"
                          options={rolesList.map((role) => role.name)}
                          getOptionLabel={(option) => {
                            const role = rolesList.find((item) => item.name === option);
                            return role?.label || option;
                          }}
                          value={draftNames}
                          onChange={(_event, newValue) => {
                            setDraftRolesByUser((prev) => ({ ...prev, [user.id]: newValue }));
                          }}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                              const role = rolesList.find((item) => item.name === option);
                              return (
                                <Chip
                                  key={`${user.id}-${option}`}
                                  label={role?.label || option}
                                  size="small"
                                  {...getTagProps({ index })}
                                  sx={{
                                    bgcolor: roleColor(role || { name: option }, rolesList),
                                    color: '#fff',
                                  }}
                                />
                              );
                            })
                          }
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Select roles" />
                          )}
                          sx={{ minWidth: 280 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                          <Button size="small" variant="text" onClick={() => setSidebarUser(user)}>
                            Sidebar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={!dirty || isSaving}
                            onClick={() => resetRow(user.id)}
                          >
                            Reset
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!dirty || isSaving}
                            onClick={() => saveRoles(user.id)}
                            sx={{
                              bgcolor: INK,
                              '&:hover': { bgcolor: '#222' },
                              minWidth: 92,
                            }}
                          >
                            {isSaving ? <CircularProgress size={18} color="inherit" /> : 'Save roles'}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No users found for the selected role filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={meta.rowsPerPageOption}
        component="div"
        count={meta.total}
        rowsPerPage={meta.rowPerPage}
        page={meta.page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <UserSidebarAccessDialog
        open={Boolean(sidebarUser)}
        user={sidebarUser}
        onClose={() => setSidebarUser(null)}
      />
      </Stack>
    </AdminMatrixShell>
  );
};

export default AssignRoles;
