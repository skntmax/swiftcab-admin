"use client";
import React, { useEffect, useState } from "react";
import { Box,  Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import PostAddIcon from "@mui/icons-material/PostAdd";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import  { FormInput }  from "@components/FormController" ;
import {all_menu_icons} from './all_tabler_react_icons'
import { yupResolver } from '@hookform/resolvers/yup';
import {navMenuSchema} from '@/components/FormSchema/test/NavMenuSchema.js'
import { useAddNavbarMutation } from "@app/libs/apis/admin";
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
    resolver: yupResolver(navMenuSchema)

  });


  // api calling

  const [ addNavbar , { data:addNavbarData ,  isLoading:addNavbarLoading  }] = useAddNavbarMutation()
  
  const  [iconsObjectArray ,  setIconNames] = useState([])
  const onSubmit = (data) => {
    debugger
    console.log("Form Submitted:", data);
    if (isValid) {
      try {
        addNavbar(data);  // Adjust the payload structure as needed
        reset(); // Reset form after successful submission
      } catch (error) {
        console.error("API Error: ", error);
        setError("root", { type: "server", message: "Failed to add navbar" });
      }
    }
  };

  useEffect(() => {
    // const iconNames = Object.keys(all_icons).filter(
    //   (key) => typeof all_icons[key] !== "function"
    // );
    
    setIconNames(all_menu_icons.map(ele=>( { value: ele , label: ele , icon:  ele } )))
  }, []);

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
            error: !!errors?.nav_item,
            helperText: errors?.nav_item?.message,
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
            error : !!errors?.sub_menu,
            helperText: errors?.sub_menu?.message
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
          error : !!errors?.href,
          helperText: errors?.href?.message
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
          name="submit-button"
          type="submit"
          rest={{}}
          isLoading={addNavbarLoading}
        >
          Add Navbar
        </FormInput>
    </Box>
  );
}

export default NavItems;
