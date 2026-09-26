"use client";
import { styled, Box, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "./layout/header/Header";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetGlobalNavbar } from "@app/libs/slice/navMenuSlice";
import { useAppSelector } from "@app/libs/store";
import { fetchUserRoles } from "@app/libs/slice/userRolesSlice";
import {fetchGlobalCapability} from "@app/libs/slice/capabilities";
import { setBaseUrl } from "@app/libs/slice/profile";
import { fetchGlobalNavPermissions } from "@app/libs/slice/navPermissions";
import UseReduxSelector from "@app/libs/slice/useReduxSelector";
import { SocketClient } from "../../../../components/Socket/SocketProvider";
import { USER_ROLES } from "@constants";
import { dashboardTheme, DASHBOARD_SURFACE } from "@utils/theme/driverTheme";
import DashboardPageShell from "./utilities/driver-cmp/portal/DriverPageShell";

const Sidebar = dynamic(() => import("./layout/sidebar/Sidebar"), { ssr: false });

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  overflow: "hidden",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  minWidth: 0,
  minHeight: 0,
  paddingBottom: 0,
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: DASHBOARD_SURFACE,
  overflowY: "auto",
  overflowX: "hidden",
}));

export default function RootLayout({children}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const dispatch = useDispatch()

  const userRoles =  useAppSelector((ele)=> ele['userRoles'])
  const  capabilities =  useAppSelector((ele)=> ele['capability-list'])
  const navPermList = useAppSelector((ele)=> ele['navbar-perm-list'])
  const  profile =  useAppSelector((ele)=> ele.baseUrl)
  const [ userType ,  username] = pathname.split('/').filter(Boolean)
  const roleSlug = userType?.toLowerCase() ?? ''
  const isDriver = roleSlug === USER_ROLES['driver-partner']
  const tabs = params.get("tabs")?.trim() || null
  const fullBleed = isDriver && !tabs

useEffect(()=>{
 
   // navbar — always refresh so group icons and new tabs appear after DB updates
   dispatch(fetGlobalNavbar({userType:userType.toLowerCase()}))

    // user roles
    if(userRoles?.list?.length==0)
          dispatch(fetchUserRoles())
 
   // capabilities
    if(capabilities?.list?.length==0)
      dispatch(fetchGlobalCapability())


     // capabilities
    if(navPermList?.list?.length==0)
      dispatch(fetchGlobalNavPermissions())

   // setting baseUrl 
    if(!profile?.baseUrl) {
       let baseUrl =`${userType.toLowerCase()}/${username}`
       dispatch(setBaseUrl({baseUrl}))
    }

   },[])

return (

  <UseReduxSelector>
    <ThemeProvider theme={dashboardTheme}>
    <MainWrapper className="mainwrapper" style={{background: DASHBOARD_SURFACE, zIndex:5}}>     
        <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper className="page-wrapper">
        <SocketClient userType={roleSlug}>
        <Header
          toggleMobileSidebar={() => setMobileSidebarOpen(true)}
          showSocketMarker={isDriver}
          roleSlug={roleSlug}
        />
        <Box sx={{ flexGrow: 1, position: "relative", height: "calc(100vh - 70px)", minHeight: 0, p: 0, overflow: "auto", bgcolor: DASHBOARD_SURFACE }}>
          {fullBleed ? children : <DashboardPageShell>{children}</DashboardPageShell>}
        </Box>
        </SocketClient>
      </PageWrapper>
    </MainWrapper>
    </ThemeProvider>
 </UseReduxSelector>   

  );
}
