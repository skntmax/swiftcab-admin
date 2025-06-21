import React from 'react';
import { useForm } from "react-hook-form";
import { Box, Typography } from '@mui/material';
import FormInput from './FormInput'; // Adjust the import path if needed

const DriverOnboardingForm = ({ data }) => {
  const { control, handleSubmit, reset ,register, watch ,  formState: { errors , isValid } } = useForm({
    defaultValues: {
      DL: data.DL,
      RC: data.RC,
      insurance: data.insurance,
      pan_card: data.pan_card,
      adhar_card: data.adhar_card,
      is_varified: data.is_varified,
      wallet_code: data.wallet_code,
      wallet_balance: data.wallet_balance,
      is_bank_varified: data.is_bank_varified,
      created_on: data.created_on,
      updated_on: data.updated_on,
    }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      <Typography variant="h6">Driver Onboarding Documents</Typography>

      <FormInput
        name="DL"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Driving License URL", fullWidth: true }}
      />

      <FormInput
        name="RC"
        type="text"
        control={control}
        register={register}
        rest={{ label: "RC Document URL", fullWidth: true }}
      />

      <FormInput
        name="insurance"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Insurance Document URL", fullWidth: true }}
      />

      <FormInput
        name="pan_card"
        type="text"
        control={control}
        register={register}
        rest={{ label: "PAN Card URL", fullWidth: true }}
      />

      <FormInput
        name="adhar_card"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Aadhar Card URL", fullWidth: true }}
      />

      <FormInput
        name="wallet_code"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Wallet Code", fullWidth: true }}
      />

      <FormInput
        name="wallet_balance"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Wallet Balance", fullWidth: true }}
      />

      <FormInput
        name="created_on"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Created On", fullWidth: true }}
      />

      <FormInput
        name="updated_on"
        type="text"
        control={control}
        register={register}
        rest={{ label: "Updated On", fullWidth: true }}
      />

      <FormInput
        name="is_varified"
        type="checkbox"
        control={control}
        register={register}
        rest={{ label: "Is Verified" }}
      />

      <FormInput
        name="is_bank_varified"
        type="checkbox"
        control={control}
        register={register}
        rest={{ label: "Is Bank Verified" }}
      />

    </Box>
  );
};

export default DriverOnboardingForm;
