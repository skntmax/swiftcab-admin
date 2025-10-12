'use client'
import * as React from 'react';
import { Box, Typography,Checkbox, FormControlLabel, Button, TextField, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, IconButton, DialogContent, List, DialogActions, Chip, Alert, AlertTitle } from "@mui/material";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@components/FormController";
import { contextProvider } from "@components/AppProvider";
import { useAddCapabilityMutation, useAddPermissionsToCapabilityMutation, useCapabilityHasPermissionsMutation, useCapabilityHasPermissionsQuery, usePermByCapabilityMutation, useRoleHasCapsMutation, useRoleHasCapsQuery } from "@app/libs/apis/admin"; // <-- your API hook for capabilities
import { useAppSelector } from "@app/libs/store";
import {capabilitySchema ,assignPermissionsToCapSchema} from '@components/FormSchema/Capabilities/capability';
import SearchIcon from "@mui/icons-material/Search"
import SaveIcon from "@mui/icons-material/Save"
import RestoreIcon from "@mui/icons-material/Restore"
import ClearIcon from "@mui/icons-material/Clear"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import DownloadIcon from "@mui/icons-material/Download"
import CloseIcon from "@mui/icons-material/Close"
import CircularProgress from '@mui/material/CircularProgress';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ListItemText  from '@mui/material/ListItemText';
import WarningIcon from '@mui/icons-material/Warning';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

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
        watch
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

    const [getPermByCapId, { data: getPermByCapIdData, isLoading: getPermByCapIdLoading }] = usePermByCapabilityMutation()

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
        // reset();
        }
    }, [addPermToCapsData, userType,  reset, successMessage, errorMessage]);


    React.useEffect(()=>{
      getPermByCapId({capid:watch("capabilityId")})       
    },[watch("capabilityId")])

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


       {userType ? <TreeView userType={userType} permByCapId={getPermByCapIdData?.data || [] } updatePermissions={(permissionIds)=> {
        
        const paylaod = {
           capabilityId: watch("capabilityId"),
          permissionId:permissionIds,
        }
        addPermToCaps(paylaod);

       } } /> : <div>Waiting for userType...</div>}

          {/* 
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
            /> */}

            {/* <FormInput
            name="submitButton"
            type="submit"
            control={control}
            isLoading={addPermToCapsLoading}
            rest={{}}
            >
            Add Permissions
            </FormInput> */}
        </Box>

     

        {/* <TreeView /> */}
        </>
    );

    }


