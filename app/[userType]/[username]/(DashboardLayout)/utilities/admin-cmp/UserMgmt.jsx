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
} from "@mui/material";
import { Edit, Block, Delete } from "@mui/icons-material";
import { useGetAllUsersMutation } from "@app/libs/apis/admin";
import { useAppSelector } from "@app/libs/store";


const UserManagement = () => {
   
  const userRoles =  useAppSelector((ele)=> ele['userRoles'])
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [meta , setMeta] = useState({
    "page":1,
    "rowPerPage":10,
     rowsPerPageOption:[5, 10, 15],
     total:0
   })
    

  const [ getUser , { data:getUserData , isLoading:getUserDataLoading }   ] = useGetAllUsersMutation()

  
  const setRowPerPage = ele=>setMeta(p=>({...p , rowPerPage:ele  }) )
  const setPageNo = (ele=1)=>setMeta(p=>({...p , page:ele  }) )
  const setTotal = (ele)=>setMeta(p=>({...p , total:ele  }) )


  const handleChangePage = (event, newPage) => {
    
    let currentPage =meta.page-1
    
    if(newPage==0)
      return setPageNo(1)
    
    if (newPage > currentPage) {
        setPageNo(newPage+1)
      console.log("Next button clicked");
    } else {
      setPageNo(currentPage)
      console.log("Previous button clicked");
    }

  };

  const handleChangeRowsPerPage = (event) => {
    setRowPerPage(parseInt(event.target.value, 10))
    setPageNo()
  };




  useEffect(()=>{
  
    if(userRoles?.list.length>0) // setting default 2 roles  roles 
        setSelectedRoles(userRoles?.list?.slice(0,2).map(_=> _.name))

    if(userRoles?.list.length>0) {
      getUser({
        "roles":userRoles?.list?.slice(0,2).map(_=> _.id),
        "page":meta.page,
        "limit":meta.rowPerPage
      })
    }

  },[userRoles?.list])




  useEffect(()=>{    
    getUser({
      "roles":userRoles?.list?.map(_=>  selectedRoles.some(ele=> ele==_.name) && _.id  ).filter(Boolean) ,
      "page":meta.page,
      "limit":meta.rowPerPage
    })

  },[selectedRoles.length , meta.page , meta.rowPerPage])



  useEffect(()=>{
     
     if(getUserData?.data?.metadata) {
      const { total}  =getUserData?.data?.metadata
      setTotal(total)

     }
  },[getUserData?.data])

  
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
     {
      userRoles?.list &&  userRoles?.list.length>0 && 
      <Autocomplete
        multiple
        options={userRoles?.list.map(ele=>ele.name)}
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

            {getUserData?.data && Array.isArray(getUserData?.data?.users) && getUserData?.data?.users.length>0 && 
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
        rowsPerPageOptions={meta.rowsPerPageOption}
        component="div"
        count={meta.total}
        rowsPerPage={meta.rowPerPage}
        page={meta.page-1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default UserManagement;
