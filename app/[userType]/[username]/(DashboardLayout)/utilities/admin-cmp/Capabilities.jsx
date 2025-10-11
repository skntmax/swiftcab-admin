'use client'
import * as React from 'react';
import { Box, Typography,Checkbox, FormControlLabel, Button } from "@mui/material";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@components/FormController";
import { contextProvider } from "@components/AppProvider";
import { useAddCapabilityMutation, useAddPermissionsToCapabilityMutation, useCapabilityHasPermissionsMutation, useCapabilityHasPermissionsQuery, useRoleHasCapsMutation, useRoleHasCapsQuery } from "@app/libs/apis/admin"; // <-- your API hook for capabilities
import { useAppSelector } from "@app/libs/store";
import {capabilitySchema ,assignPermissionsToCapSchema} from '@components/FormSchema/Capabilities/capability';

    function Capabilities() {
    // form setup
    const {
        handleSubmit,
        control,
        reset,
        register,
        formState: { errors, isValid },
        setError,
        watch,
        setValue
    } = useForm({
        defaultValues: {
        capability_name: "",
        capability_identifier: "",
        role_id: "",
        },
        resolver: yupResolver(capabilitySchema),
    });

    // API mutation
    const [addCapability, { data: addCapabilityData, isLoading: addCapabilityLoading }] =
        useAddCapabilityMutation();

        const userType = useAppSelector((state) => state.usersInfo?.userType);
    
    // capabilityIdentifier
    const capabilityIdentifier = watch("capability_identifier");
    const capability_name = watch("capability_name");

    // global context
    const { successMessage, errorMessage } = React.useContext(contextProvider);

    // roles from redux
    const rolesData = useAppSelector((state) => state.userRoles.list);
    const [rolesOptions, setRolesOptions] = React.useState([]);

    React.useEffect(() => {
        if (Array.isArray(rolesData)) {
        setRolesOptions(
            rolesData.map((role) => ({
            value: role.id,
            label: role.label,
            }))
        );
        }
    }, [rolesData]);

    const onSubmit = async (data) => {
    try {
        await addCapability(data);
    } catch (error) {
        console.error("API Error: ", error);
        setError("root", { type: "server", message: "Failed to add capability" });
    }
    };

    React.useEffect(() => {
        if (addCapabilityData?.status === 500 && addCapabilityData?.error)
        return errorMessage(addCapabilityData?.message);

        if (addCapabilityData?.status === 200 && !addCapabilityData?.error) {
        successMessage(addCapabilityData?.message);
        reset(); // clear form after success
        }
    }, [addCapabilityData]);

    React.useEffect(() => {
    if (capabilityIdentifier && !capabilityIdentifier.endsWith("-cap")) {
        setValue("capability_identifier", capabilityIdentifier.replaceAll("-cap","") +"-cap" , {
        shouldValidate: true,
        });
    }
    }, [capabilityIdentifier, setValue]);


    React.useEffect(() => {
    if (capability_name) {
        setValue("capability_identifier", capability_name.toLowerCase().split(" ").join("-")+"-cap" , {
        shouldValidate: true,
        });
    }
    }, [capability_name, setValue]);


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
            Add Capability
        </Typography>

        {/* Capability Name */}
        <FormInput
            name="capability_name"
            type="text"
            control={control}
            rest={{
            label: "Capability Name",
            error: !!errors?.capability_name,
            helperText: errors?.capability_name?.message,
            }}
        />

        {/* Capability Identifier */}
        <FormInput
            name="capability_identifier"
            type="text"
            control={control}
            rest={{
            label: "Capability Identifier",
            error: !!errors?.capability_identifier,
            helperText: errors?.capability_identifier?.message,
            }}
        />

        {/* Role Dropdown */}
        {rolesOptions.length > 0 && (
            <FormInput
            name="role_id"
            type="dropdown"
            control={control}
            options={rolesOptions}
            rest={{
                label: "Select Role",
                error: !!errors.role_id,
                helperText: errors.role_id?.message,
            }}
            />
        )}

        {/* Submit Button */}
        <FormInput
            name="submitButton"
            type="submit"
            control={control}
            isLoading={addCapabilityLoading}
            rest={{}}
        >
            Add Capability
        </FormInput>
        </Box>

        <Box
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

        <AssignPermissionsToCapability />
        
        </Box>
        </>
    }


    const AssignPermissionsToCapability =()=>{

    const {
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
        capabilityId: "",
        permissionId: [],
        },
        resolver: yupResolver(assignPermissionsToCapSchema),
    });

    const { successMessage, errorMessage } = React.useContext(contextProvider);

    const [addPermToCaps, { data: addPermToCapsData, isLoading: addPermToCapsLoading }] =
        useAddPermissionsToCapabilityMutation();

    const userType = useAppSelector((state) => state.usersInfo?.userType);
     console.log("🔑 userType in parent:", userType); // Add this

    const capabilities = useAppSelector((state) => state["capability-list"].list);
    const permissions = useAppSelector((state) => state["navbar-perm-list"].list);

    const capabilityOptions =
        Array.isArray(capabilities) &&
        capabilities.map((c) => ({
        value: c.id,
        label: c.capability_name,
        }));

    const permissionOptions =
        Array.isArray(permissions) &&
        permissions.map((p) => ({
        value: p.id,
        label: p.permission_name,
        }));

    const onSubmit = async (data) => {
        try {
        console.log("Submitting payload:", data);
        await addPermToCaps(data);
        } catch (err) {
        errorMessage("Failed to assign permissions");
        console.error(err);
        }
    };

    React.useEffect(() => {
        if (addPermToCapsData?.status === 500 && addPermToCapsData?.error)
        return errorMessage(addPermToCapsData?.message);

        if (addPermToCapsData?.status === 200 && !addPermToCapsData?.error) {
        successMessage(addPermToCapsData?.message);
        reset();

        }
    }, [addPermToCapsData, userType,  reset, successMessage, errorMessage]);

    return (
        <>
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
            <Typography variant="h6" mb={2}>
            Assign Permissions to Capability
            </Typography>

            <FormInput
            name="capabilityId"
            type="dropdown"
            control={control}
            options={capabilityOptions}
            rest={{
                label: "Select Capability",
                error: !!errors.capabilityId,
                helperText: errors.capabilityId?.message,
            }}
            />

            <FormInput
            name="permissionId"
            type="multi-select"
            control={control}
            options={permissionOptions}
            rest={{
                label: "Select Permissions",
                error: !!errors.permissionId,
                helperText: errors.permissionId?.message,
            }}
            />

            <FormInput
            name="submitButton"
            type="submit"
            control={control}
            isLoading={addPermToCapsLoading}
            rest={{}}
            >
            Add Permissions
            </FormInput>
        </Box>

      {userType ? <TreeView userType={userType} /> : <div>Waiting for userType...</div>}

        {/* <TreeView /> */}
        </>
    );

    }


