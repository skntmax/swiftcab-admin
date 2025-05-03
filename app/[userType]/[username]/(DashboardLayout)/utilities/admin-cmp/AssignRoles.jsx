'use client'
import React, { useCallback, useEffect, useState } from "react";
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
  CircularProgress,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
  Grid
} from "@mui/material";
import { Delete, CheckCircle, Cancel, Email, Edit, Block } from "@mui/icons-material";
import { useBlockUnblockUserMutation, useGetAllUsersMutation, useGetUserByRoleMutation, useRemoveUserMutation, useUpdateRolesMutation } from "@app/libs/apis/admin";
import { useAppSelector } from "@app/libs/store";
import ApiLoader from "@components/ApiLoader";

const roleTypes = [
  { id: 1, name: "super-admin" },
  { id: 2, name: "admin" },
  { id: 3, name: "sales-manager" },
  { id: 4, name: "sales-executive" },
  { id: 5, name: "sales-representative" },
  { id: 6, name: "account-manager" },
  { id: 7, name: "marketing-manager" },
  { id: 8, name: "marketing-executive" },
  { id: 9, name: "marketing-specialist" },
  { id: 10, name: "customer-support manager" },
  { id: 11, name: "support-agent" },
  { id: 12, name: "helpdesk-agent" },
  { id: 13, name: "technical-support-engineer" },
  { id: 14, name: "operations-manager" },
  { id: 15, name: "finance-manager" },
  { id: 16, name: "crm-developer" },
  { id: 17, name: "crm-analyst" },
  { id: 18, name: "partner-manager" },
  { id: 19, name: "vendor-coordinator" },
  { id: 20, name: "customer" },
  { id: 21, name: "owner" },
  { id: 22, name: "driver-partner" }
];

const roleColors = [
  '#E91E63', '#3F51B5', '#009688', '#F44336', '#9C27B0', '#4CAF50', '#FF5722',
  '#795548', '#607D8B', '#FFC107', '#00BCD4', '#CDDC39', '#8BC34A', '#673AB7',
  '#2196F3', '#FF9800', '#BDBDBD', '#F06292', '#00ACC1', '#C2185B', '#D32F2F',
  '#388E3C', '#1976D2'
];

const getColorForRole = (roleName) => {
  const index = roleTypes.findIndex(role => role.name === roleName);
  return roleColors[index % roleColors.length];
};

