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
import { useGetKycDriverDetailsByIdMutation, useGetUserByRolesMutation, useGetVhicleDetailsMutation } from "@app/libs/apis/admin";
import { useAppSelector } from "@app/libs/store";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';

import Alert from '@mui/material/Alert';
import { USER_ROLES } from "@constants";
import AMSViewDriver from "../common-cmp/driver/AMSViewDriver";

const DriverOnboardAms = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [usernameOrEmail , setusernameOrEmail] =  useState()
  const userRoles =  useAppSelector((ele)=> ele['userRoles'])
  const [debouncedUsernameOrEmail, setDebouncedUsernameOrEmail] = useState("");
  const [debounceLoader , setDebounceLoader] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [kycStatusUpdated, setKycStatusUpdated] = useState(false);
  const [meta , setMeta] = useState({
    "page":1,
    "rowPerPage":10,
     rowsPerPageOption:[21],
     total:0
   })
  
  const [ getUsersByRole , { data:getUsersByRoleData , isLoading:getUsersByRoleLoading }   ] = useGetUserByRolesMutation()

  const [getDriverDetails , {data:getDriverDetailsData  , isLoading:getDriverDetailsLoader }] = useGetKycDriverDetailsByIdMutation()
  const handleExpandClick = (userId ) => {
    setExpandedRow(expandedRow === userId ? null : userId);
    getDriverDetails({driverId:userId })

  };


  // on first load 
  useEffect(()=>{
    if(userRoles?.list.length>0) // default driver role 
        setSelectedRoles(userRoles?.list?.filter(_=> _.name==USER_ROLES["driver-partner"]).map(_=> _.name))
    
    if(userRoles?.list.length>0) {
      getUsersByRole({
        "roles":userRoles?.list?.filter(_=> _.name==USER_ROLES["driver-partner"]).map(_=> _.id),
        "page":meta.page,
        "limit":meta.rowPerPage,
        "usernameOrEmail":""
      })
    }
  },[userRoles?.list])


  // for debouncing purpose
  useEffect(() => {
  setDebounceLoader(true)
  const handler = setTimeout(() => {
    setDebouncedUsernameOrEmail(usernameOrEmail);
  }, 1000); // 500ms delay

  return () => {
    clearTimeout(handler); // Clear the previous timeout on every keypress
  };
}, [usernameOrEmail]);



//  immediate relaod  on  kyc status changes 
useEffect(()=>{
 getDriverDetails({driverId:expandedRow})
},[kycStatusUpdated])


  useEffect(()=>{    
    // if search by  username
    try{
      if(debouncedUsernameOrEmail) {
        getUsersByRole(
           { 
           roles:userRoles?.list?.filter(_=> _.name==USER_ROLES["driver-partner"]).map(_=> _.id),
           usernameOrEmail:debouncedUsernameOrEmail ,
          "page":meta.page,
          "limit":meta.rowPerPage
           }
        )
        return 
      }
      getUsersByRole({
        "roles":userRoles?.list?.filter(_=> _.name==USER_ROLES["driver-partner"]).map(_=> _.id),
        "page":meta.page,
        "limit":meta.rowPerPage,
        "usernameOrEmail":""
      })
    }catch(err) {
      console.log(err)       
    }finally{
       setDebounceLoader(false)
    }
  },[debouncedUsernameOrEmail , meta.page , meta.rowPerPage ])

  useEffect(()=>{
     if(getUsersByRoleData?.data?.metadata) {
      const { total}  =getUsersByRoleData?.data?.metadata
      setMeta(prev => ({ ...prev, total }));
     }
  },[getUsersByRoleData?.data])
  
  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", color: "#3f51b5" }}>
        Driver Onboard Approvals
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: 20, color: "#555" }}>
      Driver Onboard  KYC Approvals.
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
        label="Search By Driver's Username or Email"
        variant="standard"
        onChange={(e)=> setusernameOrEmail(e.target.value) }
      />
     
      {(getUsersByRoleLoading || debounceLoader) && 
      <Box style={{display:"flex", justifyContent:'center', height:"80vh", alignItems:"center"}}>
          <CircularProgress style={{width:"20px", height:"20px"}} />
      </Box>}

      {!getUsersByRoleLoading && <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Role</b></TableCell>
              <TableCell><b>Show Details</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getUsersByRoleData?.data?.users?.map((user,index) => (
              <>
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role_id}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleExpandClick(user.user_id )}>
                      <ExpandMore />
                    </IconButton>
                  </TableCell>
                </TableRow>
                

                {getDriverDetailsLoader &&   expandedRow === user.user_id && <Box style={{display:"flex", justifyContent:'center'}}> <CircularProgress style={{width:"20px", height:"20px"}} /> </Box> }
               
                {!getDriverDetailsLoader &&  expandedRow === user.user_id && (
                  <TableRow>
                    <TableCell colSpan={12}>
                      <Accordion expanded>
                        <AccordionDetails>
                       {  (getDriverDetailsData?.data) ?  
                        <AMSViewDriver 
                        data={getDriverDetailsData?.data || {}} 
                        formIndex={index} 
                        kycUpdated={()=>setKycStatusUpdated(p=>!p) }
                         /> :
                          <Alert variant="outlined" severity="error">
                            Driver havn't Updated their  KYC details yet 
                          </Alert>
                       }

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

export default DriverOnboardAms;
