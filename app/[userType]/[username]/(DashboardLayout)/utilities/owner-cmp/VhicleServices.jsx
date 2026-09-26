'use client'
import React, { useState, useEffect, useContext } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  useGetVehiclesTypeListQuery,
  useGetVehiclesServiceListQuery,
  useAddVehicleServiceMutation,
} from '@app/libs/apis/owner';
import { contextProvider } from '@components/AppProvider';
import VhicleOccupiedServies from './VhicleOccupiedServies';

function VhicleServices() {
  const { data: vehicleData, isLoading: vehicleLoading, error: vehicleError } = useGetVehiclesTypeListQuery();
  const { data: serviceData, isLoading: serviceLoading, error: serviceError } = useGetVehiclesServiceListQuery();
  const [addVehicleService, { isLoading: isSubmitting }] = useAddVehicleServiceMutation();

  const [selectedVehicles, setSelectedVehicles] = useState(null);
  const [selectedServices, setSelectedServices] = useState(null);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { successMessage, errorMessage } = useContext(contextProvider);

  useEffect(() => {
    if (vehicleData?.data) {
      setVehicleOptions(vehicleData.data.map((item) => ({
        label: `${item.name} · ${item.vhicle_username}`,
        value: item.id,
      })));
    }
  }, [vehicleData]);

  useEffect(() => {
    if (serviceData?.data) {
      setServiceOptions(serviceData.data.map((item) => ({
        label: item.service_name,
        value: item.id,
      })));
    }
  }, [serviceData]);

  const handleSubmit = async () => {
    if (!selectedVehicles?.value || !selectedServices?.value) {
      errorMessage('Please select both a vehicle and a service.');
      return;
    }

    try {
      const response = await addVehicleService({
        vhicleId: selectedVehicles.value,
        serviceId: selectedServices.value,
      }).unwrap();
      if (!response.error) {
        successMessage(response.message);
        setSelectedServices(null);
        setRefreshKey((value) => value + 1);
      } else {
        errorMessage(response.data);
      }
    } catch (error) {
      errorMessage(error.message);
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Add vehicle services
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Attach a service plan to one of your active vehicles.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1100, width: '100%', mb: 4 }}>
        {vehicleLoading || serviceLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            {vehicleError && <Alert severity="error" sx={{ mb: 2 }}>Failed to fetch vehicles.</Alert>}
            {serviceError && <Alert severity="error" sx={{ mb: 2 }}>Failed to fetch services.</Alert>}

            <Autocomplete
              options={vehicleOptions}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              value={selectedVehicles}
              onChange={(_, valueObj) => setSelectedVehicles(valueObj)}
              renderInput={(params) => <TextField {...params} label="Vehicle" variant="outlined" />}
              fullWidth
            />
            <Box sx={{ height: 16 }} />
            <Autocomplete
              options={serviceOptions}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              value={selectedServices}
              onChange={(_, value) => setSelectedServices(value)}
              renderInput={(params) => <TextField {...params} label="Service" variant="outlined" />}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{ mt: 3 }}
            >
              {isSubmitting ? 'Saving…' : 'Add service'}
            </Button>
          </>
        )}
      </Paper>

      <VhicleOccupiedServies key={refreshKey} embedded />
    </>
  );
}

export default VhicleServices;
