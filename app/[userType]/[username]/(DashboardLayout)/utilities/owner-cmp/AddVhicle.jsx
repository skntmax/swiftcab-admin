import React, { useContext, useState } from "react";
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  useGetVehiclesListQuery,
  useInsertOwnerVhiclesMutation,
} from "../../../../../libs/apis/owner";
import { contextProvider } from "@components/AppProvider";
import RegisteredVhicles from "./RegisteredVhicles";

function AddVhicle() {
  const [insertOwnerVehicles, { isLoading: isSubmitting }] =
    useInsertOwnerVhiclesMutation();
  const { data, error, isLoading } = useGetVehiclesListQuery();
  const { successMessage, errorMessage } = useContext(contextProvider);
  const [selectedVehicles, setSelectedVehicles] = useState(null);
  const [refresh, setRefresh] = useState(false); 

  const vehicleOptions = Array.isArray(data?.data)
    ? data.data.map((item) => ({
        id: item.id,
        label: item.vhicle_type || item.vehicle_type,
      }))
    : [];

  const handleSubmit = async () => {
    if (!selectedVehicles?.id) {
      errorMessage("Please select a vehicle.");
      return;
    }

    try {
      const response = await insertOwnerVehicles({
        vhicleId: selectedVehicles.id,
      }).unwrap();

      if (response.error) {
        errorMessage(response.data);
      } else {
        successMessage("Vehicle added successfully!");
        setRefresh((prev) => !prev);
      }
    } catch (err) {
      errorMessage(err.message);
    }
  };

  return (
    <Box
      sx={{ p: 3, border: "1px solid #ccc", borderRadius: 2, width: "100%" }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Choose Vehicle
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Error fetching vehicles!</Typography>
      ) : (
        <Autocomplete
          multiple={false}
          options={vehicleOptions}
          getOptionLabel={(option) => option.label}
          value={selectedVehicles}
          onChange={(event, newValue) => {
            setSelectedVehicles(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select Vehicles"
              placeholder="Choose..."
              fullWidth
            />
          )}
          fullWidth
        />
      )}

      {isSubmitting ? (
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
          variant="contained"
          color="primary"
          sx={{ mt: 2, width: "100%" }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      )}

      <RegisteredVhicles key={refresh}/>
    </Box>
  );
}

export default AddVhicle;
