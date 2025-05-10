import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { IconListCheck, IconMail, IconUser } from "@tabler/icons-react";
import { SWC_KEYS } from "@constants";
import { deleteCookie } from "@node_modules/cookies-next/lib";
import { usePathname, useRouter } from "next/navigation";

type userProfile ={ 
   username:string
}
const Profile = ({username}:userProfile) => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const router = useRouter()
  const pathname = usePathname()
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = () => {
    deleteCookie(SWC_KEYS.SWC_USER);
    deleteCookie(SWC_KEYS.SWC_TOKEN);
  };

  const  switchToMyProfile=()=>{
    router.push(`${pathname}/my-profile`)  
  }


  const switchToMyAccound = ()=>{
    router.push(`${pathname}/my-account` )  
  }
  return (
    <Box>
      <IconButton
        size="medium"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
         {username?.toUpperCase()}
         <AccountCircleIcon
          sx={{
            width: 35,
            height: 35,
          }}
         />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText   onClick={()=>switchToMyProfile()}>My Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText onClick={()=> switchToMyAccound() } >My Account</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            href="/authentication/login"
            variant="outlined"
            color="primary"
            component={Link}
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
