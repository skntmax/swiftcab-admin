import React, { useState } from "react";
import { Autocomplete, TextField, Typography, Box, Button } from "@mui/material";
import RegisteredVhicles from "./RegisteredVhicles";

const vehicleOptions = [
  "Car", "Bike", "Truck", "Bus", "SUV", "Van"
];

function AddVhicle() {
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const handleSubmit = () => {
    console.log("Selected Vehicles:", selectedVehicles);
  };

  return (
    <>
         <Box sx={{ p: 3, border: "1px solid #ccc", borderRadius: 2, width: "100%" , height:"100" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose Vehicle
      </Typography>
      <Autocomplete
        multiple
        options={vehicleOptions}
        value={selectedVehicles}
        onChange={(event, newValue) => setSelectedVehicles(newValue)}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Select Vehicles" placeholder="Choose..." fullWidth />
        )}
        fullWidth
      />
      <Button variant="contained" color="primary" sx={{ mt: 2, width: "100%" }} onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
    </>
  )
}

export default AddVhicle