import React, { useContext, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@components/FormController";
import { all_menu_icons } from "../all_tabler_react_icons";
import { navMenuSchema } from "@/components/FormSchema/test/NavMenuSchema.js";
import { useAddNavbarMutation } from "@app/libs/apis/admin";
import { contextProvider } from "@components/AppProvider";
// import FlowNavigation from './FlowNavigation'

function NavItems() {
  const {
    handleSubmit,
    control,
    reset,
    watch,
    register,
    formState: { errors, isValid },
    setError,
  } = useForm({
    defaultValues: {
      nav_item: "",
      sub_menu: true,
      href: "",
      icon: "",
      
    },
    resolver: yupResolver(navMenuSchema),
  });

  // API call
  const [addNavbar, {data:addNavbarData,  isLoading: addNavbarLoading }] = useAddNavbarMutation();

  // root states
    const { successMessage, errorMessage } = useContext(contextProvider);
  const [iconsObjectArray, setIconNames] = useState([]);

  const onSubmit = async (data) => {
    if (isValid) {
      try {
        await addNavbar(data);
      } catch (error) {
        console.error("API Error: ", error);
        setError("root", { type: "server", message: "Failed to add navbar" });
      }
    }
  };


  useEffect(() => {
    setIconNames(
      all_menu_icons.map((ele) => ({
        value: ele,
        label: ele,
        icon: ele,
      }))
    );
  }, []);


  // when api is called 
  useEffect(()=>{
    if(addNavbarData?.status==500 && addNavbarData?.error) return errorMessage(addNavbarData?.message)
    if(addNavbarData?.status==200 && !addNavbarData?.error ) {
       successMessage(addNavbarData?.message) 
       reset(); // reset all the states 
      }
    }
  ,[addNavbarData?.data])

   return <>

    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        margin: "0 auto",
        p: 2,
        boxShadow: 2,
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
      <FormInput
        name="sub_menu"
        type="checkbox"
        control={control}
        register={register}
        rest={{
          label: "Have Sub menu?",
          error: !!errors?.sub_menu,
          helperText: errors?.sub_menu?.message,
        }}
      />

      {/* Href */}
      <FormInput
        name="href"
        type="text"
        control={control}
        rest={{
          label: "Href",
          error: !!errors?.href,
          helperText: errors?.href?.message,
        }}
      />

      {/* Icon Select */}
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
        isLoading={addNavbarLoading}
        rest={{}}
      >
        Add Navbar
      </FormInput>
    </Box>
    
    {/* <FlowNavigation
    navItems={[
        {
            "id": 1,
            "nav_item": "Vhicles",
            "sub_menu": true,
            "href": null,
            "icon": null,
            "created_on": "2025-05-13T00:49:22.706Z",
            "updated_on": "2025-05-13T00:49:22.706Z"
        },
        {
            "id": 2,
            "nav_item": "Rides",
            "sub_menu": true,
            "href": null,
            "icon": null,
            "created_on": "2025-05-13T00:49:22.706Z",
            "updated_on": "2025-05-13T00:49:22.706Z"
        },
        {
            "id": 3,
            "nav_item": "Master",
            "sub_menu": true,
            "href": null,
            "icon": null,
            "created_on": "2025-05-13T00:49:22.706Z",
            "updated_on": "2025-05-13T00:49:22.706Z"
        },
        {
            "id": 4,
            "nav_item": "Settlements",
            "sub_menu": true,
            "href": null,
            "icon": null,
            "created_on": "2025-05-13T00:49:22.706Z",
            "updated_on": "2025-05-13T00:49:22.706Z"
        },
        {
            "id": 5,
            "nav_item": "Customers",
            "sub_menu": true,
            "href": null,
            "icon": null,
            "created_on": "2025-05-13T00:49:22.706Z",
            "updated_on": "2025-05-13T00:49:22.706Z"
        },
        {
            "id": 6,
            "nav_item": "Users",
            "sub_menu": true,
            "href": null,
            "icon": null,
            "created_on": "2025-05-13T00:49:22.706Z",
            "updated_on": "2025-05-13T00:49:22.706Z"
        }] }
      /> */}
     </>
}

export default NavItems;
