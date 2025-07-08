import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { FormInput } from '@components/FormController';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { yupResolver } from "@hookform/resolvers/yup";
import {driverAssignmentSchema} from "@components/FormSchema/AssingDriverSchema/driverAssign"
import { DevTool } from "@hookform/devtools";
import driversApi, { useGetBankBranchMutation, useGetBanksMutation, useGetDriverListMutation } from '@app/libs/apis/driver';
import { useAppDispatch } from '@app/libs/store';
import { useGetActiveOwnerVehiclesTypeListMutation } from '@app/libs/apis/owner';
const AssingDrivers = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      self : true,
      owner: null,
      driver: null,
      vhicle: null
    },
    resolver: yupResolver(driverAssignmentSchema),
  });

 const dispatch  = useAppDispatch()
  const [loader ,setLoader] = useState(false)
  const [bankOptions ,setBankOptions] = useState([])
  const onSubmit= (data)=>{
  }



  // api calling 


  const [ getBanks , {data:getBankData , isLoading:getBankDataLoading}] = useGetBanksMutation()
  const [ getDriverList , {data:getDriverListData , isLoading:getDriverListLoading}] = useGetDriverListMutation()
  const [activeOwnerVhicle , {data:activeOwnerVhicleData , isLoading:activeOwnerVhicleLoading } ] = useGetActiveOwnerVehiclesTypeListMutation()
  useEffect(()=>{
    if(watch("self")==true) {
        // Reset this specific endpoint's mutation state
        setValue("owner","rohnit23_nova9827",{shouldDirty:true, shouldTouch:true})

        setValue("driver","rohnit23_nova9827",{shouldDirty:true, shouldTouch:true})
    }else{
         setValue("owner","",{shouldDirty:false, shouldTouch:false})

        setValue("driver","",{shouldDirty:false, shouldTouch:false})
    }
    
  }, [watch("self")])


  useEffect(()=>{
        setValue("owner","rohnit23_nova9827",{shouldDirty:true, shouldTouch:true})
        setValue("driver","rohnit23_nova9827",{shouldDirty:true, shouldTouch:true})
  }, [])

  
  return (
    <>
    <Typography variant="h5" sx={{ mb: 3, 
    // textAlign: 'center'
     }}>
    Assing driver  
    </Typography>

    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1000, 
    // mx: 'auto'
     }}>
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

            <Grid item xs={12}>
              <Grid item xs={12} >
              <FormInput 
               name="self"
               type="checkbox" 
               control={control}
               rest={{ label: "Assing self as driver",fullWidth: true }} 
               errors={errors}
               />
              </Grid>
          </Grid>



           <Grid item xs={12}>
              <Grid item xs={12} >
              <FormInput 
               name="owner"
               type="on_demand_dropdown" 
               control={control}
               rest={{ label: "Select Owner",fullWidth: true ,disabled:watch("self")?true:false }} 
               onCustomFuntionCaller={getBanks}
               customOptionKeys={{labelKey:"name", labelValue:"value"}}
               customOptions={[{name:"rohnit23_nova9827", value:"rohnit23_nova9827"}]}
               errors={errors}
               />
              </Grid>
          </Grid>


         <Grid item xs={12}>
              <Grid item xs={12}>
              <FormInput 
               name="driver"
               type="on_demand_dropdown" 
               control={control}
               rest={{ label: "Select Driver",fullWidth: true , disabled:watch("self")?true:false }} 
               onCustomFuntionCaller={getDriverList}
               customOptionKeys={{labelKey:"driver_username", labelValue:"driver_id"}}
               customOptions={getDriverListData?.data}
               errors={errors}
               />
            </Grid>
          </Grid>

             <Grid item xs={12}>
              <Grid item xs={12}>
              <FormInput 
               name="vhicle"
               type="on_demand_dropdown" 
               control={control}
               rest={{ label: "Select Any One vhicle",fullWidth: true }} 
               onCustomFuntionCaller={activeOwnerVhicle}
               customOptionKeys={{labelKey:"vhicle_username", labelValue:"id"}}
               customOptions={activeOwnerVhicleData?.data}
               errors={errors}
               />
            </Grid>
          </Grid>



          {/* Bank Details */}
          <Grid item xs={12}>
            <Grid container >
              <Grid item xs={12} sm={12}>
              {/* <FormInput 
               name="bank_account_branch"
               isLoading={getBankBranchDataLoading}
               type="on_demand_dropdown" 
               control={control}
               rest={{ label: "Bank Account Branch",fullWidth: true }} 
               onCustomFuntionCaller={()=>getBankBranch(`bankId=${watch("bank_account")}`)}
               customOptionKeys={{labelKey:"branch_name", labelValue:"id"}}
               customOptions={getBankBranchData?.data}
               errors={errors}
               /> */}
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
              Assing driver 
            </FormInput>
          </Grid>
        </Grid>
      </form>
    </Paper>
      <DevTool control={control} />
</>
  );
};

export default AssingDrivers;
