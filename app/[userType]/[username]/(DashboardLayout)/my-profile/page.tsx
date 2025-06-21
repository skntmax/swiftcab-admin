'use client'
import dynamic from '@node_modules/next/dynamic';
import React, { useEffect } from 'react'
import { CenteredLoader } from '../AdminBackpage';
// import { useAddSubnavBarMutation } from '@app/libs/apis/admin';
import {  useDriverDetailsMutation } from '@app/libs/apis/driver';

const UserDetailsShow = dynamic(() => import("../utilities/common-cmp/driver/UserDetailsShow"), {
  loading: () => <CenteredLoader />,
});  

function page() {

  const [ getDriverDetails ,  { data: getDriverDetailsData , isLoading:getDriverDetailsLoading  } ]  = useDriverDetailsMutation();
  useEffect(()=>{
     getDriverDetails()
  },[])
  
   return  <UserDetailsShow isLoading={getDriverDetailsLoading}  data={getDriverDetailsData?.data }  />

}

export default page