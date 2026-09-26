'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useGetMenuPermissionsMutation,
  useGetUserPermissionsMutation,
  useSetUserPermissionsMutation,
} from '@app/libs/apis/admin';
import { contextProvider } from '@components/AppProvider';

const sameIds = (left, right) => {
  const a = [...(left || [])].sort((x, y) => x - y);
  const b = [...(right || [])].sort((x, y) => x - y);
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const readPayload = (result) => result?.data ?? result;

export default function UserSidebarAccessDialog({ open, user, onClose }) {
  const { successMessage, errorMessage } = useContext(contextProvider);
  const [allPermissions, setAllPermissions] = useState([]);
  const [draftPermissionIds, setDraftPermissionIds] = useState([]);
  const [originalPermissionIds, setOriginalPermissionIds] = useState([]);
  const [hasOverride, setHasOverride] = useState(false);

  const [getPermissions, { isLoading: loadingCatalog }] = useGetMenuPermissionsMutation();
  const [getUserPermissions, { isLoading: loadingUser }] = useGetUserPermissionsMutation();
  const [setUserPermissions, { isLoading: saving }] = useSetUserPermissionsMutation();

  useEffect(() => {
    if (!open) return;

    getPermissions({ page: 1, rowsPerPage: 500 })
      .unwrap()
      .then((res) => {
        const payload = readPayload(res);
        setAllPermissions(payload?.permissions || []);
      })
      .catch(() => setAllPermissions([]));

    if (!user?.id) return;

    getUserPermissions({ userId: user.id })
      .unwrap()
      .then((res) => {
        const payload = readPayload(res);
        const ids = payload?.permission_id || [];
        setDraftPermissionIds(ids);
        setOriginalPermissionIds(ids);
        setHasOverride(Boolean(payload?.hasOverride));
      })
      .catch(() => {
        setDraftPermissionIds([]);
        setOriginalPermissionIds([]);
        setHasOverride(false);
      });
  }, [open, user?.id, getPermissions, getUserPermissions]);

  const permissionOptions = useMemo(
    () =>
      allPermissions.map((perm) => ({
        id: perm.id,
        label: perm.permission_name,
        identifier: perm.permission_identifer,
      })),
    [allPermissions],
  );

  const selectedOptions = useMemo(
    () => permissionOptions.filter((option) => draftPermissionIds.includes(option.id)),
    [permissionOptions, draftPermissionIds],
  );

  const dirty = !sameIds(draftPermissionIds, originalPermissionIds);
  const loading = loadingCatalog || loadingUser;

  const save = async () => {
    if (!user?.id) return;
    try {
      const res = await setUserPermissions({
        userId: user.id,
        permission_id: draftPermissionIds,
      }).unwrap();
      successMessage?.(readPayload(res)?.message || res?.message || 'User sidebar access updated');
      setOriginalPermissionIds([...draftPermissionIds]);
      setHasOverride(draftPermissionIds.length > 0);
    } catch (err) {
      errorMessage?.(err?.data?.message || err?.message || 'Failed to update sidebar access');
    }
  };

  const clearOverride = async () => {
    if (!user?.id) return;
    try {
      await setUserPermissions({ userId: user.id, permission_id: [] }).unwrap();
      setDraftPermissionIds([]);
      setOriginalPermissionIds([]);
      setHasOverride(false);
      successMessage?.('User override cleared — role capability defaults apply');
    } catch (err) {
      errorMessage?.(err?.data?.message || err?.message || 'Failed to clear override');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Sidebar access — {user?.username || 'user'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info" variant="outlined">
            Gate 3 (optional): tabs shown = role menu + role capabilities ∩ user-selected permissions.
            Clear override to fall back to role-only rules.
          </Alert>

          {hasOverride ? (
            <Chip size="small" color="warning" label="User-specific override active" />
          ) : (
            <Chip size="small" variant="outlined" label="Using role defaults (no user override)" />
          )}

          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <Autocomplete
              multiple
              options={permissionOptions}
              getOptionLabel={(option) => option.label || option.identifier || String(option.id)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedOptions}
              onChange={(_event, newValue) => setDraftPermissionIds(newValue.map((item) => item.id))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Allowed sidebar tab permissions"
                  placeholder="Select permissions this user may see"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={option.id} label={option.label} size="small" {...getTagProps({ index })} />
                ))
              }
            />
          )}

          <Typography variant="caption" color="text.secondary">
            {permissionOptions.length} permissions in catalog · user should refresh or re-login for sidebar changes
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button color="warning" onClick={clearOverride} disabled={saving || !hasOverride}>
          Clear override
        </Button>
        <Button variant="contained" onClick={save} disabled={saving || !dirty}>
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Save sidebar access'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
