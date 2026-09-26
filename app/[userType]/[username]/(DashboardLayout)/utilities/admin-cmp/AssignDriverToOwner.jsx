'use client'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from '@components/FormController';
import { driverAssignmentSchema } from "@components/FormSchema/AssingDriverSchema/driverAssign"
import { useGetDriverListMutation } from '@app/libs/apis/driver';
import { vehicleTypeImageSrc, vehicleTypeLabel } from '@utils/vehicleTypeIcon';
import {
  useAssignDriverToOwnerMutation,
  useListOwnersForDriverAssignMutation,
  useOwnerAllVhiclesMutation,
  useOwnerAvailableVhiclesMutation,
  useOwnerDriverAssignmentsMutation,
  useUnassignDriverFromOwnerMutation,
} from '@app/libs/apis/admin';
import { contextProvider } from '@components/AppProvider';
import debounce from 'lodash/debounce';

const PAGE_SIZE = 20;

const pagedItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const pagedMeta = (payload) => ({
  total: Number(payload?.total) || (Array.isArray(payload) ? payload.length : 0),
  hasMore: Boolean(payload?.hasMore),
  page: Number(payload?.page) || 1,
});

const fullName = (...parts) => parts.filter(Boolean).join(' ').trim();

const vehicleYear = (year) => {
  if (!year) return '';
  const parsed = new Date(year);
  return Number.isNaN(parsed.getTime()) ? String(year) : String(parsed.getFullYear());
};

const vehicleLabel = (vehicle) => {
  const type = vehicle?.vhicle_type || vehicle?.name || '';
  const plate = vehicle?.license_plate ? ` · ${vehicle.license_plate}` : '';
  const model = vehicle?.model ? ` · ${vehicle.model}` : '';
  return `${vehicle?.vhicle_username || vehicle?.id}${type ? ` (${type})` : ''}${plate}${model}`;
};

const dash = (value) => (value === 0 || value ? String(value) : '—');

