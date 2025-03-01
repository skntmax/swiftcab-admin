import React, { useState, useEffect, useContext } from "react";
import { Autocomplete, TextField, Box, Button, CircularProgress, Alert } from "@mui/material";
import { useGetVehiclesTypeListQuery, useGetVehiclesServiceListQuery, useAddVehicleServiceMutation } from "@app/libs/apis/owner";
import { contextProvider } from "@components/AppProvider";
import VhicleOccupiedServies from "./VhicleOccupiedServies";
import Chip from '@mui/material/Chip';

function VhicleServices() {
  const { data: vehicleData, isLoading: vehicleLoading, error: vehicleError } = useGetVehiclesTypeListQuery(); 
  const { data: serviceData, isLoading: serviceLoading, error: serviceError } = useGetVehiclesServiceListQuery();
  const [addVehicleService, { data:addVehicleServiceData,  isLoading: isSubmitting }] = useAddVehicleServiceMutation(); // Mutation hook

  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const { successMessage, errorMessage ,  } = useContext(contextProvider);

  // Populate vehicle options
  useEffect(() => {
    if (vehicleData?.data) {
      const formattedVehicles = vehicleData.data.map((item) => ({
        labelJsx: <Chip label={`${item.name}-${item.vhicle_username}`} color="success" variant="filled" />  , // Display vehicle name
        label:`${item.name}-${item.vhicle_username}`  , // Display vehicle name
        value: item.id,   // Unique ID
      }));
      setVehicleOptions(formattedVehicles);
    }
  }, [vehicleData]);

  // Populate service options
  useEffect(() => {
    if (serviceData?.data) {
      const formattedServices = serviceData.data.map((item) => ({
        label: item.service_name, // Display service name
        value: item.id,           // Unique ID
      }));
      setServiceOptions(formattedServices);
    }
  }, [serviceData]);


   

  const handleSubmit = async () => {
    if (!selectedVehicles?.value || !selectedServices?.value) {
      errorMessage("Please select both vehicle and service.");
      return;
    }
    
    const payload = {
      vhicleId: selectedVehicles.value, // Get vehicle ID
      serviceId: selectedServices.value, // Get service ID
    };
  
    try {
      const response = await addVehicleService(payload).unwrap();
      if(!response.error){
        successMessage(response.message);
      }else{
        errorMessage(response.data);
      }
      console.log("Success:", response);
    } catch (error) {
      errorMessage(error.message);
    }
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
        // minHeight: "100vh",
        padding: 2,
        overflow: "auto"
      }}
    >
      <Box sx={{ width: "100%" }}>
        {vehicleLoading || serviceLoading ? <CircularProgress /> : null}
        {vehicleError && <Alert severity="error">Failed to fetch vehicle data.</Alert>}
        {serviceError && <Alert severity="error">Failed to fetch service data.</Alert>}

        {!vehicleLoading && !serviceLoading && (
          <>
            {/* Vehicle Selection */}
            <Autocomplete
              multiple={false}
              options={vehicleOptions}
              getOptionLabel={(option) => option.label }
              isOptionEqualToValue={(option, value) => option.value === value.value}
              onChange={(event, valueObj) =>  setSelectedVehicles(valueObj)}
              renderOption={(props, option) => ( 
                  <li {...props}>
                    {option.labelJsx}  {/* Display JSX in dropdown */}
                  </li>
                )}

              renderInput={(params) => {
                return <TextField {...params} label="Type of Vehicles" variant="outlined" />  
              } }
              fullWidth
            />
            <Box sx={{ height: 16 }} />

            {/* Service Selection */}
            <Autocomplete
              multiple={false}
              options={serviceOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              onChange={(event, value) => setSelectedServices(value)}
              renderInput={(params) => <TextField  {...params}  label="Service" variant="outlined"
  
               />}
              fullWidth
            />
            <Box sx={{ height: 16 }} />

            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </>
        )}
      </Box>
    </Box>
     
     <VhicleOccupiedServies />
     
     </>

  );
}

export default VhicleServices;
