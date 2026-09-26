'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { KeyRound } from 'lucide-react';
import { useGetMenuPermissionsMutation } from '@app/libs/apis/admin';
import AdminMatrixShell from './AdminMatrixShell';

const PermissionManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [permissionsData, setPermissionsData] = useState([]);
  const [count, setCount] = useState(0);
  const [getPermissionList, { data: permissionData, isLoading: permissionIsLoading }] = useGetMenuPermissionsMutation();

  useEffect(() => {
    getPermissionList({
      page: page + 1,
      rowsPerPage,
    });
  }, [page, rowsPerPage, getPermissionList]);

  useEffect(() => {
    if (permissionData?.data) {
      setPermissionsData(permissionData.data.permissions || []);
      setCount(Number(permissionData.data.totalCount) || 0);
    }
  }, [permissionData?.data]);

  const filteredData = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return permissionsData;
    return permissionsData.filter(
      (permission) =>
        String(permission.permission_name || '').toLowerCase().includes(query) ||
        String(permission.permission_identifer || '').toLowerCase().includes(query) ||
        String(permission.id || '').includes(query),
    );
  }, [permissionsData, searchText]);

  return (
    <AdminMatrixShell
      icon={KeyRound}
      title="Permission catalog"
      subtitle="Permissions are auto-created when you add sub-navigation tabs. Capabilities bundle these permissions; optional user overrides further narrow the sidebar."
      step={2}
      totalSteps={5}
    >
      <Stack spacing={2}>
        <Alert severity="info" variant="outlined">
          You usually do not create permissions manually. They are generated from sub-nav hrefs and then attached to capabilities in the next step.
        </Alert>

        <TextField
          fullWidth
          label="Search permissions"
          placeholder="Name, identifier, or ID"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        {permissionIsLoading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Permission name</b></TableCell>
                  <TableCell><b>Identifier</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((permission) => (
                    <TableRow key={permission.id} hover>
                      <TableCell>{permission.id}</TableCell>
                      <TableCell>{permission.permission_name}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={permission.permission_identifer || '—'} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      No permissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />

        <Typography variant="caption" color="text.secondary">
          Showing {filteredData.length} on this page · {count} total in database
        </Typography>
      </Stack>
    </AdminMatrixShell>
  );
};

export default PermissionManagement;
