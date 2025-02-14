import React, { useState } from "react";
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Box, Grid ,Typography } from "@mui/material";

function KYC({fd ,formIndex }) {

  const [formData, setFormData] = useState({
    vin: { name:"vin" , value:fd.username , error: false , message:"Email is required" },
    license_plate: { name:"license_plate" , value:"" , error: false , message:"license_plate is required" },
    manufacturer: { name:"manufacturer" , value:"" , error: false , message:"Email is required" },
    model: { name:"model" , value:"" , error: false , message:"model is required" },
    year: { name:"year" , value:"" , error: false , message:"year is required" },
    color: { name:"color" , value:"" , error: false , message:"color is required" },
    engine_number: { name:"engine_number" , value:"" , error: false , message:"engine_number is required" },
    chassis_number: { name:"chassis_number" , value:"" , error: false , message:"chassis_number is required" },
    fuel_type: { name:"fuel_type" , value:"" , error: false , message:"fuel_type is required" } ,
    transmission:   { name:"transmission" , value:"" , error: false , message:"transmission is required" }  ,
    kyc_status: { name:"kyc_status" , value:fd.is_kyc , error: false , message:"kyc_status is required" } , // Default status
  });

  const handleChange = (e) => {
    const { name , value}  = e.target
    setFormData({ ...formData, [name]: { ...formData[name] , value: value  } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const { vin , license_plate , manufacturer , model , year , color , engine_number , chassis_number , fuel_type , transmission , kyc_status}  = formData


  return (
    <>
     
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: "100%", mx: "auto", p: 2 }}>
     
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><TextField fullWidth label="VIN" name="vin" value={vin.value} onChange={handleChange} required disabled /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="License Plate" name="license_plate" value={license_plate.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Manufacturer" name="manufacturer" value={manufacturer.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Model" name="model" value={model.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Year" name="year" type="date" value={year.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Color" name="color" value={color.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Engine Number" name="engine_number" value={engine_number.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Chassis Number" name="chassis_number" value={chassis_number.value} onChange={handleChange} required /></Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Fuel Type</InputLabel>
            <Select name="fuel_type" value={fuel_type.value} onChange={handleChange}>
              <MenuItem value="Petrol">Petrol</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Transmission</InputLabel>
            <Select name="transmission" value={transmission.value} onChange={handleChange}>
              <MenuItem value="Manual">Manual</MenuItem>
              <MenuItem value="Automatic">Automatic</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>KYC Status</InputLabel>
            <Select name="kyc_status" value={kyc_status.value} onChange={handleChange}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button 
           disabled={kyc_status.value?true:false}
          fullWidth type="submit" variant="outlined" color="primary">Submit</Button>
        </Grid>
      </Grid>
    </Box>
    </>
  )
}

export default KYC