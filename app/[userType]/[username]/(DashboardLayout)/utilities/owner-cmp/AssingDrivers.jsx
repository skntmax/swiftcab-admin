'use client'
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from '@components/FormController';
import { driverAssignmentSchema } from "@components/FormSchema/AssingDriverSchema/driverAssign"
import { useGetDriverListMutation } from '@app/libs/apis/driver';
import {
  useAssignDriverToVhicleMutation,
  useGetActiveOwnerVehiclesTypeListMutation,
  useOwnerAllVhiclesMutation,
  useOwnerDriverAssignmentsMutation,
  useUnassignDriverFromVhicleMutation,
} from '@app/libs/apis/owner';
import { contextProvider } from '@components/AppProvider';
import { getUserInfo } from '@utils';

const vehicleLabel = (vehicle) => {
  const plate = vehicle?.license_plate ? ` · ${vehicle.license_plate}` : '';
  const type = vehicle?.name ? ` (${vehicle.name})` : '';
  return `${vehicle?.vhicle_username || vehicle?.id}${type}${plate}`;
};

const AssingDrivers = () => {
  const users = getUserInfo();
  const ownerUsername = users?.username || '';

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      self: false,
      owner: ownerUsername,
      driver: '',
      vhicle: null,
    },
    resolver: yupResolver(driverAssignmentSchema),
  });

  const { successMessage, errorMessage } = useContext(contextProvider);
  const assignSelf = watch('self');
  const [vehicleOptions, setVehicleOptions] = useState([]);

  const [getDriverList, { data: getDriverListData }] = useGetDriverListMutation();
  const [getAvailableVehicles, { data: vehiclesData }] = useGetActiveOwnerVehiclesTypeListMutation();
  const [getAllVehicles, { data: allVehiclesData, isLoading: allVehiclesLoading }] = useOwnerAllVhiclesMutation();
  const [assignDriverToVhicle, { data: assignData, isLoading: assignLoading }] = useAssignDriverToVhicleMutation();
  const [getAssignments, { data: assignmentsData }] = useOwnerDriverAssignmentsMutation();
  const [unassignDriver, { data: unassignData, isLoading: unassignLoading }] = useUnassignDriverFromVhicleMutation();

  const ownerOptions = useMemo(
    () => (ownerUsername ? [{ username: ownerUsername }] : []),
    [ownerUsername]
  );

  const driverOptions = useMemo(() => {
    const payload = getDriverListData?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }, [getDriverListData]);

  const refreshLists = () => {
    getAvailableVehicles();
    getAllVehicles();
    getAssignments();
    getDriverList({ page: 1, limit: 50 });
  };

  const onSubmit = (data) => {
    assignDriverToVhicle({
      owner: ownerUsername,
      driver: data.self === true ? undefined : Number(data.driver),
      vhicle_assigned: Number(data.vhicle),
      self: Boolean(data.self),
    });
  };

  useEffect(() => {
    setValue('owner', ownerUsername, { shouldDirty: false, shouldTouch: false });
    refreshLists();
  }, [ownerUsername]);

  useEffect(() => {
    if (assignSelf) {
      setValue('driver', '', { shouldDirty: false });
    }
  }, [assignSelf, setValue]);

  useEffect(() => {
    if (vehiclesData?.status === 200 && Array.isArray(vehiclesData?.data)) {
      setVehicleOptions(vehiclesData.data.map((vehicle) => ({
        ...vehicle,
        label: vehicleLabel(vehicle),
      })));
    }
  }, [vehiclesData]);

  useEffect(() => {
    if (assignData?.status === 500 && assignData?.error) return errorMessage(assignData?.message);
    if (assignData?.status === 200 && !assignData?.error) {
      successMessage(assignData?.message);
      reset({ self: false, owner: ownerUsername, driver: '', vhicle: null });
      refreshLists();
    }
  }, [assignData]);

  useEffect(() => {
    if (unassignData?.status === 500 && unassignData?.error) return errorMessage(unassignData?.message);
    if (unassignData?.status === 200 && !unassignData?.error) {
      successMessage(unassignData?.message);
      refreshLists();
    }
  }, [unassignData]);

  const assignments = useMemo(() => {
    const payload = assignmentsData?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  }, [assignmentsData]);

  const ownerVehicles = useMemo(
    () => (Array.isArray(allVehiclesData?.data) ? allVehiclesData.data : []),
    [allVehiclesData]
  );

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Assign driver to Owner
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        An owner can have multiple vehicles. A driver can be attached to only one vehicle at a time.
        You can assign a driver to a free vehicle, or mark this owner as the driver.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1100, width: '100%' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <FormInput
                name="self"
                type="checkbox"
                control={control}
                rest={{ label: "Assign this owner as the driver", fullWidth: true }}
                errors={errors}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="owner"
                type="on_demand_dropdown"
                control={control}
                rest={{ label: "Select Owner", fullWidth: true, disabled: true }}
                onCustomFuntionCaller={() => {}}
                customOptionKeys={{ labelKey: "username", labelValue: "username" }}
                customOptions={ownerOptions}
                errors={errors}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="driver"
                type="on_demand_dropdown"
                control={control}
                rest={{ label: "Select Driver", fullWidth: true, disabled: Boolean(assignSelf) }}
                onCustomFuntionCaller={() => getDriverList({ page: 1, limit: 50 })}
                customOptionKeys={{ labelKey: "driver_username", labelValue: "driver_id" }}
                customOptions={driverOptions}
                errors={errors}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="vhicle"
                type="on_demand_dropdown"
                control={control}
                rest={{ label: "Select a free vehicle of this owner", fullWidth: true }}
                onCustomFuntionCaller={getAvailableVehicles}
                customOptionKeys={{ labelKey: "label", labelValue: "id" }}
                customOptions={vehicleOptions}
                errors={errors}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="submit"
                type="submit"
                control={control}
                rest={{ fullWidth: true, disabled: assignLoading }}
              >
                Assign driver
              </FormInput>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 1100, width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Vehicles attached to {ownerUsername || 'owner'}
        </Typography>
        {allVehiclesLoading ? (
          <Typography>Loading vehicles…</Typography>
        ) : ownerVehicles.length === 0 ? (
          <Typography>No vehicles attached to this owner.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Plate</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>KYC</TableCell>
                <TableCell>Assigned driver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ownerVehicles.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.vhicle_username || row.id}</TableCell>
                  <TableCell>{row.vhicle_type || '—'}</TableCell>
                  <TableCell>{row.license_plate || '—'}</TableCell>
                  <TableCell>{row.model || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.is_active ? 'Active' : 'Inactive'}
                      color={row.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.is_kyc ? 'Verified' : (row.kyc_varification || 'Pending')}
                      color={row.is_kyc ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    {row.driver_username
                      ? `${row.driver_username}${row.assignment_self ? ' (self)' : ''}`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 1100, width: '100%', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current assignments {ownerUsername ? `for ${ownerUsername}` : ''}
        </Typography>
        {assignments.length === 0 ? (
          <Typography>No active driver-to-vehicle assignments.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Owner</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Self</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.owner_username || ownerUsername}</TableCell>
                  <TableCell>{row.driver_username}</TableCell>
                  <TableCell>
                    {row.vhicle_username || '—'}
                    {row.license_plate ? ` (${row.license_plate})` : ''}
                  </TableCell>
                  <TableCell>{row.vhicle_type || row.model || '—'}</TableCell>
                  <TableCell>{row.self ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="warning"
                      disabled={unassignLoading}
                      onClick={() => unassignDriver({ assignmentId: row.id })}
                    >
                      Unassign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </>
  );
};

export default AssingDrivers;
