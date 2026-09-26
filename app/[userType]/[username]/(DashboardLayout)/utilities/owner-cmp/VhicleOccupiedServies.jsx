'use client'
import React from 'react';
import { Alert, Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useOwnerVhicleServiceListQuery } from '@app/libs/apis/owner';

function VhicleOccupiedServies({ embedded = false }) {
  const { data: getVhicleServieListData, isLoading } = useOwnerVhicleServiceListQuery();
  const rows = Array.isArray(getVhicleServieListData?.data) ? getVhicleServieListData.data : [];

  const grouped = rows.reduce((acc, item) => {
    const key = item.vhicle_username || item.vhicle_type || 'vehicle';
    if (!acc[key]) {
      acc[key] = {
        vhicle_username: item.vhicle_username,
        vhicle_type: item.vhicle_type,
        license_plate: item.license_plate,
        services: [],
      };
    }
    acc[key].services.push(item.service_name);
    return acc;
  }, {});

  return (
    <Box sx={{ width: '100%' }}>
      {!embedded && (
        <>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Vehicle services
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Services currently attached to each of your vehicles.
          </Typography>
        </>
      )}
      {embedded && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current vehicle services
        </Typography>
      )}

      {!isLoading && rows.length === 0 && (
        <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
          No services attached to any vehicle yet.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {Object.entries(grouped).map(([key, vehicle]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6">{vehicle.vhicle_type || 'Vehicle'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {vehicle.vhicle_username}
              </Typography>
              {vehicle.license_plate && (
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  Plate: {vehicle.license_plate}
                </Typography>
              )}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {vehicle.services.map((service, index) => (
                  <Chip key={`${key}-${index}`} label={service} size="small" />
                ))}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default VhicleOccupiedServies;
