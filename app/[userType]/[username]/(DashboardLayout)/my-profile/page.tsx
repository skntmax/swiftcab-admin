'use client'
import dynamic from '@node_modules/next/dynamic';
import React, { useContext, useEffect } from 'react'
import { CenteredLoader } from '../AdminBackpage';
// import { useAddSubnavBarMutation } from '@app/libs/apis/admin';
import {  useDriverDetailsMutation } from '@app/libs/apis/driver';
import { ReduxProvider } from '@app/libs/slice/useReduxSelector';
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import { useParams } from 'next/navigation';
import { USER_ROLES } from '@constants';

// components 
const UserDetailsShow = dynamic(() => import("../utilities/common-cmp/driver/UserDetailsShow"), {
  loading: () => <CenteredLoader />,
});  

function page() {

  let params = useParams()
  const {username:userName ,  userType } = params
   let dispatch = useAppDispatch()

  // api calls
   const [ getDriverDetails ,  { data: getDriverDetailsData , isLoading:getDriverDetailsLoading  } ]  = useDriverDetailsMutation();
  
  
  //  getting user details of all types 
  useEffect(()=>{
     getDriverDetails()
     // setting userinfo as well on reset 
    dispatch(setUserInfo({ userName: userName, userType: userType }));
  },[])
  
  switch(userType) {
     case  USER_ROLES['driver-partner']:
    return  <UserDetailsShow isLoading={getDriverDetailsLoading}  data={getDriverDetailsData?.data }  {...{userName ,  userType}}   />

     case  USER_ROLES.admin:
    return  <> admin </>
    
     case  USER_ROLES.owner:
    return  <> owner </>

  }

}

export default page