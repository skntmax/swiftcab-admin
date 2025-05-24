"use client";
import { styled, Container, Box, ThemeProvider } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import Header from "./layout/header/Header";
// import Sidebar from "./layout/sidebar/Sidebar";
const Sidebar   = dynamic(()=> import("./layout/sidebar/Sidebar") , {ssr:false}) ;
import { baselightTheme } from '@utils/theme/DefaultColors'
import CssBaseline from "@mui/material/CssBaseline";
import dynamic from "@node_modules/next/dynamic";
import { usePathname } from "@node_modules/next/navigation";
import { SWC_KEYS, USER_ROLES } from "@constants";
import { useDispatch } from "@node_modules/react-redux/dist/react-redux";
import { fetGlobalNavbar } from "@app/libs/slice/navMenuSlice";
import { useAppSelector } from "@app/libs/store";
import { fetchUserRoles } from "@app/libs/slice/userRolesSlice";
import { setBaseUrl } from "@app/libs/slice/profile";
import { contextProvider } from "@components/AppProvider";
const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));



export default function RootLayout({children}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname(); // Get current route
  const dispatch = useDispatch()

  const navbar =  useAppSelector((ele)=> ele['navbar-menu'])
  const userRoles =  useAppSelector((ele)=> ele['userRoles'])
  const  profile =  useAppSelector((ele)=> ele.baseUrl)
  const [ userType ,  username] = pathname.split('/').filter(Boolean) 
  
useEffect(()=>{
 
    if(navbar?.navbar.length==0)
       dispatch(fetGlobalNavbar({userType:userType.toLowerCase()}))

   if(userRoles?.list?.length==0)
        dispatch(fetchUserRoles())


   // setting baseUrl 
    if(!profile?.baseUrl) {
       let baseUrl =`${userType.toLowerCase()}/${username}`
       dispatch(setBaseUrl({baseUrl}))
    }

   },[])


  


   
   
return (

    <MainWrapper className="mainwrapper" style={{background:"white", zIndex:5}}>     
        <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
  
      <PageWrapper className="page-wrapper">
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <Container
          sx={{
            paddingTop: "20px",
            maxWidth: "1200px",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
        </Container>
      </PageWrapper>  
    </MainWrapper>
   

  );
}