const TreeView =  ({userType,permByCapId, updatePermissions}) => {

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
  const [permissions, setPermissions] = React.useState(permByCapId || []);
  const [checkedPermissions, setCheckedPermissions] = React.useState(permByCapId || []);
  const [initialPermissions, setInitialPermissions] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [filterOption, setFilterOption] = React.useState('all'); // 'all', 'selected', 'unselected'
  const [showChangesDialog, setShowChangesDialog] = React.useState(false);
  
  // All menu items data
  const menuItems = [
    { navlabel: true, subheader: "Vhicles", href: "/vhicles//?tabs=null", permission_id: 51 },
    { id: "1", title: "Add Vhicles", icon: "IconCar", href: "/vhicles//?tabs=add-vhicles ", permission_id: 51 },
    { id: "2", title: "KYC update", icon: "IconCaravan", href: "/vhicles//?tabs=kyc-update ", permission_id: 55 },
    { id: "3", title: "Registered Vhicles", icon: "IconReservedLine", href: "/vhicles//?tabs=registered-vhicles ", permission_id: 52 },
    { id: "4", title: "Add vhicle services", icon: "IconDeviceImacSearch", href: "/vhicles//?tabs=add-vhicles-services ", permission_id: 53 },
    { id: "5", title: "Vhicles occupied services", icon: "IconDevicesHeart", href: "/vhicles//?tabs=vhicles-services ", permission_id: 54 },
    { navlabel: true, subheader: "Master", href: "/vhicles//?tabs=null", permission_id: 59 },
    { id: "6", title: "All Vhicles", icon: "IconHelmet", href: "/vhicles//?tabs=all-vhicles ", permission_id: 59 },
    { id: "7", title: "Roles", icon: "IconUserPlus", href: "/vhicles//?tabs=roles ", permission_id: 60 },
    { navlabel: true, subheader: "Settlements", href: "/vhicles//?tabs=null", permission_id: 62 },
    { id: "8", title: "Any Month", icon: "IconAperture", href: "/vhicles//?tabs=any-month-settlement ", permission_id: 62 },
    { id: "9", title: "Active Month", icon: "IconMoodHappy", href: "/vhicles//?tabs=active-month-settlement ", permission_id: 61 },
    { navlabel: true, subheader: "Customers", href: "/vhicles//?tabs=null", permission_id: 63 },
    { id: "10", title: "Active customers", icon: "IconUser", href: "/vhicles//?tabs=active-customers ", permission_id: 63 },
    { id: "11", title: "Customer management", icon: "IconUsers", href: "/vhicles//?tabs=customer-management ", permission_id: 64 },
    { navlabel: true, subheader: "Users", href: "/vhicles//?tabs=null", permission_id: 49 },
    { id: "12", title: "User Management", icon: "IconCrown", href: "/vhicles//?tabs=user-management ", permission_id: 49 },
    { navlabel: true, subheader: "Roles", href: "/vhicles//?tabs=null", permission_id: 48 },
    { id: "13", title: "Assign roles", icon: "IconUserPlus", href: "/vhicles//?tabs=assing-roles ", permission_id: 48 },
    { id: "14", title: "Role management", icon: "IconUsersGroup", href: "/vhicles//?tabs=role-management ", permission_id: 65 },
    { navlabel: true, subheader: "Ride History", href: "/vhicles//?tabs=null", permission_id: 76 },
    { id: "15", title: "All Rides", icon: "IconList", href: "/vhicles//?tabs=driver/ride-history/all ", permission_id: 76 },
    { id: "16", title: "Filter by Date", icon: "IconFilter", href: "/vhicles//?tabs=driver/ride-history/filter ", permission_id: 77 },
    { navlabel: true, subheader: "Support", href: "/vhicles//?tabs=null", permission_id: 84 },
    { id: "17", title: "Contact Support", icon: "IconPhoneCall", href: "/vhicles//?tabs=driver/support/contact ", permission_id: 84 },
    { id: "18", title: "FAQs", icon: "IconQuestionMark", href: "/vhicles//?tabs=driver/support/faqs ", permission_id: 85 },
    { navlabel: true, subheader: "Manage Navbar", href: "/vhicles//?tabs=null", permission_id: 40 },
    { id: "19", title: "Manage Nav Items", icon: "IconNotes", href: "/vhicles//?tabs=nav-items ", permission_id: 40 },
    { id: "20", title: "Manage SubItem Navigation", icon: "IconListTree", href: "/vhicles//?tabs=sub-nav-items ", permission_id: 42 },
    { id: "21", title: "Permission management", icon: "IconUserPlus", href: "/vhicles//?tabs=permission-management ", permission_id: 66 },
    { id: "22", title: "Add Capabilites", icon: "IconAffiliateFilled", href: "/vhicles//?tabs=add-capabilites ", permission_id: 97 },
    { id: "23", title: "Assing Menu to Roles", icon: "IconUserCheck", href: "/vhicles//?tabs=menu-assigned-to-roles ", permission_id: 43 },
    { navlabel: true, subheader: "Assign Self Driver", href: "/vhicles//?tabs=", permission_id: 88 },
    { id: "24", title: "Assign Driver", icon: "IconCarCrash", href: "/vhicles//?tabs=assign-self-driver ", permission_id: 88 },
    { navlabel: true, subheader: "Requests", href: "/vhicles//?tabs=null", permission_id: 45 },
    { id: "25", title: "Driver Onboard AMS", icon: "IconAccessibleOffFilled", href: "/vhicles//?tabs=driver-onboard-ams ", permission_id: 45 },
    { id: "26", title: "Kyc request approvals", icon: "IconUserPlus", href: "/vhicles//?tabs=kyc-request-approval ", permission_id: 67 },
    { navlabel: true, subheader: "Vehicle Types", href: "/vhicles//?tabs=/vhicle-types", permission_id: 96 },
    { id: "27", title: "Vhicle types", icon: "IconCamper", href: "/vhicles//?tabs=vhicle-types ", permission_id: 96 },
    { navlabel: true, subheader: "Drivers", href: "/vhicles//?tabs=null", permission_id: 56 },
    { id: "28", title: "Occupied Drivers", icon: "IconCaravan", href: "/vhicles//?tabs=occupied-drivers ", permission_id: 56 },
    { navlabel: true, subheader: "Rides", href: "/vhicles//?tabs=null", permission_id: 57 },
    { id: "29", title: "Today rides", icon: "IconRoad", href: "/vhicles//?tabs=today-rides ", permission_id: 57 },
    { id: "30", title: "All Rides", icon: "IconBrandStrava", href: "/vhicles//?tabs=all-rides ", permission_id: 58 },
    { navlabel: true, subheader: "Dashboard", href: "/vhicles//?tabs=null", permission_id: 68 },
    { id: "31", title: "View Summary", icon: "IconDashboard", href: "/vhicles//?tabs=driver/dashboard/summary ", permission_id: 68 },
    { id: "32", title: "Notifications", icon: "IconBell", href: "/vhicles//?tabs=driver/dashboard/notifications ", permission_id: 69 },
    { navlabel: true, subheader: "My Rides", href: "/vhicles//?tabs=null", permission_id: 70 },
    { id: "33", title: "Upcoming Rides", icon: "IconCalendarEvent", href: "/vhicles//?tabs=driver/my-rides/upcoming ", permission_id: 70 },
    { id: "34", title: "Completed Rides", icon: "IconCheck", href: "/vhicles//?tabs=driver/my-rides/completed ", permission_id: 71 },
    { id: "35", title: "Cancelled Rides", icon: "IconBan", href: "/vhicles//?tabs=driver/my-rides/cancelled ", permission_id: 72 },
    { navlabel: true, subheader: "Earnings", href: "/vhicles//?tabs=null", permission_id: 73 },
    { id: "36", title: "Daily Earnings", icon: "IconCurrencyDollar", href: "/vhicles//?tabs=driver/earnings/daily ", permission_id: 73 },
    { id: "37", title: "Monthly Earnings", icon: "IconCalendarStats", href: "/vhicles//?tabs=driver/earnings/monthly ", permission_id: 74 },
    { id: "38", title: "Payment History", icon: "IconHistory", href: "/vhicles//?tabs=driver/earnings/history ", permission_id: 75 },
    { navlabel: true, subheader: "Profile", href: "/vhicles//?tabs=null", permission_id: 78 },
    { id: "39", title: "View Profile", icon: "IconUser", href: "/vhicles//?tabs=driver/profile/view ", permission_id: 78 },
    { id: "40", title: "Edit Profile", icon: "IconEdit", href: "/vhicles//?tabs=driver/profile/edit ", permission_id: 79 },
    { id: "41", title: "Change Password", icon: "IconLock", href: "/vhicles//?tabs=driver/profile/password ", permission_id: 80 },
    { navlabel: true, subheader: "Documents", href: "/vhicles//?tabs=null", permission_id: 81 },
    { id: "42", title: "Upload Documents", icon: "IconUpload", href: "/vhicles//?tabs=driver/documents/upload ", permission_id: 81 },
    { id: "43", title: "View Documents", icon: "IconFileText", href: "/vhicles//?tabs=driver/documents/view ", permission_id: 82 },
    { id: "44", title: "Document Status", icon: "IconFileSearch", href: "/vhicles//?tabs=driver/documents/status ", permission_id: 83 },
    { navlabel: true, subheader: "Logout", href: "/vhicles//?tabs=null", permission_id: 86 },
    { id: "45", title: "Confirm Logout", icon: "IconLogout", href: "/vhicles//?tabs=logout ", permission_id: 86 }
  ];

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

  // Handle permissions data and auto-check them
  React.useEffect(() => {
    if (permByCapId) {
      const rawPerms = permByCapId;
      if (Array.isArray(permByCapId)) {
        const perms = permByCapId.map((perm) => ({
          permission_id: perm.permission_id,
          permission_name: perm.permission_name,
          capability_id: perm.capability_id,
        }));
        setPermissions(perms);
        // Auto-check permissions that exist in the response
        const permIds = perms.map((p) => p.permission_id);
        setCheckedPermissions(permIds);
        setInitialPermissions(permIds); // Track initial state for change detection
      }
    }
  }, [permByCapId]);

  // Detect changes
  React.useEffect(() => {
    if (initialPermissions.length > 0) {
      const changed = 
        checkedPermissions.length !== initialPermissions.length ||
        !checkedPermissions.every(id => initialPermissions.includes(id)) ||
        !initialPermissions.every(id => checkedPermissions.includes(id));
      setHasChanges(changed);
    }
  }, [checkedPermissions, initialPermissions]);

  // Group menu items by section (navlabel)
  const groupedMenuItems = React.useMemo(() => {
    const groups = [];
    let currentGroup = null;

    menuItems.forEach((item) => {
      if (item.navlabel) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          header: item.subheader,
          permission_id: item.permission_id,
          items: []
        };
      } else if (currentGroup) {
        currentGroup.items.push(item);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, []);

  // Filter groups based on search term and filter option
  const filteredGroups = React.useMemo(() => {
    let groups = groupedMenuItems;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      groups = groups
        .map(group => ({
          ...group,
          items: group.items.filter(item => 
            item.title.toLowerCase().includes(lowerSearch) ||
            item.permission_id.toString().includes(lowerSearch)
          )
        }))
        .filter(group => group.items.length > 0);
    }

    // Apply selection filter
    if (filterOption === 'selected') {
      groups = groups
        .map(group => ({
          ...group,
          items: group.items.filter(item => checkedPermissions.includes(item.permission_id))
        }))
        .filter(group => group.items.length > 0);
    } else if (filterOption === 'unselected') {
      groups = groups
        .map(group => ({
          ...group,
          items: group.items.filter(item => !checkedPermissions.includes(item.permission_id))
        }))
        .filter(group => group.items.length > 0);
    }

    return groups;
  }, [groupedMenuItems, searchTerm, filterOption, checkedPermissions]);

  const handleToggle = (permId) => {
    setCheckedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  // Track which sections are expanded/collapsed
  const [expandedSections, setExpandedSections] = React.useState(
    groupedMenuItems.map((_, idx) => `section-${idx}`)
  );

  // Handle section-level toggle (check/uncheck all items in a section)
  const handleSectionToggle = (sectionItems) => {
    const sectionPermIds = sectionItems.map(item => item.permission_id);
    const allChecked = sectionPermIds.every(id => checkedPermissions.includes(id));
    
    if (allChecked) {
      // Uncheck all in this section
      setCheckedPermissions(prev => prev.filter(id => !sectionPermIds.includes(id)));
    } else {
      // Check all in this section
      setCheckedPermissions(prev => {
        const newChecked = [...prev];
        sectionPermIds.forEach(id => {
          if (!newChecked.includes(id)) {
            newChecked.push(id);
          }
        });
        return newChecked;
      });
    }
  };

  // Get section checkbox state (checked, unchecked, or indeterminate)
  const getSectionCheckState = (sectionItems) => {
    const sectionPermIds = sectionItems.map(item => item.permission_id);
    const checkedCount = sectionPermIds.filter(id => checkedPermissions.includes(id)).length;
    
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === sectionPermIds.length) return 'checked';
    return 'indeterminate';
  };

  const handleSave = () => {
    // Get all permission IDs from menu items
    const allMenuPermissions = menuItems
      .filter(item => !item.navlabel)
      .map(item => item.permission_id);
    
    // Find unchecked permissions (permissions to be removed)
    const unchecked = allMenuPermissions
      .filter(permId => !checkedPermissions.includes(permId))
      .map(permId => {
        const perm = permissions.find(p => p.permission_id === permId);
        return {
          permission_id: permId,
          capability_id: perm?.capability_id || null
        };
      });

    // Checked permissions (permissions to be added/kept)
    const checked = checkedPermissions.map(permId => {
      const perm = permissions.find(p => p.permission_id === permId);
      const menuItem = menuItems.find(item => item.permission_id === permId);
      return {
        permission_id: permId,
        permission_name: menuItem?.title || perm?.permission_name,
        capability_id: perm?.capability_id || null
      };
    });

    // Find newly added permissions (not in original permissions list)
    const newlyAdded = checked.filter(c => 
      !permissions.some(p => p.permission_id === c.permission_id)
    );

    // Find removed permissions (were in original but now unchecked)
    const removed = permissions.filter(p => 
      !checkedPermissions.includes(p.permission_id)
    );

    console.log("📊 Summary:");
    console.log("✅ All Checked permissions:", checked);
    console.log("🚫 All Unchecked permissions:", unchecked);
    console.log("➕ Newly Added permissions:", newlyAdded);
    console.log("➖ Removed permissions:", removed);
    console.log("📈 Stats:", {
      total: allMenuPermissions.length,
      checked: checked.length,
      unchecked: unchecked.length,
      added: newlyAdded.length,
      removed: removed.length
    });
    
    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // Update initial permissions to current state (mark as saved)
    setInitialPermissions([...checkedPermissions]);
    setHasChanges(false);
    
    updatePermissions(newlyAdded.map(p => p.permission_id));
    
    // Call your API here to save the changes
    // Example: updateRolePermissions({ userType, permissions: checked })
  };

  const handleReset = () => {
    setCheckedPermissions([...initialPermissions]);
    setHasChanges(false);
  };

  const handleExport = () => {
    const exportData = {
      userType,
      timestamp: new Date().toISOString(),
      permissions: checkedPermissions.map(permId => {
        const perm = permissions.find(p => p.permission_id === permId);
        const menuItem = menuItems.find(item => item.permission_id === permId);
        return {
          permission_id: permId,
          permission_name: menuItem?.title || perm?.permission_name,
          capability_id: perm?.capability_id || null
        };
      })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-${userType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!userType) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="text.secondary">Waiting for user role...</Typography>
    </Box>
  );
  
  if (getRoleHasCapsLoading || capHasPermissionsLoading)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading capabilities & permissions...
        </Typography>
      </Box>
    );

  if (getRoleHasCapsError || capHasPermissionsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Data</AlertTitle>
          {getRoleHasCapsError?.message || capHasPermissionsError?.message || 'An error occurred while loading permissions'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 352, minWidth: 400 }}>
      {/* Success Message */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(false)}>
          <AlertTitle>Success!</AlertTitle>
          Permissions have been updated successfully.
        </Alert>
      )}

      {/* Summary Stats */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">
            Permission Summary for "{userType.toUpperCase()}" role
          </Typography>
          {hasChanges && (
            <Chip 
              label="Unsaved Changes" 
              color="warning" 
              size="small"
              icon={<WarningIcon />}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
          <Typography variant="body2">
            <strong>Total Menu Items:</strong> {menuItems.filter(item => !item.navlabel).length}
          </Typography>
          <Typography variant="body2" color="success.main">
            <strong>Selected:</strong> {checkedPermissions.length}
          </Typography>
          <Typography variant="body2" color="error.main">
            <strong>Unselected:</strong> {menuItems.filter(item => !item.navlabel).length - checkedPermissions.length}
          </Typography>
          {hasChanges && (
            <Typography variant="body2" color="warning.main">
              <strong>Changes:</strong> {Math.abs(checkedPermissions.length - initialPermissions.length)} modified
            </Typography>
          )}
        </Box>
      </Box>

      {/* Filter and Search Controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search menu items by title or permission ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterOption}
            label="Filter"
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <MenuItem value="all">All Items</MenuItem>
            <MenuItem value="selected">Selected Only</MenuItem>
            <MenuItem value="unselected">Unselected Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <SimpleTreeView
        disableSelection
        defaultExpandedItems={["root", ...groupedMenuItems.map((_, idx) => `section-${idx}`)]}
      >
        <TreeItem
          itemId="root"
          label={`Menu Permissions for "${userType.toUpperCase()}" role`}
        >
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, groupIdx) => {
              const checkState = getSectionCheckState(group.items);
              return (
                <TreeItem
                  key={`section-${groupIdx}`}
                  itemId={`section-${groupIdx}`}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={checkState === 'checked'}
                        indeterminate={checkState === 'indeterminate'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSectionToggle(group.items);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>
                        {group.header} (Permission ID: {group.permission_id}) - 
                        {group.items.filter(item => checkedPermissions.includes(item.permission_id)).length}/{group.items.length} selected
                      </span>
                    </Box>
                  }
                >
                  {group.items.length > 0 ? (
                    group.items.map((item) => (
                      <TreeItem
                        key={`menu-${item.id}`}
                        itemId={`menu-${item.id}`}
                        label={
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={checkedPermissions.includes(item.permission_id)}
                                onChange={() => handleToggle(item.permission_id)}
                              />
                            }
                            label={`${item.title} (Permission ID: ${item.permission_id})`}
                          />
                        }
                      />
                    ))
                  ) : (
                    <TreeItem
                      itemId={`section-${groupIdx}-no-items`}
                      label="No Menu Items"
                    />
                  )}
                </TreeItem>
              );
            })
          ) : (
            <TreeItem itemId="no-results" label="No matching menu items found" />
          )}
        </TreeItem>
      </SimpleTreeView>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!hasChanges}
          startIcon={<SaveIcon />}
        >
          Save Changes
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleReset}
          disabled={!hasChanges}
          startIcon={<RestoreIcon />}
        >
          Reset to Saved
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => setCheckedPermissions([])}
          startIcon={<ClearIcon />}
        >
          Uncheck All
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => {
            const allPermIds = menuItems
              .filter(item => !item.navlabel)
              .map(item => item.permission_id);
            setCheckedPermissions(allPermIds);
          }}
          startIcon={<CheckBoxIcon />}
        >
          Check All
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleExport}
          startIcon={<DownloadIcon />}
        >
          Export JSON
        </Button>
      </Box>

      {/* Changes Preview */}
      {hasChanges && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1, border: 1, borderColor: 'warning.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Pending Changes:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="success.main">
                  ➕ Added: {checkedPermissions.filter(id => !initialPermissions.includes(id)).length}
                </Typography>
                <Typography variant="body2" color="error.main">
                  ➖ Removed: {initialPermissions.filter(id => !checkedPermissions.includes(id)).length}
                </Typography>
              </Box>
            </Box>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => setShowChangesDialog(true)}
            >
              View Details
            </Button>
          </Box>
        </Box>
      )}

      {/* Changes Dialog */}
      <Dialog 
        open={showChangesDialog} 
        onClose={() => setShowChangesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Changes Preview
          <IconButton
            onClick={() => setShowChangesDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Added Permissions */}
          {checkedPermissions.filter(id => !initialPermissions.includes(id)).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="success.main" gutterBottom>
                ➕ Permissions to be Added ({checkedPermissions.filter(id => !initialPermissions.includes(id)).length})
              </Typography>
              <List dense>
                {checkedPermissions
                  .filter(id => !initialPermissions.includes(id))
                  .map(permId => {
                    const menuItem = menuItems.find(item => item.permission_id === permId);
                    return (
                      <ListItem key={permId}>
                        <ListItemIcon>
                          <AddCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={menuItem?.title || `Permission ${permId}`}
                          secondary={`Permission ID: ${permId}`}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          )}

          {/* Removed Permissions */}
          {initialPermissions.filter(id => !checkedPermissions.includes(id)).length > 0 && (
            <Box>
              <Typography variant="subtitle1" color="error.main" gutterBottom>
                ➖ Permissions to be Removed ({initialPermissions.filter(id => !checkedPermissions.includes(id)).length})
              </Typography>
              <List dense>
                {initialPermissions
                  .filter(id => !checkedPermissions.includes(id))
                  .map(permId => {
                    const menuItem = menuItems.find(item => item.permission_id === permId);
                    return (
                      <ListItem key={permId}>
                        <ListItemIcon>
                          <RemoveCircleIcon color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={menuItem?.title || `Permission ${permId}`}
                          secondary={`Permission ID: ${permId}`}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          )}

          {!hasChanges && (
            <Typography color="text.secondary">
              No changes to display
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChangesDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowChangesDialog(false);
              handleSave();
            }}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Capabilities
