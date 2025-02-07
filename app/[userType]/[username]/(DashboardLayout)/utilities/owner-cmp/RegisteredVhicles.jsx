import React, { useState } from "react";

import { Card, CardContent, Avatar, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const vehicles = [
  {
    vhicle: "Electric Scooter",
    disc: "Small two-wheeled electric-powered vehicle"
  },
  {
    vhicle: "Car",
    disc: "Four-wheeled motor vehicle used for passenger transport"
  },
  {
    vhicle: "Motorcycle",
    disc: "Two-wheeled motor vehicle for individual or two-passenger travel"
  },
  {
    vhicle: "Truck",
    disc: "Heavy motor vehicle used for transporting goods"
  },
  {
    vhicle: "Bus",
    disc: "Large motor vehicle designed to carry many passengers"
  }
];


// Styled component for the dotted line
const DottedLine = styled('div')({
    position: 'absolute',
    height: '2px',
    background: 'repeating-linear-gradient(to right, #000, #000 4px, transparent 4px, transparent 8px)',
    transformOrigin: 'left center',
  });
  
  const UserProfile = () => {
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
          John Doe
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
  
    const radius = 300; // Distance from the user profile to each vehicle card
    const angleIncrement = 360 / vehicles.length; // Equal angle between each vehicle
  
    return (

    <>
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
      <UserProfile />
      {vehicles.map((vehicle, index) => (
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