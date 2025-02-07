import React, { useState } from "react";
import { Autocomplete, TextField, Box, Button } from "@mui/material";

const vehicleOptions = ["Car", "Bike", "Truck", "Bus", "Van"];
const serviceOptions = ["Repair", "Maintenance", "Cleaning", "Towing", "Inspection"];


function VhicleServices() {
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
  
    const handleSubmit = () => {
      console.log("Selected Vehicles:", selectedVehicles);
      console.log("Selected Services:", selectedServices);
    };

    return (
    <>
        <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        width: "100%",
        minHeight: "100vh",
        padding: 2,
        overflow: "auto"
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Autocomplete
          multiple
          options={vehicleOptions}
          onChange={(event, value) => setSelectedVehicles(value)}
          renderInput={(params) => <TextField {...params} label="Type of Vehicles" variant="outlined" />}
          fullWidth
        />
        <Box sx={{ height: 16 }} />
        <Autocomplete
          multiple
          options={serviceOptions}
          onChange={(event, value) => setSelectedServices(value)}
          renderInput={(params) => <TextField {...params} label="Service" variant="outlined" />}
          fullWidth
        />
        <Box sx={{ height: 16 }} />
        <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
    </Box>

    </>
  )
}

export default VhicleServices