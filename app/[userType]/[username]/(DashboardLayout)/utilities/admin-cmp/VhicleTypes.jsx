'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Avatar, Grid, Box, Button } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Image from 'next/image';
import { useGetVhicleTypesMutation } from '@app/libs/apis/master';

const VehicleList = ({ vehicles }) => {
  const [vehicleData, setVehicleData] = useState(vehicles);
  const handleAvatarChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedVehicles = [...vehicleData];
        updatedVehicles[index].avatar = reader.result;
        setVehicleData(updatedVehicles);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (index) => {
    document.getElementById(`fileInput-${index}`).click();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={4}>
        {vehicleData.map((vehicle, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                position: 'relative',
                p: 3,
                pt: 6,
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 4,
                boxShadow: 4,
                textAlign: 'center',
                overflow: 'visible',
                transition: '0.3s',
                '&:hover': {
                  boxShadow: 8,
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <input
                id={`fileInput-${index}`}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleAvatarChange(e, index)}
              />

              {/* Avatar floating above card */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  boxShadow: 3,
                }}
              >
                   <Avatar
                        sx={{
                          width: 70,
                          height: 70,
                          overflow: 'hidden',
                        }}
                      >
                        {vehicle.avatar ? (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={vehicle.avatar}
                              alt={vehicle.vhicle_type || index}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        ) : (
                          <DirectionsCarIcon fontSize="large" />
                        )}
                      </Avatar>
              </Box>

              <CardContent sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {vehicle.vhicle_type}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => triggerFileInput(index)}
                  sx={{
                    mt: 2,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Edit Avatar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

function VhicleTypes() {
  
  const [getVhicleType ,{ data:getVhicleTypeData ,  isLoading:getVhicleTypeLoading }] = useGetVhicleTypesMutation()

  useEffect(()=>{ 
    getVhicleType()
   },[])
   
    let  vhiclelist =  getVhicleTypeData?.data 

    return (
    <Box sx={{ p: 4 }}>
      {vhiclelist && <VehicleList vehicles={vhiclelist || []} />  } 
    </Box>
  );
}

export default VhicleTypes;
