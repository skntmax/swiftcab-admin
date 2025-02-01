import { useMediaQuery, Box, Drawer } from "@mui/material";
import SidebarItems from "./SidebarItems";
import { Upgrade } from "./Updrade";
import dynamic from "@node_modules/next/dynamic";
// import { Sidebar, Logo } from 'react-mui-sidebar';

const Sidebar = dynamic(() => import('react-mui-sidebar').then(mod => mod.Sidebar), { ssr: false });
const Logo = dynamic(() => import('react-mui-sidebar').then(mod => mod.Logo), { ssr: false });

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  const sidebarWidth = "270px";

  // Custom CSS for short scrollbar
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '7px',

    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#eff2f7',
      borderRadius: '15px',
    },
  };


  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
      
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              ...scrollbarStyles,
            },
          }}
        >
         
         <Box
            sx={{
              height: "100%",
            }}
          >
            
            <SidebarItems />
            <Upgrade />
          
                {/* <Sidebar
              width={'270px'}
              collapsewidth="80px"
              open={isSidebarOpen}
              themeColor="#5d87ff"
              themeSecondaryColor="#49beff"
              showProfile={false}
            >
               
              <Logo img="/images/logos/dark-logo.svg" />
              <Box>
                <SidebarItems />
                <Upgrade />
              </Box>
            </Sidebar > */}
          
          </Box>

          
        </Drawer>
      </Box>
    );
  }

  return (
    
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Sidebar Box */}
      {/* ------------------------------------------- */}
      <Box px={2}>
        
        
      <SidebarItems />
            <Upgrade />
          
          
        {/* <Sidebar
          width={'270px'}
          collapsewidth="80px"
          isCollapse={false}
          mode="light"
          direction="ltr"
          themeColor="#5d87ff"
          themeSecondaryColor="#49beff"
          showProfile={false}
          items={[]}
        >
       
          <Logo img="/images/logos/dark-logo.svg" />
        
          <SidebarItems />
          <Upgrade />
        </Sidebar>

         */}
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}

    </Drawer>
  );
};

export default MSidebar;





