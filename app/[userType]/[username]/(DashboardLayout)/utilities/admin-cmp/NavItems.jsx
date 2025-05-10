"use client";

import React, { useEffect, useState } from "react";
import { Box, TextField, Checkbox, FormControlLabel, Button, Typography, MenuItem } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import PostAddIcon from "@mui/icons-material/PostAdd";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import  { FormInput }  from "@components/FormController" ;
import {all_menu_icons} from './all_tabler_react_icons'
let icons = 
 [
  { value: "PostAdd", label: "Post Add", icon: <PostAddIcon /> },
  { value: "Home", label: "Home", icon: <HomeIcon /> },
  { value: "Info", label: "Info", icon: <InfoIcon /> },
  { value: "ContactMail", label: "Contact Mail", icon: <ContactMailIcon /> },
];

function NavItems() {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    register,
    formState: { errors, isValid },
    setError
  } = useForm({
    defaultValues: {
      nav_item: "",
      sub_menu: true,
      href: "",
      icon: "",
      ['save-navbar']:false 
    },
  });

  const  [iconsObjectArray ,  setIconNames] = useState([])


  const onSubmit = (data) => {
    console.log("Form Data: ", data);
    setError('root')
    // reset(); // Reset form after submission
  };


  useEffect(() => {
    // const iconNames = Object.keys(all_icons).filter(
    //   (key) => typeof all_icons[key] !== "function"
    // );
    
    setIconNames(all_menu_icons.map(ele=>( { value: ele , label: ele , icon:  ele } )))
  }, []);


  useEffect(()=>{
    console.log(errors)
     
  },[watch('nav_item')])
   
   return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        margin: "0 auto",
        p: 3,
        boxShadow: 2,
        borderRadius: 2,
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography variant="h6" mb={2}>
        Add Navigation Item
      </Typography>

      {/* Navigation Item */}
      <FormInput
          name="nav_item"
          type="text"
          control={control}
          rest={{
            label: "Navigation Item",
            error: errors?.nav_item==""?true:false,
            helperText: errors?.nav_item==""? "please enter navbar" : "",
          }}
        />
            

      {/* Sub Menu */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FormInput
          name="sub_menu"
          type="checkbox"
          control={control}
          register={register}
          rest={{
            label: "Have Sub menu?",
          }}
        />
      </Box>

      {/* Href */}
      <FormInput
        name="href"
        type="text"
        control={control}
        register={register}
        rest={{
          label:"href",
          error: !!errors?.sub_menu,  // This will give a boolean value for error
        }}
      />


      {/* Icon Select */}
      {Array.isArray(iconsObjectArray) && iconsObjectArray.length>0 &&  <FormInput
        name="icon"
        type="dropdown"
        control={control}
        options={iconsObjectArray || [] }
        register={register}
        rest={{
          label: "Add Menu Icon",
          error: !!errors.icon,
          helperText: errors.icon?.message,
        }}
      />
  } 

      <FormInput
        name="save-navbar"
        type="button"
        control={control}
        options={icons}
        register={register}
        rest={{}}
      >
        Add  Navbar
      </FormInput>
    </Box>
  );
}

export default NavItems;