const TreeView =  ({userType}) => {

  
  // Use mutation hooks instead of query hooks
  const [getRoleHasCaps, { 
    data: getRoleHasCapsData, 
    isLoading: getRoleHasCapsLoading,
    error: getRoleHasCapsError,
  }] = useRoleHasCapsMutation();

  const [getCapHasPermissions, { 
    data: capHasPermissionsData, 
    isLoading: capHasPermissionsLoading,
    error: capHasPermissionsError,
  }] = useCapabilityHasPermissionsMutation();

  const [capabilities, setCapabilities] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);

  // Trigger mutations on mount and when userType changes
  React.useEffect(() => {
    if (userType) {
      getRoleHasCaps({ userType });
      getCapHasPermissions({ userType });
    }
  }, [userType, getRoleHasCaps, getCapHasPermissions]);

  // Handle role capabilities data
  React.useEffect(() => {
    if (getRoleHasCapsData) {
      const roleCaps = getRoleHasCapsData?.data || getRoleHasCapsData;
      if (Array.isArray(roleCaps)) {
        setCapabilities(roleCaps);
      }
    }
  }, [getRoleHasCapsData]);

  // Handle permissions data
  React.useEffect(() => {
    if (capHasPermissionsData) {
      const rawPerms = capHasPermissionsData?.data || capHasPermissionsData;
      if (Array.isArray(rawPerms)) {
        const perms = rawPerms.map((perm) => ({
          permission_id: perm.permission_id,
          permission_name: perm.permission_name,
          capability_id: perm.capability_id,
        }));
        setPermissions(perms);
      }
    }
  }, [capHasPermissionsData]);

  const [checkedPermissions, setCheckedPermissions] = React.useState([]);

  React.useEffect(() => {
    if (getRoleHasCapsData) {

      const roleCaps = getRoleHasCapsData?.data || getRoleHasCapsData; // handles both shapes
      if (Array.isArray(roleCaps)) {
        setCapabilities(roleCaps);
      }
    }
  }, [getRoleHasCapsData]);

  // ✅ Log and update permissions when fetched
  React.useEffect(() => {
    if (capHasPermissionsData) {

      const rawPerms = capHasPermissionsData?.data || capHasPermissionsData;
      if (Array.isArray(rawPerms)) {
        const perms = rawPerms.map((perm) => ({
          permission_id: perm.permission_id,
          permission_name: perm.permission_name,
          capability_id: perm.capability_id,
        }));
        setPermissions(perms);
      }
    }
  }, [capHasPermissionsData]);

  React.useEffect(() => {
    if (permissions.length > 0) {
      console.log("✅ Auto-checking permissions:", permissions.length);
      setCheckedPermissions(permissions.map((p) => p.permission_id));
    }
  }, [permissions]);

  const handleToggle = (permId) => {
    setCheckedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSave = () => {
    const unchecked = permissions
      .filter((p) => !checkedPermissions.includes(p.permission_id))
      .map((p) => ({
        capability_id: p.capability_id,
        permission_id: p.permission_id,
      }));

    console.log("🚀 Unchecked permissions:", unchecked);
  };

  if (!userType) return <div>Waiting for user role...</div>;
  if (getRoleHasCapsLoading || capHasPermissionsLoading)
    return <div>Loading capabilities & permissions...</div>;

  return (
    <Box sx={{ minHeight: 352, minWidth: 400 }}>
      <SimpleTreeView
        disableSelection
        defaultExpandedItems={["root", ...capabilities.map((cap) => `cap-${cap.id}`)]}
      >
        <TreeItem
          itemId="root"
          label={`Capabilities "${userType.toUpperCase()}" role holds`}
        >
          {capabilities.map((cap) => {
            const capPermissions = permissions.filter(
              (perm) => perm.capability_id === cap.id
            );

            return (
              <TreeItem
                key={cap.id}
                itemId={`cap-${cap.id}`}
                label={`${cap.capability_name} (${cap.capability_identifier})`}
              >
                {capPermissions.length > 0 ? (
                  capPermissions.map((perm) => (
                    <TreeItem
                      key={perm.permission_id}
                      itemId={`perm-${perm.permission_id}`}
                      label={
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checkedPermissions.includes(
                                perm.permission_id
                              )}
                              onChange={() => handleToggle(perm.permission_id)}
                            />
                          }
                          label={`${perm.permission_name} (ID: ${perm.permission_id})`}
                        />
                      }
                    />
                  ))
                ) : (
                  <TreeItem
                    itemId={`cap-${cap.id}-no-perm`}
                    label="No Permissions Assigned"
                  />
                )}
              </TreeItem>
            );
          })}
        </TreeItem>
      </SimpleTreeView>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
        Save Changes
      </Button>
    </Box>
  );
};

export default Capabilities
