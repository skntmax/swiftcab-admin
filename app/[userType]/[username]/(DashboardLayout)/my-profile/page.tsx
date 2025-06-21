'use client'
import dynamic from '@node_modules/next/dynamic';
import React, { useEffect } from 'react'
import { CenteredLoader } from '../AdminBackpage';
// import { useAddSubnavBarMutation } from '@app/libs/apis/admin';
import { driverDetailsMutation } from '@app/libs/apis/driver';

const UserDetailsShow = dynamic(() => import("../utilities/common-cmp/driver/UserDetailsShow"), {
  loading: () => <CenteredLoader />,
});  

function page() {

  // const [ getDriverDetails ,  { data: getDriverDetailsData , isLoading:getDriverDetailsLoading  } ]  = driverDetailsMutation();

  useEffect(()=>{
    //  getDriverDetails()
  },[])
  
  
   return  <UserDetailsShow isLoading={false}  data={{
     profile_pic: "https://res.cloudinary.com/...jpg", // <-- Optional but recommended
  DL: "http://...",
  RC: "http://...",
  insurance: "http://...",
  pan_card: "http://...",
  adhar_card: "http://...",
  is_varified: false,
  wallet_code: "...",
  wallet_balance: 0,
  is_bank_varified: false,
  created_on: "...",
  updated_on: "...",
  driver: 73
   } }  />

}

export default page