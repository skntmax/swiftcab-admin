'use client';

import React, { useContext, useEffect } from 'react';
import { Alert, Stack } from '@mui/material';
import { LayoutGrid } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormInput } from '@components/FormController';
import { NAV_ICON_OPTIONS } from '@components/AppIcon';
import { navMenuSchema } from '@/components/FormSchema/test/NavMenuSchema.js';
import { useAddNavbarMutation } from '@app/libs/apis/admin';
import { contextProvider } from '@components/AppProvider';
import AdminMatrixShell from '../AdminMatrixShell';

function NavItems() {
  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors, isValid },
    setError,
  } = useForm({
    defaultValues: {
      nav_item: '',
      sub_menu: true,
      href: '',
      icon: '',
    },
    resolver: yupResolver(navMenuSchema),
  });

  const [addNavbar, { data: addNavbarData, isLoading: addNavbarLoading }] = useAddNavbarMutation();
  const { successMessage, errorMessage } = useContext(contextProvider);

  const onSubmit = async (data) => {
    if (!isValid) return;
    try {
      await addNavbar(data);
    } catch (error) {
      console.error('API Error: ', error);
      setError('root', { type: 'server', message: 'Failed to add navbar' });
    }
  };

  useEffect(() => {
    if (addNavbarData?.status === 500 && addNavbarData?.error) {
      errorMessage(addNavbarData?.message);
      return;
    }
    if (addNavbarData?.status === 200 && !addNavbarData?.error) {
      successMessage(addNavbarData?.message);
      reset();
    }
  }, [addNavbarData?.data]);

  return (
    <AdminMatrixShell
      icon={LayoutGrid}
      title="Create top-level menu group"
      subtitle="Adds a sidebar section (e.g. Utilities). Set “Have sub menu” when this group will contain tabs created in Sub Navigation."
      step={1}
      totalSteps={5}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Alert severity="info" variant="outlined">
          Next step: create tabs under this group in <strong>Sub Navigation</strong>, then assign the group to roles in <strong>Menu → Roles</strong>.
        </Alert>

        <FormInput
          name="nav_item"
          type="text"
          control={control}
          rest={{
            label: 'Menu group name',
            placeholder: 'Utilities',
            error: !!errors?.nav_item,
            helperText: errors?.nav_item?.message,
          }}
        />

        <FormInput
          name="sub_menu"
          type="checkbox"
          control={control}
          register={register}
          rest={{
            label: 'This group contains sub-tabs',
            error: !!errors?.sub_menu,
            helperText: errors?.sub_menu?.message || 'Keep enabled for admin utility sections.',
          }}
        />

        <FormInput
          name="href"
          type="text"
          control={control}
          rest={{
            label: 'Group href slug (optional)',
            placeholder: 'utilities',
            error: !!errors?.href,
            helperText: errors?.href?.message,
          }}
        />

        <FormInput
          name="icon"
          type="dropdown"
          control={control}
          options={NAV_ICON_OPTIONS}
          rest={{
            label: 'Sidebar icon',
            error: !!errors.icon,
            helperText: errors.icon?.message || 'Choose a lightweight icon from the portal set.',
          }}
        />

        <FormInput name="submitButton" type="submit" control={control} isLoading={addNavbarLoading} rest={{}}>
          Create menu group
        </FormInput>
      </Stack>
    </AdminMatrixShell>
  );
}

export default NavItems;
