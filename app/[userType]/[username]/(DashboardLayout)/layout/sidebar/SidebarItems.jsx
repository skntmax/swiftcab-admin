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
  
  const pathDirect = `${ pathname}/?tabs=${tabs}`;
  const userInfo =useAppSelector((ele)=> ele.usersInfo)

  
  // let modifiedMenuItems =Menuitems.map(ele=>({
  //    ...ele , href: `/${userInfo.userType}/${userInfo.userName}/${ele.href!="/"?"?tabs="+ele.href?.split('/')[1]:""} ` 
  // }))

      let modifiedMenuItems =(navbar?.navbar).map(ele=>({
      ...ele , icon: all_cons[ele.icon] 
      })) 


  
  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {modifiedMenuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={toggleMobileSidebar}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
