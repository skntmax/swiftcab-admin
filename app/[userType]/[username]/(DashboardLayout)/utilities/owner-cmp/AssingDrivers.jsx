import React, { useContext, useEffect, useState } from 'react';
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
import { useAssignDriverToVhicleMutation, useGetActiveOwnerVehiclesTypeListMutation } from '@app/libs/apis/owner';
import { contextProvider } from '@components/AppProvider';
import { getUserInfo } from '@utils';
const AssingDrivers = () => {
  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors,  },
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
 let users = getUserInfo()
  const [loader ,setLoader] = useState(false)
  const [userOptions ,setUserOptions] = useState([])
   // root states
      const { successMessage, errorMessage } = useContext(contextProvider);

      

  // api calling 

  const [ getBanks , {data:getBankData , isLoading:getBankDataLoading}] = useGetBanksMutation()
  const [ getDriverList , {data:getDriverListData , isLoading:getDriverListLoading}] = useGetDriverListMutation()
  const [activeOwnerVhicle , {data:activeOwnerVhicleData , isLoading:activeOwnerVhicleLoading } ] = useGetActiveOwnerVehiclesTypeListMutation()
  const [assingDriverToVhicle ,{data:assingDriverToVhicleData , isLoading:assingDriverToVhicleLoading }] = useAssignDriverToVhicleMutation()
  

  const onSubmit= async  (data)=>{
        let payload = {
          "owner":data?.owner,
          "driver":data?.self==true?data?.owner:Number(data?.driver) ,
          "vhicle_assigned":data?.vhicle,
           self: data?.self
        }
        assingDriverToVhicle(payload)
  }



  const setUser = ()=>{
    setUserOptions([{name:users.username, value:users.username}])
  }
  

  
  useEffect(()=>{
    if(watch("self")==true) {
        // Reset this specific endpoint's mutation state
        setValue("owner",users?.username,{shouldDirty:true, shouldTouch:true})

        setValue("driver",users?.username,{shouldDirty:true, shouldTouch:true})
    }else{
         setValue("owner","",{shouldDirty:false, shouldTouch:false})

        setValue("driver","",{shouldDirty:false, shouldTouch:false})
    }
    
  }, [watch("self")])


  useEffect(()=>{
        setValue("owner",users?.username,{shouldDirty:true, shouldTouch:true})
        setValue("driver",users?.username,{shouldDirty:true, shouldTouch:true})
  }, [])


   // when api is called 
    useEffect(()=>{
      if(assingDriverToVhicleData?.status==500 && assingDriverToVhicleData?.error) return errorMessage(assingDriverToVhicleData?.message)
      if(assingDriverToVhicleData?.status==200 && !assingDriverToVhicleData?.error ) {
         successMessage(assingDriverToVhicleData?.message) 
         reset(); // reset all the states 
        }
       // 🚀 Reset the fetched vehicle list after successful assignment
       (async function(){ await activeOwnerVhicle().unwrap()})() 
      }
      
    ,[assingDriverToVhicleData?.data])

  
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
               onCustomFuntionCaller={setUser}
               customOptionKeys={{labelKey:"name", labelValue:"value"}}
               customOptions={userOptions}
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
              rest={{ fullWidth: true,disabled:assingDriverToVhicleLoading  }}
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
