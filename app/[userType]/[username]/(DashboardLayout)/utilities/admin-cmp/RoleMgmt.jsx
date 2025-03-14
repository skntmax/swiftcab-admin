import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Typography,
} from "@mui/material";
import { Edit, Block, Delete } from "@mui/icons-material";

import { useAppSelector } from "@app/libs/store";

// const rolesData = [
//   { id: 1, name: "super-admin" },
//   { id: 2, name: "admin" },
//   { id: 3, name: "sales-manager" },
//   { id: 4, name: "sales-executive" },
//   { id: 5, name: "sales-representative" },
//   { id: 6, name: "account-manager" },
//   { id: 7, name: "marketing-manager" },
//   { id: 8, name: "marketing-executive" },
//   { id: 9, name: "marketing-specialist" },
//   { id: 10, name: "customer-support manager" },
//   { id: 11, name: "support-agent" },
//   { id: 12, name: "helpdesk-agent" },
//   { id: 13, name: "technical-support-engineer" },
//   { id: 14, name: "operations-manager" },
//   { id: 15, name: "finance-manager" },
//   { id: 16, name: "crm-developer" },
//   { id: 17, name: "crm-analyst" },
//   { id: 18, name: "partner-manager" },
//   { id: 19, name: "vendor-coordinator" },
//   { id: 20, name: "customer" },
//   { id: 21, name: "owner" },
// ];

const RolesManagement = () => {
  const rolesData = useAppSelector((state) => state.userRoles.list);


  const [selectedRoles, setSelectedRoles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredRoles =
    selectedRoles.length > 0
      ? rolesData.filter((role) => selectedRoles.includes(role.name))
      : rolesData;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5" }}>
        Roles Management
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
        Search and manage roles efficiently.
      </Typography>

      <Autocomplete
        multiple
        options={rolesData.map((role) => role.name)}
        getOptionLabel={(option) => option}
        value={selectedRoles}
        onChange={(event, newValue) => setSelectedRoles(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Filter by Role" variant="outlined" fullWidth />
        )}
        style={{ marginBottom: 20 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><b>Role Name</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: "bold", color: "#1976d2" }}>
                      {role.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton color="warning">
                      <Block />
                    </IconButton>
                    <IconButton color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={filteredRoles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default RolesManagement;
