'use client'
import React, { useEffect, useState } from "react";
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
  Button
} from "@mui/material";
import { Edit, Block, Delete } from "@mui/icons-material";
import { useBlockUnblockUserMutation, useGetAllUsersMutation, useRemoveUserMutation } from "@app/libs/apis/admin";
import { useAppSelector } from "@app/libs/store";
import ContentLoader from "@components/loader/ContentLoader";

const UserManagement = () => {
  const userRoles = useAppSelector((ele) => ele['userRoles']);
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  // Delete dialog state and handlers
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
  
  // on block un block
  const [openOnBlock, setOpenOnBlock] = useState(false);
  const [selectedUserToBlockUnblock, setSelectedUserToBlockUnblock] = useState(null);

  const [meta, setMeta] = useState({
    "page": 1,
    "rowPerPage": 10,
     rowsPerPageOption: [5, 10, 15],
     total: 0
  });

  const [ getUser , { data: getUserData, isLoading: getUserDataLoading }] = useGetAllUsersMutation();
  const [removeUser, { data: removeUserData, isLoading: removeUserLoading }] = useRemoveUserMutation();
  const [blockUnblock, { data: blockUnblockData, isLoading: blockUnblockLoading }] = useBlockUnblockUserMutation();

  
  const setRowPerPage = (ele) => setMeta(p => ({ ...p, rowPerPage: ele }));
  const setPageNo = (ele = 1) => setMeta(p => ({ ...p, page: ele }));
  const setTotal = (ele) => setMeta(p => ({ ...p, total: ele }));

  const handleChangePage = (event, newPage) => {
    let currentPage = meta.page - 1;
    if (newPage == 0)
      return setPageNo(1);

    if (newPage > currentPage) {
      setPageNo(newPage + 1);
      console.log("Next button clicked");
    } else {
      setPageNo(currentPage);
      console.log("Previous button clicked");
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10));
    setPageNo();
  };

  useEffect(() => {
    if (userRoles?.list.length > 0)
      setSelectedRoles(userRoles?.list?.slice(0, 2).map(_ => _.name));

    if (userRoles?.list.length > 0) {
      getUser({
        "roles": userRoles?.list?.slice(0, 2).map(_ => _.id),
        "page": meta.page,
        "limit": meta.rowPerPage
      });
    }
  }, [userRoles?.list]);

  useEffect(() => {
    getUser({
      "roles": userRoles?.list?.map(_ => selectedRoles.some(ele => ele == _.name) && _.id).filter(Boolean),
      "page": meta.page,
      "limit": meta.rowPerPage
    });
  }, [selectedRoles.length, meta.page, meta.rowPerPage]);

  useEffect(() => {
    if (getUserData?.data?.metadata) {
      const { total } = getUserData?.data?.metadata;
      setTotal(total);
    }
  }, [getUserData?.data]);
  


  useEffect(()=>{
     

  // after removal  of  user , fetching active user list
    if(removeUserData?.data || blockUnblockData?.data ) {
      

      //  for  user removal 
      setOpenDeleteDialog(false);
      setSelectedUserToDelete(null);


      //  for block unblock 
      setOpenOnBlock(false);
      setSelectedUserToBlockUnblock(null);
      
      // NOTE - don't panic , it can be optmised , bt due to shortage of time , i couldn't 


      getUser({
        "roles": userRoles?.list?.map(_ => selectedRoles.some(ele => ele == _.name) && _.id).filter(Boolean),
        "page": meta.page,
        "limit": meta.rowPerPage
      });   
    }
     
  } ,[removeUserData?.data ,blockUnblockData?.data])




  
  const handleBUClick = (user) => {
    setSelectedUserToBlockUnblock(user);
    setOpenOnBlock(true);
  };



  const handleDeleteClick = (user) => {
    setSelectedUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("User deleted:", selectedUserToDelete);
    // call your delete mutation here if needed
    const { username } = selectedUserToDelete     
    removeUser({username}) // deleting users 
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedUserToDelete(null);
  };




  const handleConfirmBlockUnblock = () => {
   debugger
    const { username ,status } = selectedUserToBlockUnblock     
    blockUnblock({username , "isActive": status}) // deleting users 

    setOpenOnBlock(false); // disable or enable v user
    setSelectedUserToBlockUnblock(null);
  };

  const handleCancelBlockUnblock = () => {
    // const { username ,status } = selectedUserToBlockUnblock     
    // blockUnblock({username , "isActive": status}) // deleting users 
    
    setOpenOnBlock(false);
    setSelectedUserToBlockUnblock(null);
  };



  return (
    <>
      <div style={{ padding: 20 }}>
        <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5" }}>
          User Management
        </Typography>
        <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
          Search and manage user roles efficiently.
        </Typography>

        {userRoles?.list && userRoles?.list.length > 0 &&
          <Autocomplete
            multiple
            options={userRoles?.list.map(ele => ele.name)}
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
        }

        {getUserDataLoading &&
          <Box style={{ display: "flex", justifyContent: 'center', height: "80vh", alignItems: "center" }}>
            <CircularProgress style={{ width: "20px", height: "20px" }} />
          </Box>
        }

        {!getUserDataLoading && <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><b>Username</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Role ID</b></TableCell>
                <TableCell><b>Role</b></TableCell>
                <TableCell><b>Email Verified</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
                <TableCell><b>Activate/Deactivate</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getUserData?.data && Array.isArray(getUserData?.data?.users) && getUserData?.data?.users.length > 0 &&
                getUserData?.data?.users.map((user) => (
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
                      <Typography variant="body2" style={{ fontWeight: "bold", color: user.role === "owner" ? "#d32f2f" : "#1976d2" }}>
                        {user?.email_verification_pending ?
                          <Chip label="Varified" color="primary" /> : <Chip label="Pending" color="error" />}
                      </Typography>
                    </TableCell>
                    <TableCell>

                      <Typography variant="body2" style={{ fontWeight: "bold", color: user.role === "owner" ? "#d32f2f" : "#1976d2" }}>
                          <Chip  
                           color={user?.email_verification_pending?"primary":"error" } 
                           label={user?.email_verification_pending?"Deactivate":"Activate" }
                           onClick={() =>handleBUClick({...user , status:user?.email_verification_pending?false:true  }) }  />
                      </Typography>

                   
                    </TableCell>

                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteClick(user)}>
                        <Delete />
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>}

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

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <b>{selectedUserToDelete?.username}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            {removeUserLoading && <ContentLoader /> }  
            {!removeUserLoading && "Cancel" }  
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
          {removeUserLoading && <ContentLoader /> }  
          {!removeUserLoading && "Delete" }  
          </Button>
        </DialogActions>
      </Dialog>



       {/* Block confirmation dialog */}
       <Dialog
        open={openOnBlock}
        onClose={handleCancelBlockUnblock}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to block this user <b>{selectedUserToBlockUnblock?.username}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelBlockUnblock} color="primary">
            {blockUnblockLoading && <ContentLoader /> }  
            {!blockUnblockLoading && "Cancel" }  
          </Button>
          <Button onClick={handleConfirmBlockUnblock} color="error">
          {blockUnblockLoading && <ContentLoader /> }  
          {!blockUnblockLoading && "Block" }  
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagement;
