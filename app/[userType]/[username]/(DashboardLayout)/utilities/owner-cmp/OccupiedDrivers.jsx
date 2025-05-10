'use client'
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
} from '@mui/material';

const onboardedDrivers = [
  { id: 1, name: 'Rahul Sharma', vehicleNumber: 'DL 3C AB 1234' },
  { id: 2, name: 'Priya Verma', vehicleNumber: 'MH 12 XY 4567' },
  { id: 3, name: 'Amit Singh', vehicleNumber: 'KA 05 MN 8910' },
];

const OccupiedDrivers = () => {
  const [selfDrive, setSelfDrive] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [occupiedDrivers, setOccupiedDrivers] = useState([]);

  const handleAddDriver = () => {
    if (selfDrive) {
      setOccupiedDrivers([
        ...occupiedDrivers,
        {
          id: 'self',
          name: 'Owner (Self-Drive)',
          vehicleNumber: 'N/A',
          rideStatus: 'Available',
          estimatedFreeTime: '—',
        },
      ]);
    } else if (selectedDriver) {
      const driver = onboardedDrivers.find((d) => d.id === parseInt(selectedDriver));
      if (driver) {
        setOccupiedDrivers([
          ...occupiedDrivers,
          {
            ...driver,
            rideStatus: 'On Ride',
            estimatedFreeTime: '15 mins',
          },
        ]);
      }
    }
    // Reset selection
    setSelfDrive(false);
    setSelectedDriver('');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Occupied Drivers
      </Typography>

      {/* Selection Area */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selfDrive}
                  onChange={(e) => {
                    setSelfDrive(e.target.checked);
                    setSelectedDriver('');
                  }}
                />
              }
              label="I will drive myself"
            />
          </Grid>

          {!selfDrive && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Onboarded Driver</InputLabel>
                <Select
                  value={selectedDriver}
                  label="Select Onboarded Driver"
                  onChange={(e) => setSelectedDriver(e.target.value)}
                >
                  {onboardedDrivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.vehicleNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleAddDriver}>
              Add Driver
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table of Occupied Drivers */}
      {occupiedDrivers.length === 0 ? (
        <Typography>No drivers currently occupied.</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell>Vehicle Number</TableCell>
                <TableCell>Ride Status</TableCell>
                <TableCell>Estimated Free Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {occupiedDrivers.map((driver, index) => (
                <TableRow key={index}>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.vehicleNumber}</TableCell>
                  <TableCell>{driver.rideStatus}</TableCell>
                  <TableCell>{driver.estimatedFreeTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default OccupiedDrivers;
