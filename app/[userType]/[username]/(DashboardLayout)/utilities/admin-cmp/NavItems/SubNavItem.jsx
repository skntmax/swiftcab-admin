'use client';
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormInput } from '@components/FormController';
import { Box, Grid, Typography, Button } from '@mui/material';
import { useAddSubnavBarMutation, useGetNavbarListMutation } from '@app/libs/apis/admin';
import { all_menu_icons } from '../all_tabler_react_icons';
import { subNavbmenuSchema } from "@components/FormSchema/test/NavMenuSchema";
import { contextProvider } from "@components/AppProvider";

const SubNavForm = () => {
  const { control, handleSubmit, reset ,register, watch ,  formState: { errors , isValid } } = useForm({
    defaultValues: {
      sub_nav_item: '',
      sub_menu: false,
      href: '',
      icon: '',
      nav_item_id: '',
      extra_paths: ""
    },
    resolver: yupResolver(subNavbmenuSchema),
  });

  const [navListItems, setNavListItem] = useState([]);
  const [iconsObjectArray, setIconNames] = useState([]);

  // api calling 
  const [ getNavbar ,  { data: getNavbarData , isLoading:getNavbarDataLoading  } ]  = useGetNavbarListMutation();
  const [ addSubnavbar ,  { data: addSubnavbarData , isLoading:addSubnavbarDataLoading  } ]  = useAddSubnavBarMutation();

  // context
  const { successMessage, errorMessage } = useContext(contextProvider);


  const onSubmit = (data) => {
    if(isValid) {
      addSubnavbar(data) 
    }
       
  };



  //  navbar data 
  useEffect(()=>{
    getNavbar()   
  },[]) 
  
  useEffect(() => {
    if (getNavbarData?.status === 200 && !getNavbarData?.error) {
      setNavListItem(
        getNavbarData?.data?.map((ele) => ({ value: ele.id, label: `${ele.id}-${ele.nav_item}` }))
      );
    }
  }, [getNavbarData]);


  // icons 
  useEffect(() => {
    setIconNames(
      all_menu_icons.map((ele) => ({
        value: ele,
        label: ele,
        icon: ele,
      }))
    );
  }, []);

  // api response status 
   // when api is called 
    useEffect(()=>{
      if(addSubnavbarData?.status==500 && addSubnavbarData?.error) return errorMessage(addSubnavbarData?.message)
      if(addSubnavbarData?.status==200 && !addSubnavbarData?.error ) {
         successMessage(addSubnavbarData?.message) 
         reset(); // reset all the states 
        }
      }
    ,[addSubnavbarData?.data])
  

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
        Sub Navigation Form
      </Typography>


     {/* Nav Item ID */}
          <FormInput
            name="nav_item_id"
            type="dropdown"
            control={control}
            register={register}
            options={navListItems}
            rest={{
              label: "Nav Item",
              error: !!errors.nav_item_id,
              helperText: errors.nav_item_id?.message,
              placeholder: "Enter Navigation first",
            }}
          />

        {/* Sub Nav Item */}
          <FormInput
            name="sub_nav_item"
            type="text"
            control={control}
            register={register}
            rest={{
              label: "Sub Menu Item",
              error: !!errors?.sub_nav_item,
              helperText: errors?.sub_nav_item?.message,
              placeholder: "Enter Sub Menu Item",
            }}
          />


        {/* Has Submenu */}
          <FormInput
            name="sub_menu"
            type="checkbox"
            control={control}
            register={register}
            rest={{
              label: "Has Submenu?",
              error: !!errors?.sub_menu,
              helperText: errors?.sub_menu?.message,
            }}
          />

        {/* Href */}
          <FormInput
            name="href"
            type="text"
            control={control}
            register={register}
            rest={{
              label: "Href",
              error: !!errors?.href,
              helperText: errors?.href?.message,
              placeholder: "Enter URL (e.g., /home/about)",
            }}
          />

           {/* Href */}
          <FormInput
            name="extra_paths"
            type="text"
            control={control}
            register={register}
            rest={{
              label: "Extra Paths",
              error: !!errors?.extra_paths,
              helperText: errors?.extra_paths?.message,
              placeholder: ["/permission-management/create...",],
            }}
          />

        {/* Icon */}
          {Array.isArray(iconsObjectArray) && iconsObjectArray.length > 0 && (
            <FormInput
              name="icon"
              type="dropdown"
              control={control}
              options={iconsObjectArray}
              rest={{
                label: "Add Menu Icon",
                error: !!errors.icon,
                helperText: errors.icon?.message,
              }}
            />
          )}

        {/* Submit Button */}
              <FormInput
                name="submitButton"
                type="submit"
                control={control}
                isLoading={addSubnavbarDataLoading}
                rest={{}}
              >
                Add Subnav
              </FormInput>
    </Box>
  );
};

export default SubNavForm;