const AssignRoles = () => {
  const userRoles = useAppSelector((ele) => ele['userRoles']);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [appendRoles, setAppendRoles] = useState([]);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);

  const [openOnBlock, setOpenOnBlock] = useState(false);
  const [selectedUserToBlockUnblock, setSelectedUserToBlockUnblock] = useState(null);

  const [meta, setMeta] = useState({
    page: 1,
    rowPerPage: 10,
    rowsPerPageOption: [5, 10, 15],
    total: 0
  });

  //api calling
  const [getUser, { data: getUserData, isLoading: getUserDataLoading }] = useGetUserByRoleMutation();
  const [updateRole, {data:updateRoleData ,  isLoading:updateRoleDataLoading }] = useUpdateRolesMutation()

  const setRowPerPage = (ele) => setMeta(p => ({ ...p, rowPerPage: ele }));
  const setPageNo = (ele = 1) => setMeta(p => ({ ...p, page: ele }));
  const setTotal = (ele) => setMeta(p => ({ ...p, total: ele }));

  const handleChangePage = (event, newPage) => {
    setPageNo(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10));
    setPageNo();
  };

  useEffect(() => {
    if (userRoles?.list?.length > 0)
      setSelectedRoles(userRoles.list.slice(0, 1).map(_ => _.name));

    if (userRoles?.list?.length > 0) {
      getUser({
        role_id: userRoles.list.slice(0, 1).map(_ => _.id),
        pn: meta.page,
        limit: meta.rowPerPage
      });
    }
  }, [userRoles?.list]);

  useEffect(() => {
    getUser({
      role_id: userRoles?.list?.map(_ => selectedRoles.includes(_.name) && _.id).filter(Boolean),
      pn: meta.page,
      limit: meta.rowPerPage
    });
  }, [selectedRoles, meta.page, meta.rowPerPage]);

  useEffect(() => {
    if (getUserData?.data?.metadata) {
      const { total } = getUserData.data.metadata;
      setTotal(total);
    }

    if (getUserData?.data?.users) {
      setAppendRoles(getUserData?.data?.users?.map(ele=> ele.role))
    }

  }, [getUserData?.data]);


 const roleOnchangeHandler = (role,index)=>{
  setAppendRoles(appendRoles.map((ele,i)=>i==index?role: ele  ))
 } 



 const saveRoleHandler = (index,userId)=>{
  let roles = userRoles.list.map(item=> appendRoles[index].includes(item.name) && item.id ).filter(Boolean)   
  updateRole({ "role_id":roles,  userId  })
  
  }
  
 const modifyRoles = useCallback((user, index) => {
  if (appendRoles && appendRoles.length > 0)
    return (
      <TableCell align="center">
        {user?.roleId?.length > 0 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Autocomplete
              multiple
              options={userRoles.list
                .filter((ele) => !user.roleId.includes(ele.id))
                .filter(Boolean)
                .map((item) => item.name)}
              getOptionLabel={(option) => option}
              value={appendRoles[index]}
              onChange={(event, newValue) => roleOnchangeHandler(newValue, index)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    style={{
                      backgroundColor: getColorForRole(option),
                      color: "#fff",
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Role"
                  variant="outlined"
                  fullWidth
                />
              )}
              sx={{ flex: 1 }} // ensures autocomplete takes available space
            />
            
             {updateRoleDataLoading? 
              <ApiLoader />: 
              <Button
              disabled={user?.role?.length==appendRoles[index]?.length}
              variant="contained"
              color="primary"
              onClick={() => saveRoleHandler(index, user.id )}
            >
              Update
            </Button>
              }


          </Box>
        )}
      </TableCell>
    );
}, [appendRoles.length, appendRoles,updateRoleDataLoading]);


  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5" }}>
        User Management
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
        Search and manage user roles efficiently.
      </Typography>

      {/* Role Color Legend */}
      <Box sx={{ marginBottom: 2 }}>
        <Grid container spacing={1}>
          {roleTypes.map((role, i) => (
            <Grid item key={role.id}>
              <Chip label={role.name} size="small" style={{ backgroundColor: getColorForRole(role.name), color: "#fff" }} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Role Filter */}
      {userRoles?.list?.length > 0 && (
        <Autocomplete
          multiple
          options={userRoles.list.map(ele => ele.name)}
          getOptionLabel={(option) => option}
          value={selectedRoles}
          onChange={(event, newValue) => setSelectedRoles(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                style={{ backgroundColor: getColorForRole(option), color: "#fff" }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Filter by Role" variant="outlined" fullWidth />
          )}
          style={{ marginBottom: 20 }}
        />
      )}

      {getUserDataLoading ? (
        <Box sx={{ display: "flex", justifyContent: 'center', height: "80vh", alignItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell align="center"><b>Id</b></TableCell>
              <TableCell align="center"><b>Username</b></TableCell>
              <TableCell align="center"><b>Email</b></TableCell>
              <TableCell align="center"><b>Total</b></TableCell>
              <TableCell align="center"><b>Role(s)</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
        {Array.isArray(getUserData?.data?.users) && getUserData.data?.users?.length > 0 ? (
          getUserData?.data?.users.map((user,index) => (
            <TableRow key={user.id}>
              <TableCell align="center">{user.id}</TableCell>
              <TableCell align="center">{user.username}</TableCell>
              <TableCell align="center">{user.email}</TableCell>
              <TableCell align="center">{user.total}</TableCell>
              {modifyRoles(user,index)}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} align="center">No users found.</TableCell>
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
    </div>
  );
};

export default AssignRoles;
