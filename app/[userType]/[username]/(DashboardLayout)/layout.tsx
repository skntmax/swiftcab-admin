"use client";
import { styled, Container, Box, ThemeProvider } from "@mui/material";
import React, { useState } from "react";
import Header from "./layout/header/Header";
// import Sidebar from "./layout/sidebar/Sidebar";
const Sidebar   = dynamic(()=> import("./layout/sidebar/Sidebar") , {ssr:false}) ;
import { baselightTheme } from '@utils/theme/DefaultColors'
import CssBaseline from "@mui/material/CssBaseline";
import dynamic from "@node_modules/next/dynamic";
import { usePathname } from "@node_modules/next/navigation";
import { USER_ROLES } from "@constants";
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

interface Props {
  children: React.ReactNode;
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname(); // Get current route


  const [ userType ,  username] = pathname.split('/').filter(Boolean) 

return (

   
    <MainWrapper className="mainwrapper" style={{background:"white"}}>
      

       {/* for owner role  */}
       { userType==USER_ROLES.owner?.toLowerCase() && <>
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
      
       </> }


        {/* for owner role  */}
        { userType==USER_ROLES.customer?.toLowerCase() && <>
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
      
       </> }




    
    </MainWrapper>
   

  );
}
