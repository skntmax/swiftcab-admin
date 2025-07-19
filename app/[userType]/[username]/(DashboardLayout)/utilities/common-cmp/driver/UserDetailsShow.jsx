import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Typography,
  Link,
  Grid,
  Paper,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AccountCircle,
  AttachMoney,
  CheckCircle,
  Cancel,
  CalendarToday,
  DocumentScanner,
  AccountBalance,
  CreditCard
} from '@mui/icons-material';
import EditProfileDetail from './EditProfileDetail';
import DriverViewDetails from './ViewDriverDetails';

const UserDetailsShow = ({ data, isLoading = false, userName, userType,  userDetails ,setDriverUpdatedOrCreated }) => {
  
  const [driverEdit, setDriverEdit] = useState(true);
  
   useEffect(()=>{
    setDriverUpdatedOrCreated()
   },[driverEdit])
    
   return (
    <>
      <Backdrop
        open={isLoading}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

            <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", // optional for responsiveness
              mb: 2,
              maxWidth: 1000,
              mx: "auto"
            }}
          >
          <Typography variant="h5" sx={{ mb: 0, textAlign: "justify" }}>
            Update Driver Detail
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={driverEdit}
                onClick={() => setDriverEdit((p) => !p)}
                color="primary"
              />
            }
            label={
              driverEdit
                ? "Switch to View Driver Details"
                : "Switch to Edit Driver Details"
            }
          />
        </Box>
      
     {driverEdit && <EditProfileDetail   {...{data , userDetails}}  />} 
     
     {!driverEdit &&  <DriverViewDetails {...{data , userDetails}} />} 
      
    </>
  );
};


export default UserDetailsShow;
