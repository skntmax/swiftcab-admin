import React, { useState } from "react";
import {
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { ListChecks, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@utils/authSession";
import { useAppSelector } from "@app/libs/store";

type userProfile ={ 
   username:string
}
const Profile = ({username}:userProfile) => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const router = useRouter()
    const  profile: any =  useAppSelector((ele:any)=> ele.profile)
  
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = async () => {
    handleClose2();
    await clearAuthSession();
    window.location.href = "/";
  };

  const  switchToMyProfile=()=>{
    router.push(`/${profile?.baseUrl}/my-profile`)  
  }


  const switchToMyAccound = ()=>{
    router.push(`/${profile?.baseUrl}/my-account` )  
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
          color: "inherit",
          ...(Boolean(anchorEl2) && {
            color: "#c4f82a",
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
            <User size={20} />
          </ListItemIcon>
          <ListItemText   onClick={()=>switchToMyProfile()}>My Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Mail size={20} />
          </ListItemIcon>
          <ListItemText onClick={()=> switchToMyAccound() } >My Account</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ListChecks size={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            variant="outlined"
            color="primary"
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
