'use client'
import React, { useEffect } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import InfoIcon from '@mui/icons-material/Info';
import { useGetOwnerVhiclesListMutation } from '@app/libs/apis/owner';
import { vehicleTypeImageSrc, vehicleTypeLabel } from '@utils/vehicleTypeIcon';

const kycColor = (status, isKyc) => {
  if (isKyc || status === 'VERIFIED' || status === 'COMPLETED') return 'success';
  if (status === 'INITIATED') return 'info';
  return 'warning';
};

function RegisteredVhicles({ embedded = false }) {
  const [getVehicles, { data, isLoading }] = useGetOwnerVhiclesListMutation();

  useEffect(() => {
    getVehicles();
  }, []);

  const vehicles = Array.isArray(data?.data) ? data.data : [];

  return (
    <Box sx={{ width: '100%' }}>
      {!embedded && (
        <>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Registered vehicles
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Every active vehicle attached to this owner, with KYC status at a glance.
          </Typography>
        </>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!isLoading && vehicles.length === 0 && (
        <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
          No registered vehicles yet. Add a vehicle type to get started.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.vhicle_id || vehicle.vhicle_username}>
            <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  {vehicleTypeImageSrc(vehicle) ? (
                    <Box
                      component="img"
                      src={vehicleTypeImageSrc(vehicle)}
                      alt={vehicleTypeLabel(vehicle.vhicle)}
                      sx={{ width: 40, height: 40, objectFit: 'contain' }}
                    />
                  ) : (
                    <DirectionsCarFilledOutlinedIcon color="primary" />
                  )}
                  <Typography variant="h6">{vehicleTypeLabel(vehicle.vhicle) || 'Vehicle'}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {vehicle.vhicle_username || vehicle.username}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Plate: {vehicle.license_plate || '—'}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={vehicle.is_kyc ? 'KYC verified' : (vehicle.kyc_varification || 'Pending')}
                    color={kycColor(vehicle.kyc_varification, vehicle.is_kyc)}
                  />
                  {vehicle.model && <Chip size="small" label={vehicle.model} variant="outlined" />}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default RegisteredVhicles;
