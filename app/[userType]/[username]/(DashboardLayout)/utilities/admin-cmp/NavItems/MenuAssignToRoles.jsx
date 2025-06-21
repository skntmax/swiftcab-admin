'use client';
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormInput } from '@components/FormController';
import { Box, Grid, Typography, Button } from '@mui/material';
import { useAddMenuToRolesMutation, useAddSubnavBarMutation, useGetNavbarListMutation } from '@app/libs/apis/admin';
import { all_menu_icons } from '../all_tabler_react_icons';
import { assigningRoleMenuSchema } from "@components/FormSchema/test/NavMenuSchema";
import { contextProvider } from "@components/AppProvider";
import { useAppSelector } from "@app/libs/store";

function MenuAssignToRoles() {

const { control, handleSubmit, reset ,register, watch ,  formState: { errors , isValid } } = useForm({
    defaultValues: {
      role: '',
      nav_menu:'',
     },
    resolver: yupResolver(assigningRoleMenuSchema),
  });

  const roleList =  useAppSelector(ele=> ele.userRoles.list).map(_=> ({ label:_.name , value: _.id }))
  const [navMenuItems, setNavMenuItems] = useState([]);

  // api calling 
  const [ getNavbar ,  { data: getNavbarData , isLoading:getNavbarDataLoading  } ]  = useGetNavbarListMutation();
  const [ addMenuToRoles ,  { data: addMenuToRolesData , isLoading:addMenuToRolesLoading  } ]  = useAddMenuToRolesMutation();

  // context
  const { successMessage, errorMessage } = useContext(contextProvider);

    useEffect(() => {
      if (getNavbarData?.status === 200 && !getNavbarData?.error) {
        setNavMenuItems(
          getNavbarData?.data?.map((ele) => ({ value: ele.id, label: `${ele.nav_item}` }))
        );
      }
    }, [getNavbarData]);

  useEffect(()=>{
     getNavbar()
  },[])
   


// api response status 
  // when api is called 
  useEffect(()=>{
    if(addMenuToRolesData?.status==500 && addMenuToRolesData?.error) return errorMessage(addMenuToRolesData?.message)
    if(addMenuToRolesData?.status==200 && !addMenuToRolesData?.error ) {
        successMessage(addMenuToRolesData?.message) 
        // reset(); // reset all the states 
      }
    }
  ,[addMenuToRolesData?.data])



  const onSubmit = (data) => {
    if(isValid) {
      let payload = {
         "roles":data.role, // may accept array pf roles as well [23,20,10,2] 
          "nav_menu_id":data.nav_menu
       }
      addMenuToRoles(payload) 
    }
  };




  
    
    return (
     <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
           display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            margin: "0 auto",
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
            Assing  Menu to  roles
          </Typography>
    
    
         {/* Role Id */}
              <FormInput
                name="role"
                type="dropdown"
                control={control}
                register={register}
                options={roleList || []}
                rest={{
                  label: "Role",
                  error: !!errors.role,
                  helperText: errors.role?.message,
                  placeholder: "Please Select Role First ",
                }}
              />
    
            {/* Nav Item */}
              <FormInput
                name="nav_menu"
                type="dropdown"
                control={control}
                register={register}
                options={navMenuItems || []}
                rest={{
                  label: "Select Menu",
                  error: !!errors?.nav_menu,
                  helperText: errors?.nav_menu?.message,
                  placeholder: "Enter Menu First",
                }}
              />
    
            {/* Submit Button */}
                  <FormInput
                    name="submitButton"
                    type="submit"
                    control={control}
                    isLoading={addMenuToRolesLoading}
                    rest={{}}
                  >
                    Assign Menu to Roles
                  </FormInput>
        </Box>
  )
}

export default MenuAssignToRoles