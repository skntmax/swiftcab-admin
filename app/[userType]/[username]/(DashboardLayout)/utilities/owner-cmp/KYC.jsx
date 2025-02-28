"use client";
import React, { useState } from "react";
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Box, Grid, Typography ,IconButton } from "@mui/material";
import { useOwnerKycRequestMutation } from "@app/libs/apis/owner";
import { AttachFile, InsertDriveFile } from "@mui/icons-material"; // MUI Icons

function KYC({ fd, formIndex, onRaiseKyc }) {
 
  const [submitDisabled, setSubmitDisabled] = useState(fd.kyc_varification === "INITIATED" ? true : false);
  const [ownerKycRequest, { isLoading, data, error }] = useOwnerKycRequestMutation();

  const [formData, setFormData] = useState({
    vin: { name: "vin", value: fd.username, error: false, message: "Email is required" },
    license_plate: { name: "license_plate", value: "", error: false, message: "License plate is required" },
    manufacturer: { name: "manufacturer", value: "", error: false, message: "Manufacturer is required" },
    model: { name: "model", value: "", error: false, message: "Model is required" },
    year: { name: "year", value: "", error: false, message: "Year is required" },
    color: { name: "color", value: "", error: false, message: "Color is required" },
    engine_number: { name: "engine_number", value: "", error: false, message: "Engine number is required" },
    chassis_number: { name: "chassis_number", value: "", error: false, message: "Chassis number is required" },
    fuel_type: { name: "fuel_type", value: "", error: false, message: "Fuel type is required" },
    transmission: { name: "transmission", value: "", error: false, message: "Transmission is required" },
    ss_one: { file: null, preview: null, name: "ss_one" ,  type:"file" },
    ss_two: { file: null, preview: null, name: "ss_two" , type:"file"  },
    rc_doc: { file: null, name: "rc_doc" , type:"file"  },
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if([formData.ss_one.name , formData.ss_two.name, formData.rc_doc.name].includes(name)) {
      const { name, files } = e.target;
      const file = files[0];
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      setFormData((prev) => ({
        ...prev,
        [name]: { ...prev[name] ,  file,  value:file ,  preview },
      }));       
      return 
      }


    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value: value,
        error: false,
      },
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newFormData = { ...formData };

    Object.keys(newFormData).forEach((key) => {
      if (!newFormData[key].value) {
        newFormData[key].error = true;
        isValid = false;
      } else {
        newFormData[key].error = false;
      }
    });

    setFormData(newFormData);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }


    let formDataPayload =  new FormData()
    
    const payload = {
      id: fd.vhicle_id,
      vin: formData.vin.value,
      license_plate: formData.license_plate.value,
      manufacturer: formData.manufacturer.value,
      model: formData.model.value,
      // year: formData.year.value,
      year: new Date(formData.year.value).toISOString(),
      color: formData.color.value,
      engine_number: formData.engine_number.value,
      chassis_number: formData.chassis_number.value,
      fuel_type: formData.fuel_type.value,
      transmission: formData.transmission.value,
      // kyc_status: formData.kyc_status.value,
    };

    
     // Append payload data to FormData
     Object.entries(payload).forEach(([key, value]) => {
      formDataPayload.append(key, value);
    });

    // Append file uploads
    ["ss_one", "ss_two", "rc_doc"].forEach((field) => {
      if (formData[field].file) {
        formDataPayload.append(field, formData[field].file);
      }
    });


    
    try {
      const response = await ownerKycRequest(formDataPayload)
      console.log("KYC Request Successful:", response);
      onRaiseKyc(formIndex, response);
    } catch (err) {
      console.error("KYC Request Failed:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: "100%", mx: "auto", p: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="VIN"
          name="vin"
          value={formData.vin.value}
          onChange={handleChange}
          required
          disabled
          error={formData.vin.error}
          helperText={formData.vin.error ? formData.vin.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="License Plate"
          name="license_plate"
          value={formData.license_plate.value}
          onChange={handleChange}
          required
          error={formData.license_plate.error}
          helperText={formData.license_plate.error ? formData.license_plate.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Manufacturer"
          name="manufacturer"
          value={formData.manufacturer.value}
          onChange={handleChange}
          required
          error={formData.manufacturer.error}
          helperText={formData.manufacturer.error ? formData.manufacturer.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Model"
          name="model"
          value={formData.model.value}
          onChange={handleChange}
          required
          error={formData.model.error}
          helperText={formData.model.error ? formData.model.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Year"
          name="year"
          type="date"
          value={formData.year.value}
          onChange={handleChange}
          required
          error={formData.year.error}
          helperText={formData.year.error ? formData.year.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Color"
          name="color"
          value={formData.color.value}
          onChange={handleChange}
          required
          error={formData.color.error}
          helperText={formData.color.error ? formData.color.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Engine Number"
          name="engine_number"
          value={formData.engine_number.value}
          onChange={handleChange}
          required
          error={formData.engine_number.error}
          helperText={formData.engine_number.error ? formData.engine_number.message : ""}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Chassis Number"
          name="chassis_number"
          value={formData.chassis_number.value}
          onChange={handleChange}
          required
          error={formData.chassis_number.error}
          helperText={formData.chassis_number.error ? formData.chassis_number.message : ""}
        />
      </Grid>
    


      

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={formData.fuel_type.error}>
          <InputLabel>Fuel Type</InputLabel>
          <Select name="fuel_type" value={formData.fuel_type.value} onChange={handleChange}>
            <MenuItem value="Petrol">Petrol</MenuItem>
            <MenuItem value="Diesel">Diesel</MenuItem>
            <MenuItem value="Electric">Electric</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={formData.transmission.error}>
          <InputLabel>Transmission</InputLabel>
          <Select name="transmission" value={formData.transmission.value} onChange={handleChange}>
            <MenuItem value="Manual">Manual</MenuItem>
            <MenuItem value="Automatic">Automatic</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {[formData.ss_one.name , formData.ss_two.name, formData.rc_doc.name].map((field, index) => (
          <Grid key={index} item xs={12} sm={6}>
            <Typography variant="subtitle1">{field.replace("_", " ").toUpperCase()}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton color="primary" component="label">
                <AttachFile />
                <input type="file" name={field} accept="image/*" hidden onChange={handleChange} />
              </IconButton>
              {formData[field].preview ? (
                <img src={formData[field].preview} alt="Preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 5 }} />
              ) : (
                formData[field].name && <InsertDriveFile color="disabled" />
              )}
              <Typography variant="body2">{formData[field].name || "No file selected"}</Typography>
            </Box>
          </Grid>
        ))}



      <Grid item xs={12}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={submitDisabled || isLoading}
          sx={{ mt: 3, mb: 2 }}
          className="text-gray-500 hover:text-white"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </Grid>
    </Grid>
  </Box>
  
  );
}

export default KYC;

{/* <Grid item xs={12} sm={6}>
  <FormControl fullWidth required error={formData.kyc_status.error}>
    <InputLabel>KYC Status</InputLabel>
    <Select name="kyc_status" value={formData.kyc_status.value} onChange={handleChange}>
      <MenuItem value="Pending">Pending</MenuItem>
      <MenuItem value="Verified">Verified</MenuItem>
      <MenuItem value="Rejected">Rejected</MenuItem>
    </Select>
  </FormControl>
</Grid> */}


