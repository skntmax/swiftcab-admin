'use client'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Checkbox, CircularProgress, FormControl, InputLabel, ListItemIcon, MenuItem, Select, styled, Typography } from '@mui/material';
import * as  all_icons from "@tabler/icons-react";
import ApiLoader from '@components/ApiLoader';
import Image from '@node_modules/next/image';

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
   rest={}, 
   children,
   
   // for file uploads  
   startIcon=<CloudUploadIcon />,
   multiple=false,
   preview=false,


   //  custom dropdown selector 
   optionFunctionCaller=()=>{},
   customOptions=[],
   customOptionKeys={label:"label",value:"value"},
   onCustomFuntionCaller,

   // for file uploads only 
   errors

  }) {

    const [files, setFiles] = useState()
    const [previewUrls, setPreviewUrls] = useState([])
   const [open, setOpen] = useState(false);

      useEffect(() => {
    // Generate preview URLs
    if (files && files.length > 0) {
      const urls = Array.from(files).map((file) =>
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      )
      setPreviewUrls(urls)

      return () => {
        // Revoke all preview URLs to avoid memory leaks
        urls.forEach((url) => url && URL.revokeObjectURL(url))
      }
    }
  }, [files])

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

        return <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            {...rest}
          >
            {children}
          </Button>
    }
  

      if(type=="upload")
        return <>
        <Box display="flex" flexDirection="column" alignItems="flex-start">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              {...rest}
              startIcon={startIcon}
            >
              {children}
              {rest.label && (
                <Typography variant="body2">{rest.label}</Typography>
              )}
              <VisuallyHiddenInput
                type="file"
                onChange={(event) => {
                  setFiles(event.target.files);
                  field.onChange(event.target.files); // Update RHF state
                  // setValue(name, event.target.files); 
                }}
                multiple={multiple}
              />
            </Button>

                {/* Validation Error */}
                {errors?.[name] && (
                  <Typography variant="caption" color="error">
                    {errors?.[name]?.message}
                  </Typography>
                )}
                </>
              )}
           />

            {/* File Name List */}
           <Box mt={1}>
            {files &&
              Array.from(files).map((file, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={1} // spacing between spinner and text
                  mb={0.5} // optional spacing between each row
                >
                  {isLoading && <CircularProgress size={15} />}
                  {!isLoading && file.name  && <Typography variant="body2">{file.name}</Typography>} 
                </Box>
              ))}
          </Box>

          {/* Image Preview */}
          {preview && (
            <Box mt={2} display="flex" gap={2} flexWrap="wrap">
              {previewUrls.map(
                (url, index) =>
                  url && (
                    <Image
                      key={index}
                      src={url}
                      width={400}
                      height={100}
                      alt={`preview-${index}`}
                    />
                  )
              )}
            </Box>
    )}

  </Box>
    </>

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

  if (type === "on_demand_dropdown") {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box flex={1}>
        {isLoading ? (
          <Select fullWidth open={true} disabled displayEmpty value="" >
            <MenuItem value="">
              <ApiLoader  />
            </MenuItem>
          </Select>
        ) : (
          <Controller
            name={name}
            control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                <InputLabel id={`${name}-label`}>{rest?.label || "Select an option"}</InputLabel>
                <Select
                  {...field}
                  labelId={`${name}-label`}
                  label={rest?.label || "Select an option"}
                  open={open}
                  onOpen={() => {
                    setOpen(true);
                    if (!customOptions.length) {
                      onCustomFuntionCaller?.(); // fetch API
                    }
                  }}
                  onClose={() => setOpen(false)}
                  {...rest}
                >
                  {customOptions.map((option, index) => (
                    <MenuItem
                      key={option[customOptionKeys["labelValue"]] || index}
                      value={option[customOptionKeys["labelValue"]]}
                    >
                      {option[customOptionKeys["labelKey"]]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        )}
      </Box>
    </Box>
  );
}

}

export default FormInput