const DriverOption = ({ option }) => {
  const assigned = Boolean(option?.assignment_id);
  return (
    <Stack spacing={0.5} sx={{ py: 0.5, width: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography fontWeight={600}>{option.driver_username}</Typography>
        <Chip
          size="small"
          label={option.is_logged_in ? 'Logged in' : 'Offline'}
          color={option.is_logged_in ? 'success' : 'default'}
        />
        <Chip
          size="small"
          label={assigned ? 'Vehicle assigned' : 'No vehicle'}
          color={assigned ? 'warning' : 'info'}
          variant="outlined"
        />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {fullName(option.first_name, option.last_name) || 'No name'}
        {option.phone_no ? ` · ${option.phone_no}` : ''}
        {option.email ? ` · ${option.email}` : ''}
      </Typography>
      {assigned ? (
        <Typography variant="caption" color="text.secondary">
          {option.owner_username ? `Owner ${option.owner_username}` : 'Assigned'}
          {option.vhicle_username ? ` · ${option.vhicle_username}` : ''}
          {option.license_plate ? ` · ${option.license_plate}` : ''}
          {option.vhicle_type ? ` · ${option.vhicle_type}` : ''}
        </Typography>
      ) : null}
    </Stack>
  );
};

const OwnerOption = ({ option }) => (
  <Stack spacing={0.5} sx={{ py: 0.5, width: '100%' }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography fontWeight={600}>{option.username}</Typography>
      <Chip
        size="small"
        label={option.is_logged_in ? 'Logged in' : 'Offline'}
        color={option.is_logged_in ? 'success' : 'default'}
      />
      <Chip size="small" variant="outlined" label={`${option.vehicle_count ?? 0} vehicles`} />
    </Stack>
    <Typography variant="caption" color="text.secondary">
      {fullName(option.first_name, option.last_name) || 'No name'}
      {option.phone_no ? ` · ${option.phone_no}` : ''}
      {option.email ? ` · ${option.email}` : ''}
    </Typography>
  </Stack>
);

const VehicleOption = ({ option }) => {
  const taken = Boolean(option.driver_username);
  const typeIcon = vehicleTypeImageSrc(option);
  return (
    <Stack spacing={0.5} sx={{ py: 0.5, width: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {typeIcon ? (
          <Box
            component="img"
            src={typeIcon}
            alt=""
            sx={{ width: 32, height: 32, objectFit: 'contain' }}
          />
        ) : null}
        <Typography fontWeight={600}>{option.vhicle_username || option.id}</Typography>
        <Chip size="small" label={vehicleTypeLabel(option.vhicle_type || option.name) || 'Vehicle'} />
        <Chip
          size="small"
          label={taken ? `In use · ${option.driver_username}` : 'Free'}
          color={taken ? 'warning' : 'success'}
        />
        <Chip
          size="small"
          variant="outlined"
          label={option.is_kyc ? 'KYC verified' : (option.kyc_varification || 'KYC pending')}
          color={option.is_kyc ? 'success' : 'warning'}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Plate {dash(option.license_plate)} · {dash(option.manufacturer)} {dash(option.model)}
        {vehicleYear(option.year) ? ` · ${vehicleYear(option.year)}` : ''}
        {option.color ? ` · ${option.color}` : ''}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {option.fuel_type ? `${option.fuel_type}` : 'Fuel n/a'}
        {option.transmission ? ` · ${option.transmission}` : ''}
        {option.vin ? ` · VIN ${option.vin}` : ''}
      </Typography>
    </Stack>
  );
};

const AssignmentRow = ({ row, unassignLoading, onUnassign }) => {
  const [open, setOpen] = useState(false);
  const loggedIn = Boolean(row.driver_logged_in);
  return (
    <>
      <TableRow hover selected={loggedIn}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen((current) => !current)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack>
            <Typography fontWeight={600}>{row.owner_username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {fullName(row.owner_first_name, row.owner_last_name) || '—'}
              {row.owner_phone ? ` · ${row.owner_phone}` : ''}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={row.driver_avatar || undefined} sx={{ width: 32, height: 32 }}>
              {(row.driver_username || '?').slice(0, 1).toUpperCase()}
            </Avatar>
            <Stack>
              <Typography fontWeight={600}>{row.driver_username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {fullName(row.driver_first_name, row.driver_last_name) || '—'}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={loggedIn ? 'Logged in' : 'Offline'}
            color={loggedIn ? 'success' : 'default'}
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            {vehicleTypeImageSrc(row) ? (
              <Box
                component="img"
                src={vehicleTypeImageSrc(row)}
                alt=""
                sx={{ width: 32, height: 32, objectFit: 'contain' }}
              />
            ) : null}
            <Stack>
              <Typography>{row.vhicle_username || '—'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {vehicleTypeLabel(row.vhicle_type) || '—'}
                {row.license_plate ? ` · ${row.license_plate}` : ''}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>
        <TableCell>{row.self ? 'Yes' : 'No'}</TableCell>
        <TableCell align="right">
          <Button
            size="small"
            color="warning"
            disabled={unassignLoading}
            onClick={() => onUnassign(row.id)}
          >
            Unassign
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, borderBottom: open ? undefined : 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Driver</Typography>
                  <Typography variant="body2">Phone: {dash(row.driver_phone)}</Typography>
                  <Typography variant="body2">Email: {dash(row.driver_email)}</Typography>
                  <Typography variant="body2">KYC: {dash(row.driver_kyc)}</Typography>
                  <Typography variant="body2">Engaged: {row.driver_engaged ? 'Yes' : 'No'}</Typography>
                  <Typography variant="body2">Active: {row.driver_active ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Vehicle</Typography>
                  <Typography variant="body2">Name: {dash(row.vhicle_name)}</Typography>
                  <Typography variant="body2">Manufacturer / model: {dash(row.manufacturer)} {dash(row.model)}</Typography>
                  <Typography variant="body2">Year / color: {dash(vehicleYear(row.year))} {row.color ? `· ${row.color}` : ''}</Typography>
                  <Typography variant="body2">Fuel / gearbox: {dash(row.fuel_type)} {row.transmission ? `· ${row.transmission}` : ''}</Typography>
                  <Typography variant="body2">VIN: {dash(row.vin)}</Typography>
                  <Typography variant="body2">Engine / chassis: {dash(row.engine_number)} {row.chassis_number ? `· ${row.chassis_number}` : ''}</Typography>
                  <Typography variant="body2">KYC: {row.is_kyc ? 'Verified' : dash(row.kyc_varification)}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Owner</Typography>
                  <Typography variant="body2">Email: {dash(row.owner_email)}</Typography>
                  <Typography variant="body2">Logged in: {row.owner_logged_in ? 'Yes' : 'No'}</Typography>
                  <Typography variant="body2">Assigned: {row.created_on ? new Date(row.created_on).toLocaleString() : '—'}</Typography>
                  <Typography variant="body2">Updated: {row.updated_on ? new Date(row.updated_on).toLocaleString() : '—'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const AssignDriverToOwner = () => {
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
      owner: '',
      driver: '',
      vhicle: null,
    },
    resolver: yupResolver(driverAssignmentSchema),
  });

  const { successMessage, errorMessage } = useContext(contextProvider);
  const selectedOwner = watch('owner');
  const assignSelf = watch('self');
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [ownerHasMore, setOwnerHasMore] = useState(false);
  const [ownerPage, setOwnerPage] = useState(1);
  const [ownerQuery, setOwnerQuery] = useState('');
  const [driverOptions, setDriverOptions] = useState([]);
  const [driverHasMore, setDriverHasMore] = useState(false);
  const [driverPage, setDriverPage] = useState(1);
  const [driverQuery, setDriverQuery] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [assignmentQuery, setAssignmentQuery] = useState('');
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentHasMore, setAssignmentHasMore] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const assignmentListRef = useRef(null);
  const assignmentLoadLockRef = useRef(false);

  const [getDriverList, { data: getDriverListData, isLoading: driversLoading }] = useGetDriverListMutation();
  const [listOwners, { data: ownersData, isLoading: ownersLoading }] = useListOwnersForDriverAssignMutation();
  const [getAvailableVehicles, { data: vehiclesData }] = useOwnerAvailableVhiclesMutation();
  const [getAllVehicles, { data: allVehiclesData, isLoading: allVehiclesLoading }] = useOwnerAllVhiclesMutation();
  const [assignDriverToOwner, { data: assignData, isLoading: assignLoading }] = useAssignDriverToOwnerMutation();
  const [getAssignments, { data: assignmentsData, isLoading: assignmentsLoading }] = useOwnerDriverAssignmentsMutation();
  const [unassignDriver, { data: unassignData, isLoading: unassignLoading }] = useUnassignDriverFromOwnerMutation();

  const loadOwners = (q = ownerQuery, page = 1) => {
    setOwnerPage(page);
    setOwnerQuery(q);
    listOwners({ q, page, limit: PAGE_SIZE });
  };
  const loadDrivers = (q = driverQuery, page = 1) => {
    setDriverPage(page);
    setDriverQuery(q);
    getDriverList({ q, page, limit: PAGE_SIZE });
  };
  const loadAssignments = (owner = selectedOwner, q = assignmentQuery, page = 1) => {
    setAssignmentPage(page);
    getAssignments(owner ? { owner, q, page, limit: PAGE_SIZE } : { q, page, limit: PAGE_SIZE });
  };

  const searchOwners = useMemo(
    () => debounce((q) => loadOwners(q, 1), 300),
    []
  );
  const searchDrivers = useMemo(
    () => debounce((q) => loadDrivers(q, 1), 300),
    []
  );
  const searchAssignments = useMemo(
    () => debounce((q) => {
      setAssignmentQuery(q);
      loadAssignments(selectedOwner, q, 1);
    }, 300),
    [selectedOwner]
  );

  useEffect(() => () => {
    searchOwners.cancel();
    searchDrivers.cancel();
    searchAssignments.cancel();
  }, [searchOwners, searchDrivers, searchAssignments]);

  const onSubmit = (data) => {
    assignDriverToOwner({
      owner: data.owner,
      driver: data.self === true ? undefined : Number(data.driver),
      vhicle_assigned: Number(data.vhicle),
      self: Boolean(data.self),
    });
  };

  useEffect(() => {
    loadOwners('', 1);
    loadDrivers('', 1);
    loadAssignments('', '', 1);
  }, []);

  useEffect(() => {
    if (ownersData?.status === 200) {
      const items = pagedItems(ownersData.data);
      const meta = pagedMeta(ownersData.data);
      setOwnerOptions((prev) => (meta.page <= 1 ? items : [...prev, ...items.filter((row) => !prev.some((item) => item.id === row.id))]));
      setOwnerHasMore(meta.hasMore);
    }
  }, [ownersData]);

  useEffect(() => {
    if (getDriverListData?.status === 200) {
      const items = pagedItems(getDriverListData.data);
      const meta = pagedMeta(getDriverListData.data);
      setDriverOptions((prev) => (meta.page <= 1 ? items : [...prev, ...items.filter((row) => !prev.some((item) => item.driver_id === row.driver_id))]));
      setDriverHasMore(meta.hasMore);
    }
  }, [getDriverListData]);

  useEffect(() => {
    if (assignmentsData?.status === 200) {
      const items = pagedItems(assignmentsData.data);
      const meta = pagedMeta(assignmentsData.data);
      setAssignments((prev) => (meta.page <= 1 ? items : [...prev, ...items.filter((row) => !prev.some((item) => item.id === row.id))]));
      setAssignmentHasMore(meta.hasMore);
    }
  }, [assignmentsData]);

  useEffect(() => {
    if (!selectedOwner) {
      setVehicleOptions([]);
      setValue('vhicle', null);
      setAssignmentQuery('');
      loadAssignments('', assignmentQuery, 1);
      return;
    }
    setValue('vhicle', null);
    getAvailableVehicles({ owner: selectedOwner });
    getAllVehicles({ owner: selectedOwner });
    loadAssignments(selectedOwner, assignmentQuery, 1);
  }, [selectedOwner]);

  useEffect(() => {
    const available = Array.isArray(vehiclesData?.data) ? vehiclesData.data : [];
    const all = Array.isArray(allVehiclesData?.data) ? allVehiclesData.data : [];
    const byId = new Map();
    [...all, ...available].forEach((vehicle) => {
      if (vehicle?.id != null) byId.set(vehicle.id, vehicle);
    });
    setVehicleOptions(Array.from(byId.values()).map((vehicle) => ({
      ...vehicle,
      label: vehicleLabel(vehicle),
    })));
  }, [vehiclesData, allVehiclesData]);

  useEffect(() => {
    if (assignSelf) {
      setValue('driver', '', { shouldDirty: false });
    }
  }, [assignSelf, setValue]);

  useEffect(() => {
    if (assignData?.status === 500 && assignData?.error) return errorMessage(assignData?.message);
    if (assignData?.status === 200 && !assignData?.error) {
      successMessage(assignData?.message);
      const owner = selectedOwner;
      reset({ self: false, owner, driver: '', vhicle: null });
      loadDrivers(driverQuery, 1);
      if (owner) {
        getAvailableVehicles({ owner });
        getAllVehicles({ owner });
      }
      loadAssignments(owner, assignmentQuery, 1);
    }
  }, [assignData]);

  useEffect(() => {
    if (unassignData?.status === 500 && unassignData?.error) return errorMessage(unassignData?.message);
    if (unassignData?.status === 200 && !unassignData?.error) {
      successMessage(unassignData?.message);
      loadDrivers(driverQuery, 1);
      if (selectedOwner) {
        getAvailableVehicles({ owner: selectedOwner });
        getAllVehicles({ owner: selectedOwner });
      }
      loadAssignments(selectedOwner, assignmentQuery, 1);
    }
  }, [unassignData]);

  const ownerVehicles = useMemo(
    () => (selectedOwner && Array.isArray(allVehiclesData?.data) ? allVehiclesData.data : []),
    [allVehiclesData, selectedOwner]
  );

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Assign driver to Owner
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Search owners and drivers by name, username, phone, or plate. Assigned drivers stay visible
        with their vehicle status. A driver can be attached to only one vehicle at a time.
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
                type="searchable_dropdown"
                control={control}
                rest={{ label: "Search and select owner", fullWidth: true }}
                onCustomFuntionCaller={() => loadOwners(ownerQuery, 1)}
                onSearch={(q) => searchOwners(q)}
                onLoadMore={() => ownerHasMore && loadOwners(ownerQuery, ownerPage + 1)}
                hasMore={ownerHasMore}
                isLoading={ownersLoading}
                customOptionKeys={{ labelKey: "username", labelValue: "username" }}
                customOptions={ownerOptions}
                renderOption={(option) => <OwnerOption option={option} />}
                errors={errors}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="driver"
                type="searchable_dropdown"
                control={control}
                rest={{ label: "Search all drivers", fullWidth: true, disabled: Boolean(assignSelf) }}
                onCustomFuntionCaller={() => loadDrivers(driverQuery, 1)}
                onSearch={(q) => searchDrivers(q)}
                onLoadMore={() => driverHasMore && loadDrivers(driverQuery, driverPage + 1)}
                hasMore={driverHasMore}
                isLoading={driversLoading}
                customOptionKeys={{ labelKey: "driver_username", labelValue: "driver_id" }}
                customOptions={driverOptions}
                getOptionDisabled={(option) => Boolean(option?.assignment_id)}
                renderOption={(option) => <DriverOption option={option} />}
                errors={errors}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="vhicle"
                type="searchable_dropdown"
                control={control}
                rest={{ label: "Search this owner's vehicles", fullWidth: true, disabled: !selectedOwner }}
                filterLocal
                onCustomFuntionCaller={() => selectedOwner && getAllVehicles({ owner: selectedOwner })}
                customOptionKeys={{ labelKey: "label", labelValue: "id" }}
                customOptions={vehicleOptions}
                getOptionDisabled={(option) => Boolean(option?.driver_username) || !option?.is_kyc || option?.is_active === false}
                renderOption={(option) => <VehicleOption option={option} />}
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

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 1100, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Vehicles attached to {selectedOwner || 'owner'}
        </Typography>
        {!selectedOwner ? (
          <Typography>Select an owner to see their vehicles.</Typography>
        ) : allVehiclesLoading ? (
          <Typography>Loading vehicles…</Typography>
        ) : ownerVehicles.length === 0 ? (
          <Typography>No vehicles attached to this owner.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Plate / VIN</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Fuel</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned driver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ownerVehicles.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography>{row.vhicle_username || row.id}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dash(row.vhicle_name)} {row.color ? `· ${row.color}` : ''} {vehicleYear(row.year) ? `· ${vehicleYear(row.year)}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {vehicleTypeImageSrc(row) ? (
                        <Box
                          component="img"
                          src={vehicleTypeImageSrc(row)}
                          alt=""
                          sx={{ width: 28, height: 28, objectFit: 'contain' }}
                        />
                      ) : null}
                      <span>{vehicleTypeLabel(row.vhicle_type) || '—'}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography>{row.license_plate || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{dash(row.vin)}</Typography>
                  </TableCell>
                  <TableCell>
                    {dash(row.manufacturer)} {dash(row.model)}
                  </TableCell>
                  <TableCell>
                    {dash(row.fuel_type)} {row.transmission ? `· ${row.transmission}` : ''}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip
                        size="small"
                        label={row.is_active ? 'Active' : 'Inactive'}
                        color={row.is_active ? 'success' : 'default'}
                      />
                      <Chip
                        size="small"
                        label={row.is_kyc ? 'KYC verified' : (row.kyc_varification || 'Pending')}
                        color={row.is_kyc ? 'success' : 'warning'}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {row.driver_username ? (
                      <Stack>
                        <Typography>
                          {row.driver_username}{row.assignment_self ? ' (self)' : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fullName(row.driver_first_name, row.driver_last_name) || '—'}
                          {row.driver_phone ? ` · ${row.driver_phone}` : ''}
                        </Typography>
                        <Chip
                          size="small"
                          sx={{ mt: 0.5, width: 'fit-content' }}
                          label={row.driver_logged_in ? 'Logged in' : 'Offline'}
                          color={row.driver_logged_in ? 'success' : 'default'}
                        />
                      </Stack>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, maxWidth: 1100, width: '100%', mt: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Current assignments {selectedOwner ? `for ${selectedOwner}` : ''}
          </Typography>
          <TextField
            size="small"
            label="Search driver, owner, or plate"
            onChange={(event) => searchAssignments(event.target.value)}
            sx={{ minWidth: 280 }}
          />
        </Stack>
        {assignments.length === 0 ? (
          <Typography>{assignmentsLoading ? 'Loading assignments…' : 'No active driver-to-vehicle assignments.'}</Typography>
        ) : (
          <Box
            ref={assignmentListRef}
            sx={{ maxHeight: 520, overflow: 'auto' }}
            onScroll={(event) => {
              const list = event.currentTarget;
              if (!assignmentHasMore || assignmentsLoading || assignmentLoadLockRef.current) return;
              if (list.scrollTop + list.clientHeight >= list.scrollHeight - 48) {
                assignmentLoadLockRef.current = true;
                loadAssignments(selectedOwner, assignmentQuery, assignmentPage + 1);
                window.setTimeout(() => {
                  assignmentLoadLockRef.current = false;
                }, 400);
              }
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Owner</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Self</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((row) => (
                  <AssignmentRow
                    key={row.id}
                    row={row}
                    unassignLoading={unassignLoading}
                    onUnassign={(assignmentId) => unassignDriver({ assignmentId })}
                  />
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default AssignDriverToOwner;
