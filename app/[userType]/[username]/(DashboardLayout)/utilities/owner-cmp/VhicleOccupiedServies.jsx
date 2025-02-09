'use client'

import React, { useEffect } from "react";
import { Box, Typography, Grid, Chip, Paper } from "@mui/material";
import { useOwnerVhicleServiceListMutation } from "@app/libs/apis/owner";

const data = [
  { vhicle_username: "random20", vhicle_type: "Motorcycle", service_name: "Tourist plan" },
  { vhicle_username: "random20", vhicle_type: "Motorcycle", service_name: "Full Day Book" },
  { vhicle_username: "random20", vhicle_type: "Motorcycle", service_name: "Commercial" },
  { vhicle_username: "random20", vhicle_type: "Motorcycle", service_name: "Commercial/cross-site/outer city" },
  { vhicle_username: "random83", vhicle_type: "Bus", service_name: "Commercial" },
  { vhicle_username: "random83", vhicle_type: "Bus", service_name: "Full Day Book" },
  { vhicle_username: "random83", vhicle_type: "Bus", service_name: "Tourist plan" },
  { vhicle_username: "random83", vhicle_type: "Bus", service_name: "Emergency/Night" },
  { vhicle_username: "random83", vhicle_type: "Bus", service_name: "Commercial/cross-site/outer city" }
];

const groupedData = data.reduce((acc, item) => {
  if (!acc[item.vhicle_type]) {
    acc[item.vhicle_type] = [];
  }
  acc[item.vhicle_type].push(item.service_name);
  return acc;
}, {});


function VhicleOccupiedServies() {
  // const { data, error, isLoading } = useGetVehiclesServiceListRenderQuery();

  const [ getVhicleServieList , {data:getVhicleServieListData , isLoading: getVhicleServieListLoading }]  = useOwnerVhicleServiceListMutation()

  useEffect(()=>{
    getVhicleServieList() 
  }, [])

 
  return (  
   <>
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        Vehicle Services
      </Typography>
      <Grid container spacing={3}>
       
        {getVhicleServieListData && Array.isArray(getVhicleServieListData?.data) && getVhicleServieListData.data.length>0 &&
        
          Object.entries(getVhicleServieListData?.data.reduce((acc, ele )=>{
                    if (!acc[ele.vhicle_type]) {
                        acc[ele.vhicle_type] = { service_name: [] };
                    }
                    acc[ele.vhicle_type]['service_name'].push(ele.service_name);
                    return acc;
               },{})).map(([vhicle_type ,  services]) => (
          <Grid item xs={12} sm={6} md={4} key={vhicle_type}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)" }}>
              <Typography variant="h6" fontWeight={600} color="primary.dark">
                {vhicle_type}
              </Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {services.service_name.map((service, index) => (
                  <Grid item key={index}>
                    <Chip label={service} />
                  </Grid>
                ))}

              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
   </>
  )
}

export default VhicleOccupiedServies