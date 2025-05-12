'use client'
import React from 'react'
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Checkbox, ListItemIcon, MenuItem, Select, styled, Typography } from '@mui/material';
import * as  all_icons from "@tabler/icons-react";
import ApiLoader from '@components/ApiLoader';

let defaultOption = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" }
  ]

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function FormInput({
   name="name", 
   type="text",
   control, 
   register ,  
   isLoading  = false , 
   options=defaultOption,  
   rest={ startIcon: <CloudUploadIcon />  }, 
   children}) {
  
    if(type=="text")
    return (
    <Controller
        name={name}
        control={control}
        render={({ field }) =>
         <TextField  
        {...field} 
        {...rest} 
         /> }
        
      />
  )

    if(type=="button")
      return (
          <Controller
          name={name}
          control={control}
          render={({ field }) => 
          <Button 
          variant="contained"  
          type="button"
          {...rest} 
          {...field}
            >
              {children}
            </Button> }
        />
    )


    if (type === "submit") {
       // in case of loading an api 
       if(isLoading)   <Button {...rest} disabled={isLoading}  > <ApiLoader /> </Button>

        return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Button
              {...rest}
              {...field}
              variant="contained"
              type="submit" // Ensures form submission                 
            >
              {children}
            </Button>
          )}
        />
      );
    }
  

    if(type=="upload")
      return (
          <Controller
          name={name}
          control={control}
          render={({ field }) => 
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              {...rest} 
              {...field}
            >
            {children}
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => field.onChange(event.target.files)}
              multiple
            />
          </Button> 
          }
        />
    )

    if (type === "checkbox") {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox 
            {...field}
            checked={!!field.value} // Convert to boolean to prevent React warnings
              {...rest}
            />
            {rest.label && (
              <Typography variant="body2">{rest.label}</Typography>
            )}
            </Box>
          )}
        />
      );
    }

    
if (type === "dropdown") {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <TextField {...field} select fullWidth {...rest}>
              {options.map((option) => {
                const IconComponent = all_icons[option.icon]??null;
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {IconComponent && (
                      <ListItemIcon>
                        <IconComponent stroke={1.5} size="1.3rem" />
                      </ListItemIcon>
                    )}
                    {option.label}
                  </MenuItem>
                );
              })}
            </TextField>
          )}
        />
      );
}

}

export default FormInput