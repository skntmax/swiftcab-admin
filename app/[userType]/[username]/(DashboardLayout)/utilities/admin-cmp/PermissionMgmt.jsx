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

const permissionsData = [
  { id: 1, name: "Create Users" },
  { id: 2, name: "Edit Users" },
  { id: 3, name: "Delete Users" },
  { id: 4, name: "View Users" },
  { id: 5, name: "Assign Roles" },
  { id: 6, name: "Create Leads" },
  { id: 7, name: "Edit Leads" },
  { id: 8, name: "Delete Leads" },
  { id: 9, name: "View Leads" },
  { id: 10, name: "Assign Leads" },
  { id: 11, name: "Create Contacts" },
  { id: 12, name: "Edit Contacts" },
  { id: 13, name: "Delete Contacts" },
  { id: 14, name: "View Contacts" },
  { id: 15, name: "Create Deals" },
  { id: 16, name: "Edit Deals" },
  { id: 17, name: "Delete Deals" },
  { id: 18, name: "View Deals" },
  { id: 19, name: "Assign Deals" },
  { id: 20, name: "Create Tasks" },
  { id: 21, name: "Edit Tasks" },
  { id: 22, name: "Delete Tasks" },
  { id: 23, name: "View Tasks" },
  { id: 24, name: "Assign Tasks" },
  { id: 25, name: "Create Campaigns" },
  { id: 26, name: "Edit Campaigns" },
  { id: 27, name: "Delete Campaigns" },
  { id: 28, name: "View Campaigns" },
  { id: 29, name: "Send Marketing Emails" },
  { id: 30, name: "View Reports" },
  { id: 31, name: "Generate Reports" },
  { id: 32, name: "Export Reports" },
  { id: 33, name: "Manage Invoices" },
  { id: 34, name: "View Transactions" },
  { id: 35, name: "Process Payments" },
  { id: 36, name: "Access CRM Settings" },
  { id: 37, name: "Manage Integrations" },
  { id: 38, name: "Customize Workflows" },
  { id: 39, name: "Configure Automations" },
];

const PermissionManagement = () => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredData =
    selectedPermissions.length > 0
      ? permissionsData.filter((permission) => selectedPermissions.includes(permission.name))
      : permissionsData;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Title */}
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5" }}>
        Permission Management
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
        Search and manage permissions efficiently.
      </Typography>
      
      {/* Typeahead Search */}
      <Autocomplete
        multiple
        options={permissionsData.map((p) => p.name)}
        getOptionLabel={(option) => option}
        value={selectedPermissions}
        onChange={(event, newValue) => setSelectedPermissions(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Filter by Permission" variant="outlined" fullWidth />
        )}
        style={{ marginBottom: 20 }}
      />

      {/* Permissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Permission</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.id}</TableCell>
                  <TableCell>{permission.name}</TableCell>
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

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default PermissionManagement;
