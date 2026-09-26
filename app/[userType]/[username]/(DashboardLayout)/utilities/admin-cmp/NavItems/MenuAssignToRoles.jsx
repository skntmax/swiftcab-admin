'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Autocomplete,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link2 } from 'lucide-react';
import { FormInput } from '@components/FormController';
import { useAddMenuToRolesMutation, useGetNavbarListMutation } from '@app/libs/apis/admin';
import { assigningRoleMenuSchema } from '@components/FormSchema/test/NavMenuSchema';
import { contextProvider } from '@components/AppProvider';
import { useAppSelector } from '@app/libs/store';
import AdminMatrixShell from '../AdminMatrixShell';

function MenuAssignToRoles() {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    defaultValues: {
      role: [],
      nav_menu: '',
    },
    resolver: yupResolver(assigningRoleMenuSchema),
  });

  const roleList = useAppSelector((ele) => ele.userRoles.list) || [];
  const roleOptions = useMemo(
    () => roleList.map((role) => ({ id: role.id, label: role.label || role.name, name: role.name })),
    [roleList],
  );

  const [navMenuItems, setNavMenuItems] = useState([]);
  const [getNavbar, { data: getNavbarData }] = useGetNavbarListMutation();
  const [addMenuToRoles, { data: addMenuToRolesData, isLoading: addMenuToRolesLoading }] = useAddMenuToRolesMutation();
  const { successMessage, errorMessage } = useContext(contextProvider);

  useEffect(() => {
    getNavbar();
  }, [getNavbar]);

  useEffect(() => {
    if (getNavbarData?.status === 200 && !getNavbarData?.error) {
      setNavMenuItems(
        getNavbarData?.data?.map((ele) => ({ value: ele.id, label: ele.nav_item })),
      );
    }
  }, [getNavbarData]);

  useEffect(() => {
    if (addMenuToRolesData?.status === 500 && addMenuToRolesData?.error) {
      errorMessage(addMenuToRolesData?.message);
      return;
    }
    if (addMenuToRolesData?.status === 200 && !addMenuToRolesData?.error) {
      successMessage(addMenuToRolesData?.message || 'Menu group assigned to role(s)');
    }
  }, [addMenuToRolesData?.data]);

  const onSubmit = (data) => {
    if (!isValid) return;
    const roleIds = Array.isArray(data.role)
      ? data.role.map((item) => (typeof item === 'object' ? item.id : item))
      : [data.role];

    addMenuToRoles({
      roles: roleIds,
      nav_menu_id: data.nav_menu,
    });
  };

  return (
    <AdminMatrixShell
      icon={Link2}
      title="Assign menu group to roles"
      subtitle="Gate 1 of the role matrix: a role must be linked to a top-level menu group before any of its tabs can appear in the sidebar."
      step={3}
      totalSteps={5}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Alert severity="warning" variant="outlined">
          This page is required. Without it, roles never see the menu section — even if capabilities and permissions are configured correctly.
          Tab-level access is still controlled in <strong>Capabilities</strong> (Gate 2) and optionally per-user in <strong>Assign roles</strong> (Gate 3).
        </Alert>

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={roleOptions}
              getOptionLabel={(option) => option.label || option.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={Array.isArray(field.value) ? field.value : []}
              onChange={(_event, newValue) => field.onChange(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={option.id} label={option.label || option.name} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Roles"
                  error={!!errors.role}
                  helperText={errors.role?.message || 'Select one or more roles'}
                />
              )}
            />
          )}
        />

        <FormInput
          name="nav_menu"
          type="dropdown"
          control={control}
          options={navMenuItems}
          rest={{
            label: 'Menu group',
            error: !!errors?.nav_menu,
            helperText: errors?.nav_menu?.message,
          }}
        />

        {navMenuItems.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
              Available menu groups
            </Typography>
            {navMenuItems.map((item) => (
              <Chip key={item.value} size="small" variant="outlined" label={item.label} />
            ))}
          </Stack>
        )}

        <FormInput
          name="submitButton"
          type="submit"
          control={control}
          isLoading={addMenuToRolesLoading}
          rest={{}}
        >
          Assign menu to selected roles
        </FormInput>
      </Stack>
    </AdminMatrixShell>
  );
}

export default MenuAssignToRoles;
