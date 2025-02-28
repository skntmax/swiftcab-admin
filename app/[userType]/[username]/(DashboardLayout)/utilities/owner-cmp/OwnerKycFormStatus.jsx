"use client";
import React, { useState } from "react";
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Box, Grid, Typography,Link } from "@mui/material";
import { useOwnerKycRequestMutation } from "@app/libs/apis/owner";
import { DotLottieReact } from "@node_modules/@lottiefiles/dotlottie-react/dist";
import { KYC_STATUS } from "@constants";


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

function OwnerKycFormStatus({ fd, formIndex, onRaiseKyc ,handleStatusChange ,kycStatus }) {

  const [ownerKycRequest, { isLoading, data, error }] = useOwnerKycRequestMutation();

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
        // kyc_status: { name: "kyc_status", value: fd.is_kyc, error: false, message: "KYC status is required" },
      }
    ))
 );

  const handleChange = (e) => {
    const { name, value } = e.target;

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

    try {
      const response = await ownerKycRequest(payload).unwrap();
      console.log("KYC Request Successful:", response);
      onRaiseKyc(formIndex, response);
    } catch (err) {
      console.error("KYC Request Failed:", err);
    }
  };

  return (

    <>



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

                 
                {kycStatus==KYC_STATUS.COMPLETED || kycStatus==KYC_STATUS.VERIFIED  && 
                    <DotLottieReact
                    style={{width:"10%"}}
                    src="https://lottie.host/f1e18a8c-882e-4923-8135-990a69c64b08/1nAYkHPyNR.lottie"
                    loop
                    autoplay
                    />
                    }
                    

            {Array.isArray(formData) && formData.length>0 &&  formData.map((item,index)=>(
                 <>

                
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
                      ].map(({ label, name }) => (<>
                        <Grid item xs={12} sm={6} key={name}>
                         
                        <Box display="flex" alignItems="center"  gap={1}>
                        <Typography variant="subtitle2" color="textSecondary">
                            {label}
                        </Typography>
                        
                        {label === "VIN"  && (kycStatus==KYC_STATUS.COMPLETED || kycStatus==KYC_STATUS.VERIFIED) &&  (
                            <>     
                            <Typography variant="subtitle2" color="textSecondary">
                            (KYC varified)
                          </Typography>
                             <DotLottieReact
                            style={{ width: "20%", height: "20%" }}
                            src="https://lottie.host/f1e18a8c-882e-4923-8135-990a69c64b08/1nAYkHPyNR.lottie"
                            loop
                            autoplay
                            />  </> 
                        )}
                        </Box>
                          <Typography variant="body1" sx={{ fontWeight: "bold", color: colors[name] }}>
                            {formData[index][name].value || "N/A"}
                          </Typography>
                        </Grid>
                        </>
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

                    </Grid>

                    </>
                        ))}
                  </Box>
   
    </>
  );
}

export default OwnerKycFormStatus;



