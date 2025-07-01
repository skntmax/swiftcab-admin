import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { FormInput } from '@components/FormController';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { yupResolver } from "@hookform/resolvers/yup";
import {driverProfileSchema} from "@components/FormSchema/DriverDetails/DriverDetail.js"
import { DevTool } from "@hookform/devtools";
import driversApi, { useGetBankBranchMutation, useGetBanksMutation } from '@app/libs/apis/driver';
import { useAppDispatch } from '@app/libs/store';
const EditProfileDetail = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      profile_pic: null,
      DL: null,
      RC: null,
      insurance: null,
      pan_card: null,
      adhar_card: null,
      bank_account: "",
      ifsc: '',
      bank_account_branch: ''
    },
    resolver: yupResolver(driverProfileSchema),
  });

 const dispatch  = useAppDispatch()
  const [loader ,setLoader] = useState(false)
  const [bankOptions ,setBankOptions] = useState([])
  const onSubmit= (data)=>{
console.log(data)     
  }



  // api calling 


  const [ getBanks , {data:getBankData , isLoading:getBankDataLoading}] = useGetBanksMutation()
  const [ getBankBranch , {data:getBankBranchData , isLoading:getBankBranchDataLoading}] = useGetBankBranchMutation()


  useEffect(()=>{
    if(watch("bank_account")) {
        // Reset this specific endpoint's mutation state
        driversApi.util.resetApiState() 
        setValue("bank_account_branch",{
            defaultValues:""
        })
    }
    
  }, [watch("bank_account")])
  return (
    <>
    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
    Update Driver Detail
    </Typography>

    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1000, mx: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>

        {/* Profile Preview */}
        {watch("profile_pic")?.[0] && (
            <Box
            component="img"
            src={URL.createObjectURL(watch("profile_pic")[0])}
            alt="Profile Preview"
            sx={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "2px solid #ccc" }}
            />
        )}

          {/* Profile Picture */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FormInput
              name="profile_pic"
              type="upload"
              control={control}
              startIcon={<AccountCircleIcon />}
              rest={{ label: "Upload Profile Picture" }}
              errors={errors}
            />
          </Grid>

          {/* Document Fields */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormInput name="DL" errors={errors} type="upload" preview={true} startIcon={<PictureAsPdfIcon />} control={control} multiple={true} rest={{ label: "DL", error: !!errors?.DL , helperText: errors?.DL?.message }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput name="RC"  errors={errors} type="upload" preview={true} startIcon={<PictureAsPdfIcon />} control={control} rest={{ label: "RC Document URL", error: !!errors?.RC }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput name="insurance"  errors={errors} type="upload" preview={true} startIcon={<PictureAsPdfIcon />} control={control} rest={{ label: "Insurance URL" }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput name="pan_card"  errors={errors} type="upload" preview={true} startIcon={<PictureAsPdfIcon />} control={control} rest={{ label: "PAN Card URL" }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput name="adhar_card"  errors={errors} type="upload" preview={true} startIcon={<PictureAsPdfIcon />} control={control} rest={{ label: "Aadhar Card URL" }} />
              </Grid>
            </Grid>
          </Grid>

          {/* Wallet, Verification & Dates */}
          {/* <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <FormInput name="wallet_code" type="text" control={control} rest={{ label: "Wallet Code",  fullWidth: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput name="wallet_balance" type="text" control={control} rest={{ label: "Wallet Balance", fullWidth: true }} />
              </Grid>
            </Grid>
          </Grid> */}

           <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
              <FormInput 
               name="bank_account"
               isLoading={getBankDataLoading}
               type="on_demand_dropdown" 
               control={control}
               rest={{ label: "Bank Account",fullWidth: true }} 
               onCustomFuntionCaller={getBanks}
               customOptionKeys={{labelKey:"bank_name", labelValue:"id"}}
               customOptions={getBankData?.data}
               errors={errors}
               />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput name="ifsc" type="text" control={control} rest={{ label: "IFSC Code",fullWidth: true ,helperText: errors?.ifsc?.message }} />
              </Grid>
            </Grid>
          </Grid>


          {/* Bank Details */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
              <FormInput 
               name="bank_account_branch"
               isLoading={getBankBranchDataLoading}
               type="on_demand_dropdown" 
               control={control}
               rest={{ label: "Bank Account Branch",fullWidth: true }} 
               onCustomFuntionCaller={()=>getBankBranch(`bankId=${watch("bank_account")}`)}
               customOptionKeys={{labelKey:"branch_name", labelValue:"id"}}
               customOptions={getBankBranchData?.data}
               errors={errors}
               />
              </Grid>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <FormInput
              name="submit"
              type="submit"
              control={control}
              rest={{ fullWidth: true }}
            >
              Save Driver Info
            </FormInput>
          </Grid>
        </Grid>
      </form>
    </Paper>
      <DevTool control={control} />
</>
  );
};

export default EditProfileDetail;
