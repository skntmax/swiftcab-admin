"use client";
import React, { useContext, useState } from "react";
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Box, Grid, Typography,Link, CircularProgress } from "@mui/material";
import { useOwnerKycRequestMutation } from "@app/libs/apis/owner";
import { KYC_STATUS } from "@constants";
import { useUpdateKycStatusMutation } from "@app/libs/apis/admin";
import { contextProvider } from "@components/AppProvider";


const statusOptions = ["INITIATED", "PENDING", "VERIFIED", "COMPLETED"];

const colors = {
  vin: "primary.main",
  license_plate: "secondary.main",
  manufacturer: "success.main",
  model: "warning.main",
  year: "error.main",
  color: "info.main",
  engine_number: "primary.dark",
  chassis_number: "secondary.dark",
  fuel_type: "success.dark",
  transmission: "warning.dark",
  ss_one: "text.primary",
  ss_two: "text.primary",
  rc_doc: "text.primary",
};

function KycFormStatus({ fd, formIndex, onRaiseKyc }) {

  const [updateKyc, { isLoading:updateKycLoader, data, error }] = useUpdateKycStatusMutation();
  const { successMessage , errorMessage ,setCookie  } = useContext(contextProvider)
 
  const [formData, setFormData] = useState(
    fd.map(ele=>(
      {
        vin: { name: "vin", value: ele.username, error: false, message: "Email is required" },
        license_plate: { name: "license_plate", value: ele.license_plate, error: false, message: "License plate is required" },
        manufacturer: { name: "manufacturer", value: ele.manufacturer, error: false, message: "Manufacturer is required" },
        model: { name: "model", value: ele.model, error: false, message: "Model is required" },
        year: { name: "year", value: new Date(ele.year).toDateString(), error: false, message: "Year is required" },
        color: { name: "color", value: ele.color, error: false, message: "Color is required" },
        engine_number: { name: "engine_number", value: ele.engine_number, error: false, message: "Engine number is required" },
        chassis_number: { name: "chassis_number", value: ele.chassis_number, error: false, message: "Chassis number is required" },
        fuel_type: { name: "fuel_type", value: ele.chassis_number, error: false, message: "Fuel type is required" },
        transmission: { name: "transmission", value: ele.transmission, error: false, message: "Transmission is required" },
        ss_one: { name: "ss_one", value: ele.ss_one, error: false, message: "screenshot is required" },
        ss_two: { name: "ss_two", value: ele.ss_two, error: false, message: "screenshot is required" },
        rc_doc: { name: "rc_doc", value: ele.rc_doc, error: false, message: "RC doc is required" },
        kyc_status: { name: "kyc_status", value: ele.kyc_varification, error: false, message: "KYC status is required" },
      }
    ))
 );

 const handleStatusChange = (e , index)=>{
 const { name , value}  = e.target

setFormData(p=>{
   return p.map((ele, i)=>{
    if(i==index) {
      return {...ele , [name]:{ ...p[index][name] , value:value   } }
    }
      return ele 
     })
    })

 }



  const submitKycResponse = async (payload ,kycStatus ) => {
 
    console.log(payload)
    const { vhicle_owner_id:ownerId , id:vhicleId }  = payload
    const  updateKycPaylod = {  vhicleId ,  ownerId , kycStatus }

    
    if(!vhicleId ||   !ownerId ||  !kycStatus) {
      errorMessage(`please provide ,${vhicleId} ${ownerId} ${kycStatus} `)
    }
    updateKyc(updateKycPaylod)

  };

  return (

    <>

 {Array.isArray(formData) && formData.length>0 &&  formData.map((item,index)=>(
                <Box
                    sx={{
                      maxWidth: "100%",
                      mx: "auto",
                      p: 3,
                      backgroundColor: "background.paper",
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      {[
                        { label: "VIN", name: "vin" },
                        { label: "License Plate", name: "license_plate" },
                        { label: "Manufacturer", name: "manufacturer" },
                        { label: "Model", name: "model" },
                        { label: "Year", name: "year" },
                        { label: "Color", name: "color" },
                        { label: "Engine Number", name: "engine_number" },
                        { label: "Chassis Number", name: "chassis_number" },
                        { label: "Fuel Type", name: "fuel_type" },
                        { label: "Transmission", name: "transmission" },
                      ].map(({ label, name }) => (
                        <Grid item xs={12} sm={6} key={name}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {label}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: "bold", color: colors[name] }}>
                            {formData[index][name].value || "N/A"}
                          </Typography>
                        </Grid>
                      ))}

                      {/* Screenshot One */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Screenshot One
                        </Typography>
                        <Box
                          component="img"
                          src={formData[index].ss_one.value }
                          alt="Screenshot One"
                          sx={{ width: "50%", maxHeight: 200, borderRadius: 1, objectFit: "cover" }}
                        />
                      </Grid>

                      {/* Screenshot Two */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Screenshot Two
                        </Typography>
                        <Box
                          component="img"
                          src={formData[index].ss_two.value  }
                          alt="Screenshot Two"
                          sx={{ width: "50%", maxHeight: 200, borderRadius: 1, objectFit: "cover" }}
                        />
                      </Grid>

                  
                      {/* RC Document */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          RC Document
                        </Typography>
                        <Link href={formData[index].rc_doc.value || "#"  } target="_blank" rel="noopener" sx={{ fontWeight: "bold" }}>
                          View / Download RC Document
                        </Link>
                      </Grid>

                      {/* Status Dropdown */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select name={formData[index].kyc_status.name} value={formData[index].kyc_status.value || "N/A"} onChange={(e)=>handleStatusChange(e , index)}>
                            {Object.keys(KYC_STATUS).map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>



                  {updateKycLoader ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              paddingTop: "10px",
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        ) : (
                          <Button
                            onClick={()=> submitKycResponse(fd[index] , formData[index].kyc_status.value )}
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            className="text-gray-500 hover:text-white"
                          >
                            Update 
                          </Button>
                        )}
                                           
                            
                      </Grid>
                    </Grid>
                  </Box>
            ))}
   
    </>
  );
}

export default KycFormStatus;



