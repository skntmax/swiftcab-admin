'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Stack } from '@mui/material';
import { GitBranch } from 'lucide-react';
import { FormInput } from '@components/FormController';
import { useAddSubnavBarMutation, useGetNavbarListMutation } from '@app/libs/apis/admin';
import { NAV_ICON_OPTIONS } from '@components/AppIcon';
import { subNavbmenuSchema } from '@components/FormSchema/test/NavMenuSchema';
import { contextProvider } from '@components/AppProvider';
import AdminMatrixShell from '../AdminMatrixShell';

const SubNavForm = () => {
  const { control, handleSubmit, reset, register, formState: { errors, isValid } } = useForm({
    defaultValues: {
      sub_nav_item: '',
      sub_menu: false,
      href: '',
      icon: '',
      nav_item_id: '',
      extra_paths: '',
    },
    resolver: yupResolver(subNavbmenuSchema),
  });

  const [navListItems, setNavListItem] = useState([]);
  const [getNavbar, { data: getNavbarData }] = useGetNavbarListMutation();
  const [addSubnavbar, { data: addSubnavbarData, isLoading: addSubnavbarDataLoading }] = useAddSubnavBarMutation();
  const { successMessage, errorMessage } = useContext(contextProvider);

  const onSubmit = (data) => {
    if (isValid) addSubnavbar(data);
  };

  useEffect(() => {
    getNavbar();
  }, [getNavbar]);

  useEffect(() => {
    if (getNavbarData?.status === 200 && !getNavbarData?.error) {
      setNavListItem(
        getNavbarData?.data?.map((ele) => ({ value: ele.id, label: `${ele.id} · ${ele.nav_item}` })),
      );
    }
  }, [getNavbarData]);

  useEffect(() => {
    if (addSubnavbarData?.status === 500 && addSubnavbarData?.error) {
      errorMessage(addSubnavbarData?.message);
      return;
    }
    if (addSubnavbarData?.status === 200 && !addSubnavbarData?.error) {
      successMessage(addSubnavbarData?.message || 'Sub navigation tab created');
      reset();
    }
  }, [addSubnavbarData?.data]);

  return (
    <AdminMatrixShell
      icon={GitBranch}
      title="Create sub-navigation tab"
      subtitle="Each tab auto-creates a permission record tied to ?tabs= href. That permission is what capabilities and user overrides reference."
      step={2}
      totalSteps={5}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Alert severity="info" variant="outlined">
          The <strong>href</strong> becomes the tab slug, e.g. <code>role-management</code> → <code>?tabs=role-management</code>.
          A permission like <code>allow-role-management</code> is created automatically.
        </Alert>

        <FormInput
          name="nav_item_id"
          type="dropdown"
          control={control}
          register={register}
          options={navListItems}
          rest={{
            label: 'Parent menu group',
            error: !!errors.nav_item_id,
            helperText: errors.nav_item_id?.message,
          }}
        />

        <FormInput
          name="sub_nav_item"
          type="text"
          control={control}
          register={register}
          rest={{
            label: 'Tab label',
            placeholder: 'Role Management',
            error: !!errors?.sub_nav_item,
            helperText: errors?.sub_nav_item?.message,
          }}
        />

        <FormInput
          name="href"
          type="text"
          control={control}
          register={register}
          rest={{
            label: 'Tab href slug',
            placeholder: 'role-management',
            error: !!errors?.href,
            helperText: errors?.href?.message || 'No leading slash required.',
          }}
        />

        <FormInput
          name="extra_paths"
          type="text"
          control={control}
          register={register}
          rest={{
            label: 'Extra paths (optional JSON array)',
            placeholder: '["/permission-management/create"]',
            error: !!errors?.extra_paths,
            helperText: errors?.extra_paths?.message,
          }}
        />

        <FormInput
          name="icon"
          type="dropdown"
          control={control}
          options={NAV_ICON_OPTIONS}
          rest={{
            label: 'Tab icon',
            error: !!errors.icon,
            helperText: errors.icon?.message || 'Choose a lightweight icon from the portal set.',
          }}
        />

        <FormInput
          name="submitButton"
          type="submit"
          control={control}
          isLoading={addSubnavbarDataLoading}
          rest={{}}
        >
          Create sub-navigation tab
        </FormInput>
      </Stack>
    </AdminMatrixShell>
  );
};

export default SubNavForm;
