import React, { useEffect, useState } from "react";

import { Card, CardContent, Avatar, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useGetOwnerVhiclesListMutation } from "@app/libs/apis/owner";
import VhicleOccupiedServies from "./VhicleOccupiedServies";
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/material/Alert';
import { getUserInfo } from "@utils";

  const UserProfile = () => {

     const { firstName , lastName , username}  =getUserInfo()
    
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="absolute"
        top="50%"
        left="50%"
        sx={{ transform: 'translate(-50%, -50%)' }}
      >
        <Avatar alt="User Profile" src="/path/to/user/profile/image.jpg" sx={{ width: 80, height: 80 }} />
        <Typography variant="h5" ml={2}>
          {username}
        </Typography>
      </Box>
    );
  };
  
  const VehicleCard = ({ vehicle, angle, distance }) => {
    const angleRad = (angle * Math.PI) / 180;
    const x = distance * Math.cos(angleRad);
    const y = distance * Math.sin(angleRad);
  
    return (
      <Box
        sx={{
          position: 'absolute',
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Card sx={{ width: 200 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {vehicle.vhicle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vehicle.disc}
            </Typography>
          </CardContent>
        </Card>
        {/* <DottedLine
          style={{
            width: `${distance}px`,
            transform: `rotate(${angle}deg)`,
          }}
        /> */}
      </Box>
    );
  };
function RegisteredVhicles() {
  
  const [getVehicles, { data, isLoading, error }] = useGetOwnerVhiclesListMutation(); 

  useEffect(() => {
    getVehicles(); 

  }, []);

  const vehicles = data?.data || [];
  
  const radius = 300;
  const angleIncrement = 360 / vehicles.length; 

  
  
  return (
    <>    
    {vehicles && vehicles?.length==0  && <Alert icon={<InfoIcon fontSize="inherit"  />} severity="error"> No Registered Vhicle found</Alert> }
  
   <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      >
      {vehicles && vehicles.length>0 &&<UserProfile /> } 
      { vehicles && Array.isArray(vehicles) && vehicles.length>0 &&   vehicles.map((vehicle, index) => (
        <VehicleCard
          key={index}
          vehicle={vehicle}
          angle={angleIncrement * index}
          distance={radius}
        />
      ))}
    </Box>
    </>
  )
}

export default RegisteredVhicles