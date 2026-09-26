"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";
import ApiLoader from "@components/ApiLoader";
import AppIcon from "@components/AppIcon";
import DocumentPreview, { isHttpUrl } from "@components/DocumentPreview";

let defaultOption = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function FormInput({
  name = "name",
  type = "text",
  control,
  register,
  isLoading = false,
  options = defaultOption,
  rest = {},
  children,

  // for file uploads
  startIcon = <CloudUploadIcon />,
  multiple = false,
  preview = false,

  //  custom dropdown selector
  optionFunctionCaller = () => {},
  customOptions = [],
  customOptionKeys = { label: "label", value: "value" },
  onCustomFuntionCaller,
  onSearch,
  onLoadMore,
  hasMore = false,
  getOptionDisabled,
  renderOption,
  filterLocal = false,

  // for file uploads only
  errors,
}) {
  const [files, setFiles] = useState();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [open, setOpen] = useState(false);
  const [pickedOption, setPickedOption] = useState(null);
  const loadMoreLockRef = useRef(false);
  const { label: restLabel, fullWidth, sx: restSx, ...buttonRest } = rest || {};

  const uploadButtonSx = {
    bgcolor: "#0F172A",
    color: "#FFFFFF",
    "&:hover": { bgcolor: "#1E293B" },
    "&.Mui-disabled": { color: "#64748B", bgcolor: "#E2E8F0" },
    "& .MuiButton-startIcon, & .MuiTypography-root": { color: "inherit" },
    ...(restSx || {}),
  };

  useEffect(() => {
    // Generate preview URLs
    if (files && files.length > 0) {
      const urls = Array.from(files).map((file) =>
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      );
      setPreviewUrls(urls);

      return () => {
        // Revoke all preview URLs to avoid memory leaks
        urls.forEach((url) => url && URL.revokeObjectURL(url));
      };
    }
  }, [files]);

  if (type == "text")
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => <TextField {...field} {...rest} />}
      />
    );

  if (type == "button")
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Button
            type="button"
            fullWidth={fullWidth}
            {...buttonRest}
            {...field}
            variant="contained"
            color="primary"
            sx={uploadButtonSx}
          >
            {children}
          </Button>
        )}
      />
    );

  if (type === "submit") {
    return (
      <Button
        type="submit"
        disabled={isLoading}
        fullWidth={fullWidth}
        {...buttonRest}
        variant="contained"
        color="primary"
        sx={uploadButtonSx}
      >
        {isLoading ? <ApiLoader /> : children}
      </Button>
    );
  }

  if (type == "upload")
    return (
      <>
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              const storedUrl = isHttpUrl(field.value) ? field.value : null;
              return (
              <>
                <Button
                  component="label"
                  role={undefined}
                  tabIndex={-1}
                  fullWidth={fullWidth}
                  startIcon={startIcon}
                  {...buttonRest}
                  variant="contained"
                  color="primary"
                  sx={uploadButtonSx}
                >
                  {children}
                  {restLabel && (
                    <Typography variant="body2" sx={{ color: "inherit", ml: children ? 0.5 : 0 }}>
                      {restLabel}
                    </Typography>
                  )}
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    onChange={(event) => {
                      setFiles(event.target.files);
                      field.onChange(event.target.files);
                    }}
                    multiple={multiple}
                  />
                </Button>

                {errors?.[name] && (
                  <Typography variant="caption" color="error">
                    {errors?.[name]?.message}
                  </Typography>
                )}

                {storedUrl && (
                  <Box mt={1} width="100%">
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Stored file
                    </Typography>
                    {preview !== false && <DocumentPreview url={storedUrl} alt={restLabel || name} />}
                  </Box>
                )}

                {!storedUrl && (
                  <Box mt={1}>
                    {files &&
                      Array.from(files).map((file, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          {isLoading && <CircularProgress size={15} />}
                          {!isLoading && file.name && (
                            <Typography variant="body2">{file.name}</Typography>
                          )}
                        </Box>
                      ))}
                  </Box>
                )}

                {preview && !storedUrl && previewUrls.length > 0 && (
                  <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                    {previewUrls.map(
                      (url, index) =>
                        url && (
                          <Box
                            key={index}
                            component="img"
                            src={url}
                            alt={`preview-${index}`}
                            sx={{
                              width: 220,
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        )
                    )}
                  </Box>
                )}
              </>
              );
            }}
          />
        </Box>
      </>
    );

  if (type === "checkbox") {
    const { label, fullWidth, ...checkboxRest } = rest || {};
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Box sx={{ display: "flex", alignItems: "center", width: fullWidth ? "100%" : "auto" }}>
            <Checkbox
              {...field}
              checked={!!field.value}
              sx={{ pl: 0 }}
              {...checkboxRest}
            />
            {label && (
              <Typography variant="body2">{label}</Typography>
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
              return (
                <MenuItem key={option.value} value={option.value}>
                  {option.icon && options.length <= 40 && (
                    <ListItemIcon>
                      <AppIcon name={option.icon} stroke={1.5} size="1.3rem" />
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

  if (type === "searchable_dropdown") {
    const labelKey = customOptionKeys.labelKey || customOptionKeys.label || "label";
    const valueKey = customOptionKeys.labelValue || customOptionKeys.value || "value";
    const mergedOptions = pickedOption && !customOptions.some((opt) => String(opt?.[valueKey]) === String(pickedOption?.[valueKey]))
      ? [pickedOption, ...customOptions]
      : customOptions;

    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selected = mergedOptions.find((opt) => String(opt?.[valueKey]) === String(field.value)) || null;
          return (
            <Autocomplete
              options={mergedOptions}
              loading={isLoading}
              disabled={Boolean(rest?.disabled)}
              value={selected}
              onChange={(_event, option) => {
                field.onChange(option ? option[valueKey] : null);
                setPickedOption(option);
              }}
              onOpen={() => {
                setOpen(true);
                onCustomFuntionCaller?.();
              }}
              onClose={() => setOpen(false)}
              open={open}
              filterOptions={filterLocal ? undefined : (opts) => opts}
              getOptionLabel={(option) => String(option?.[labelKey] ?? "")}
              isOptionEqualToValue={(a, b) => String(a?.[valueKey]) === String(b?.[valueKey])}
              getOptionDisabled={getOptionDisabled}
              onInputChange={(_event, value, reason) => {
                if (reason === "input") {
                  onSearch?.(value);
                }
              }}
              ListboxProps={{
                style: { maxHeight: 320, overflow: "auto" },
                onScroll: (event) => {
                  if (!hasMore || isLoading || loadMoreLockRef.current) return;
                  const list = event.currentTarget;
                  if (list.scrollTop + list.clientHeight >= list.scrollHeight - 48) {
                    loadMoreLockRef.current = true;
                    onLoadMore?.();
                    window.setTimeout(() => {
                      loadMoreLockRef.current = false;
                    }, 400);
                  }
                },
              }}
              renderOption={(props, option) => (
                <li {...props} key={String(option?.[valueKey])}>
                  {renderOption ? renderOption(option) : option?.[labelKey]}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={rest?.label || "Select an option"}
                  error={Boolean(errors?.[name])}
                  helperText={errors?.[name]?.message}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          );
        }}
      />
    );
  }

  if (type === "on_demand_dropdown") {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Box flex={1}>
          {isLoading ? (
            <Select fullWidth open={true} disabled displayEmpty value="">
              <MenuItem value="">
                <ApiLoader />
              </MenuItem>
            </Select>
          ) : (
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id={`${name}-label`}>
                    {rest?.label || "Select an option"}
                  </InputLabel>
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
if (type === "multi-select") {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const allValues = options.map((opt) => opt.value);
        const isAllSelected = field.value?.length === allValues.length;

        const handleToggleAll = () => {
          if (isAllSelected) {
            field.onChange([]); // unselect all
          } else {
            field.onChange(allValues); // select all
          }
        };

        return (
          <FormControl fullWidth>
            <InputLabel id={`${name}-label`}>
              {rest?.label || "Select Options"}
            </InputLabel>
            <Select
              {...field}
              labelId={`${name}-label`}
              multiple
              renderValue={(selected) =>
                options
                  .filter((opt) => selected.includes(opt.value))
                  .map((opt) => opt.label)
                  .join(", ")
              }
              {...rest}
            >
              {/* Select All Option */}
              <MenuItem onClick={handleToggleAll}>
                <Checkbox checked={isAllSelected} />
                <ListItemText primary="Select All" />
              </MenuItem>

              {/* Divider */}
              <Divider />

              {/* Normal Options */}
              {options.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox
                      checked={field.value?.includes(option.value) || false}
                    />
                    {option.icon && options.length <= 40 && (
                      <ListItemIcon>
                        <AppIcon name={option.icon} stroke={1.5} size="1.3rem" />
                      </ListItemIcon>
                    )}
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>

            {/* Validation error */}
            {rest.error && (
              <Typography variant="caption" color="error">
                {rest.helperText}
              </Typography>
            )}
          </FormControl>
        );
      }}
    />
  );
}

}

export default FormInput;
