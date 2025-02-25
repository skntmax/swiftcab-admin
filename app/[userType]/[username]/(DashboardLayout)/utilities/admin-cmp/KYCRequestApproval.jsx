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
} from "@mui/material";
import { Edit, Block, Delete, ExpandMore } from "@mui/icons-material";
import { useGetAllUsersMutation, useGetVhicleDetailsMutation } from "@app/libs/apis/admin";
import { useAppSelector } from "@app/libs/store";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

const KycRequest = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [usernameOrEmail , setusernameOrEmail] =  useState()
  const userRoles =  useAppSelector((ele)=> ele['userRoles'])
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [meta , setMeta] = useState({
    "page":1,
    "rowPerPage":10,
     rowsPerPageOption:[21],
     total:0
   })
  
  const [ getUser , { data:getUserData , isLoading:getUserDataLoading }   ] = useGetAllUsersMutation()

  const [getVhicleDetails , {data:getVhicleDetailsData  , isLoading:getVhicleDetailsLoader }] = useGetVhicleDetailsMutation()

  const handleExpandClick = (userId) => {
    setExpandedRow(expandedRow === userId ? null : userId);

    getVhicleDetails({vhicleId:10 ,ownerId:17})

  };

  useEffect(()=>{
    if(userRoles?.list.length>0) // default owner role 
        setSelectedRoles(userRoles?.list?.filter(_=> _.name=="owner").map(_=> _.name))
    if(userRoles?.list.length>0) {
      getUser({
        "roles":userRoles?.list?.filter(_=> _.name=="owner").map(_=> _.id),
        "page":meta.page,
        "limit":meta.rowPerPage,
         searchByManual:true
      })
    }
  },[userRoles?.list])

  useEffect(()=>{    
    if(usernameOrEmail) {
      getUser(
         { 
         usernameOrEmail:usernameOrEmail ,
        "page":meta.page,
        "limit":meta.rowPerPage
         }
      )
      return 
    }
    getUser({
      "roles":userRoles?.list?.filter(_=> _.name=="owner").map(_=> _.id),
      "page":meta.page,
      "limit":meta.rowPerPage,
       searchByManual:true
    })
  },[usernameOrEmail , meta.page , meta.rowPerPage])

  useEffect(()=>{
     if(getUserData?.data?.metadata) {
      const { total}  =getUserData?.data?.metadata
      setMeta(prev => ({ ...prev, total }));
     }
  },[getUserData?.data])
  
  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5" }}>
        KYC Approvals
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
        Search and manage KYC approvals efficiently.
      </Typography>
      
      {userRoles?.list && userRoles?.list.length>0 && 
      <Autocomplete
        disabled
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
      />}
     
      <TextField
        sx={{marginBottom:"10px"}}
        fullWidth
        label="Search By Username or Email"
        variant="standard"
        onChange={(e)=> setusernameOrEmail(e.target.value) }
      />
     
      {getUserDataLoading && <Box style={{display:"flex", justifyContent:'center', height:"80vh", alignItems:"center"}}>
          <CircularProgress style={{width:"20px", height:"20px"}} />
      </Box>}

      {!getUserDataLoading && <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Role ID</b></TableCell>
              <TableCell><b>Role</b></TableCell>
              <TableCell><b>Owns Vehicles</b></TableCell>
              <TableCell><b>View Details</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getUserData?.data?.users?.map((user) => (
              <>
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role_id}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user?.vhicles?.length || 0}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleExpandClick(user.id , ) }>
                      <ExpandMore />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {expandedRow === user.id && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Accordion expanded>
                        <AccordionSummary>
                          <Typography>Additional Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          More information about {user.username}...
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>}

      <TablePagination
        rowsPerPageOptions={meta.rowsPerPageOption}
        component="div"
        count={meta.total}
        rowsPerPage={meta.rowPerPage}
        page={meta.page-1}
        onPageChange={(event, newPage) => setMeta(p => ({ ...p, page: newPage + 1 }))}
        onRowsPerPageChange={(event) => setMeta(p => ({ ...p, rowPerPage: parseInt(event.target.value, 10), page: 1 }))}
      />
    </div>
  );
};

export default KycRequest;
