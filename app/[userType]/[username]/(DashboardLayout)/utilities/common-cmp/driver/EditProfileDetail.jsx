import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material';
import { FormInput } from '@components/FormController'; // Assuming FormInput is in the same folder
import { AttachFile } from '@node_modules/@mui/icons-material';

const EditProfileDetail = ({ defaultValues = {}, onSubmit, isLoading }) => {
  const { control, handleSubmit, register, formState: { errors } } = useForm({
    defaultValues
  });

    const handleChange = (e) => {
 
    }


  return (
   <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1000, mx: 'auto' }}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <Grid container spacing={4}>
      {/* Profile Picture */}
      <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FormInput
          name="profile_pic"
          type="upload"
          control={control}
          rest={{ label: "Upload Profile Picture" }}
        />
      </Grid>

      {/* Driver & Document Details */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormInput name="DL" type="upload" control={control}  rest={{ label: "DL", error: !!errors?.RC }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="RC" type="upload" control={control} rest={{ label: "RC Document URL", error: !!errors?.RC }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="upload" type="text" control={control} rest={{ label: "Insurance URL" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="upload" type="text" control={control} rest={{ label: "PAN Card URL" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="upload" type="text" control={control} rest={{ label: "Aadhar Card URL" }} />
          </Grid>
        </Grid>
      </Grid>

      {/* Wallet, Verification & Dates */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormInput name="wallet_code" type="text" control={control} rest={{ label: "Wallet Code" }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormInput name="wallet_balance" type="text" control={control} rest={{ label: "Wallet Balance" }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormInput name="is_bank_varified" type="checkbox" control={control} rest={{ label: "Bank Verified" }} />
            <FormInput name="is_varified" type="checkbox" control={control} rest={{ label: "Driver Verified" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="created_on" type="text" control={control} rest={{ label: "Created On" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="updated_on" type="text" control={control} rest={{ label: "Updated On" }} />
          </Grid>
        </Grid>
      </Grid>

      {/* Bank Details */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormInput name="ifsc" type="text" control={control} rest={{ label: "IFSC Code" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="bank_account_branch" type="text" control={control} rest={{ label: "Bank Branch Name" }} />
          </Grid>
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12}>
        <FormInput
          name="submit"
          type="submit"
          control={control}
          isLoading={isLoading}
          rest={{ fullWidth: true }}
        >
          Save Driver Info
        </FormInput>
      </Grid>
    </Grid>
  </form>
</Paper>

  );
};

export default EditProfileDetail;
