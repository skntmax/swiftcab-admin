import React, { useState } from "react";
import {
  Autocomplete,
  Chip,
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

const userData =[
  {
      "id": 5,
      "username": "ug56",
      "email": "ug56@gm.com",
      "role_id": 2,
      "role": "admin"
  },
  {
      "id": 6,
      "username": "admin22_nova2566",
      "email": "admin@admin.com",
      "role_id": 2,
      "role": "admin"
  },
  {
      "id": 7,
      "username": "sunnyy22_nlite7819",
      "email": "sunnyy22@gm.com",
      "role_id": 3,
      "role": "sales-manager"
  },
  {
      "id": 7,
      "username": "sunnyy22_nlite7819",
      "email": "sunnyy22@gm.com",
      "role_id": 2,
      "role": "admin"
  },
  {
      "id": 8,
      "username": "rohan89834",
      "email": "rohan898@gm.com",
      "role_id": 2,
      "role": "admin"
  },
  {
      "id": 9,
      "username": "sunny34984",
      "email": "sunny34984@gm.com",
      "role_id": 3,
      "role": "sales-manager"
  }
];

const roles = [...new Set(userData.map((user) => user.role))];

const UserManagement = () => {
  const [selectedRoles, setSelectedRoles] = useState(["owner", "admin"]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredData =
    selectedRoles.length > 0
      ? userData.filter((user) => selectedRoles.includes(user.role))
      : userData;

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
        User Management
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
        Search and manage user roles efficiently.
      </Typography>
      
      {/* Typeahead Search */}
      <Autocomplete
        multiple
        options={roles}
        getOptionLabel={(option) => option}
        value={selectedRoles}
        onChange={(event, newValue) => setSelectedRoles(newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option} {...getTagProps({ index })} color="primary" />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="Filter by Role" variant="outlined" fullWidth />
        )}
        style={{ marginBottom: 20 }}
      />

      {/* User Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Role ID</b></TableCell>
              <TableCell><b>Role</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role_id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: "bold", color: user.role === "owner" ? "#d32f2f" : "#1976d2" }}>
                      {user.role}
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

export default UserManagement;
