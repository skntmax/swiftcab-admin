'use client'
import React from "react";
import Menuitems from "./MenuItems";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { useAppSelector } from "@app/libs/store";

import * as  all_cons from "@tabler/icons-react";

const SidebarItems = ({ toggleMobileSidebar }) => {
  const pathname = usePathname()
  let params = useSearchParams()
  let tabs = params.get('tabs')
    const navbar =  useAppSelector((ele)=> ele['navbar-menu'])
  
  let capHasPermissions = 
  [
        {
            "permission_id": 42,
            "permission_name": "Manage Sub Item navigation ",
            "id": 99,
            "capability_id": 17,
            "created_on": "2025-10-11T20:23:42.558Z",
            "updated_on": "2025-10-11T20:23:42.557Z"
        },
        {
            "permission_id": 43,
            "permission_name": "Allow Assing Menu to Roles",
            "id": 100,
            "capability_id": 17,
            "created_on": "2025-10-11T20:23:42.558Z",
            "updated_on": "2025-10-11T20:23:42.557Z"
        },
        {
            "permission_id": 63,
            "permission_name": "Allow Active customers",
            "id": 87,
            "capability_id": 18,
            "created_on": "2025-08-31T21:53:43.754Z",
            "updated_on": "2025-08-31T21:53:43.752Z"
        },
        {
            "permission_id": 64,
            "permission_name": "Allow Customer management",
            "id": 88,
            "capability_id": 18,
            "created_on": "2025-08-31T21:53:43.754Z",
            "updated_on": "2025-08-31T21:53:43.752Z"
        },
        {
            "permission_id": 65,
            "permission_name": "allow Role management",
            "id": 89,
            "capability_id": 18,
            "created_on": "2025-08-31T21:53:43.754Z",
            "updated_on": "2025-08-31T21:53:43.752Z"
        },
        {
            "permission_id": 69,
            "permission_name": "Allow Notifications",
            "id": 93,
            "capability_id": 17,
            "created_on": "2025-08-31T22:07:33.073Z",
            "updated_on": "2025-08-31T22:07:33.068Z"
        },
        {
            "permission_id": 70,
            "permission_name": "Allow Upcoming Rides",
            "id": 94,
            "capability_id": 17,
            "created_on": "2025-08-31T22:07:33.073Z",
            "updated_on": "2025-08-31T22:07:33.068Z"
        },
        {
            "permission_id": 75,
            "permission_name": "Allow Payment History",
            "id": 86,
            "capability_id": 17,
            "created_on": "2025-08-31T21:47:14.803Z",
            "updated_on": "2025-08-31T21:47:14.802Z"
        },
        {
            "permission_id": 76,
            "permission_name": "Allow All Rides (duplicate)",
            "id": 91,
            "capability_id": 17,
            "created_on": "2025-08-31T21:55:04.468Z",
            "updated_on": "2025-08-31T21:55:04.465Z"
        },
        {
            "permission_id": 77,
            "permission_name": "Allow Filter by Date",
            "id": 90,
            "capability_id": 17,
            "created_on": "2025-08-31T21:55:04.468Z",
            "updated_on": "2025-08-31T21:55:04.465Z"
        },
        {
            "permission_id": 81,
            "permission_name": "Allow Upload Documents",
            "id": 85,
            "capability_id": 17,
            "created_on": "2025-08-31T21:47:14.803Z",
            "updated_on": "2025-08-31T21:47:14.802Z"
        },
        {
            "permission_id": 82,
            "permission_name": "Allow View Documents",
            "id": 84,
            "capability_id": 17,
            "created_on": "2025-08-31T21:47:14.803Z",
            "updated_on": "2025-08-31T21:47:14.802Z"
        },
        {
            "permission_id": 84,
            "permission_name": "Allow Contact Support",
            "id": 83,
            "capability_id": 18,
            "created_on": "2025-08-31T21:46:29.047Z",
            "updated_on": "2025-08-31T21:46:29.046Z"
        },
        {
            "permission_id": 85,
            "permission_name": "Allow FAQs",
            "id": 82,
            "capability_id": 18,
            "created_on": "2025-08-31T21:46:29.047Z",
            "updated_on": "2025-08-31T21:46:29.046Z"
        },
        {
            "permission_id": 86,
            "permission_name": "Allow Confirm Logout",
            "id": 81,
            "capability_id": 18,
            "created_on": "2025-08-31T21:46:29.047Z",
            "updated_on": "2025-08-31T21:46:29.046Z"
        },
        {
            "permission_id": 88,
            "permission_name": "allow Assign Driver",
            "id": 97,
            "capability_id": 17,
            "created_on": "2025-10-11T20:22:43.433Z",
            "updated_on": "2025-10-11T20:22:43.414Z"
        }
    ]
    
  const pathDirect = `${pathname}/?tabs=${tabs}`;

    let modifiedMenuItems =(navbar?.navbar).map(ele=>({
    ...ele , icon: all_cons[ele.icon] 
    })) 

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
      {/* modifiedMenuItems.filter(ele=> capHasPermissions.some(innerEle=> innerEle?.permission_id == ele.permission_id ) ) */}
        { modifiedMenuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader)
            return <NavGroup item={item} key={item.subheader} />;
          return (
            <NavItem
              item={item}
              key={item.id}
              pathDirect={pathDirect}
              onClick={toggleMobileSidebar}
            />
          )
          })}
      </List>
    </Box>
  );
};
export default SidebarItems;
