'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
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
import { KeyRound, Shield, UserCog } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@app/libs/store';

const ACCENT = '#c4f82a';
const INK = '#0b0b0b';

const ROLE_COLORS = [
  '#E91E63', '#3F51B5', '#009688', '#F44336', '#9C27B0', '#4CAF50', '#FF5722',
  '#795548', '#607D8B', '#FFC107', '#00BCD4', '#CDDC39', '#8BC34A', '#673AB7',
  '#2196F3', '#FF9800', '#F06292', '#00ACC1', '#C2185B', '#388E3C', '#1976D2',
];

const roleColor = (index) => ROLE_COLORS[index % ROLE_COLORS.length];

const RolesManagement = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rolesData = useAppSelector((state) => state.userRoles.list) || [];

  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRoles = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return rolesData.filter((role) => {
      if (!query) return true;
      return (
        String(role.name || '').toLowerCase().includes(query) ||
        String(role.label || '').toLowerCase().includes(query) ||
        String(role.id || '').includes(query)
      );
    });
  }, [rolesData, searchText]);

  const pagedRoles = useMemo(
    () => filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRoles, page, rowsPerPage],
  );

  const goToAssignRoles = (roleName) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tabs', 'assing-roles');
    if (roleName) {
      params.set('role', roleName);
    } else {
      params.delete('role');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.08)',
          background: `linear-gradient(135deg, ${INK} 0%, #151515 100%)`,
          color: '#f4f4f5',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <KeyRound size={22} color={ACCENT} aria-hidden="true" />
              <Typography variant="h5" fontWeight={700}>
                Role catalog
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(244,244,245,0.72)', maxWidth: 640 }}>
              Browse system roles from the auth service. Role create/edit/delete is managed in the database seed — use Assign roles to attach users to any role.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<UserCog size={18} aria-hidden="true" />}
            onClick={() => goToAssignRoles()}
            sx={{ bgcolor: ACCENT, color: INK, fontWeight: 700, '&:hover': { bgcolor: '#b3e625' } }}
          >
            Assign roles
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ flex: 1, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Shield size={20} aria-hidden="true" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total roles
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {rolesData.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ flex: 1, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <KeyRound size={20} aria-hidden="true" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Matching search
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {filteredRoles.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      <TextField
        fullWidth
        label="Search roles"
        placeholder="Name, label, or ID"
        value={searchText}
        onChange={(event) => {
          setSearchText(event.target.value);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>System name</b></TableCell>
              <TableCell><b>Display label</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRoles.length > 0 ? (
              pagedRoles.map((role, index) => (
                <TableRow key={role.id} hover>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={role.name}
                      sx={{
                        bgcolor: roleColor(index),
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>{role.label || role.name}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => goToAssignRoles(role.name)}
                    >
                      Assign users
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {rolesData.length === 0 ? 'No roles loaded. Check auth API connectivity.' : 'No roles match your search.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredRoles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
};

export default RolesManagement;
