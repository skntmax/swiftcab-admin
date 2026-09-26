'use client'
import React, { useContext, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  useGetVehiclesListQuery,
  useInsertOwnerVhiclesMutation,
} from '../../../../../libs/apis/owner';
import { contextProvider } from '@components/AppProvider';
import RegisteredVhicles from './RegisteredVhicles';
import { vehicleTypeImageSrc, vehicleTypeLabel } from '@utils/vehicleTypeIcon';

function AddVhicle() {
  const [insertOwnerVehicles, { isLoading: isSubmitting }] = useInsertOwnerVhiclesMutation();
  const { data, error, isLoading } = useGetVehiclesListQuery();
  const { successMessage, errorMessage } = useContext(contextProvider);
  const [selectedVehicles, setSelectedVehicles] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const vehicleOptions = Array.isArray(data?.data)
    ? data.data.map((item) => ({
        id: item.id,
        label: vehicleTypeLabel(item.vhicle_type || item.vehicle_type),
        vhicle_type: item.vhicle_type || item.vehicle_type,
        map_icon: item.map_icon,
        map_icon_file: item.map_icon_file,
        avatar: item.avatar,
      }))
    : [];

  const handleSubmit = async () => {
    if (!selectedVehicles?.id) {
      errorMessage('Please select a vehicle type.');
      return;
    }

    try {
      const response = await insertOwnerVehicles({
        vhicleId: selectedVehicles.id,
      }).unwrap();

      if (response.error) {
        errorMessage(response.data);
      } else {
        successMessage('Vehicle added successfully.');
        setSelectedVehicles(null);
        setRefresh((prev) => !prev);
      }
    } catch (err) {
      errorMessage(err.message);
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Add vehicle
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Register a vehicle type for this owner. You can complete KYC and attach services next.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1100, width: '100%', mb: 4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Typography color="error">Could not load vehicle types.</Typography>
        ) : (
          <>
            <Autocomplete
              options={vehicleOptions}
              getOptionLabel={(option) => option.label || ''}
              value={selectedVehicles}
              onChange={(_, newValue) => setSelectedVehicles(newValue)}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {vehicleTypeImageSrc(option) ? (
                    <Box
                      component="img"
                      src={vehicleTypeImageSrc(option)}
                      alt=""
                      sx={{ width: 36, height: 36, objectFit: 'contain' }}
                    />
                  ) : null}
                  <span>{option.label}</span>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select vehicle type"
                  placeholder="Choose a type"
                  fullWidth
                />
              )}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              fullWidth
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Adding…' : 'Add vehicle'}
            </Button>
          </>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Vehicles already registered
      </Typography>
      <RegisteredVhicles key={refresh} embedded />
    </>
  );
}

export default AddVhicle;
