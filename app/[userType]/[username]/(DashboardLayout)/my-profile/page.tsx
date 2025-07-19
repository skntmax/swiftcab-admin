'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { CenteredLoader } from '../AdminBackpage';
import { useDriverDetailsMutation } from '@app/libs/apis/driver';
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import { useParams } from 'next/navigation';
import { USER_ROLES } from '@constants';
import { getUserInfo } from '@utils';

// Lazy load
const UserDetailsShow = dynamic(() => import("../utilities/common-cmp/driver/UserDetailsShow"), {
  loading: () => <CenteredLoader />,
  ssr: false
});

function Page() {
  const userDetails = getUserInfo();
  const params = useParams();
  const { username: userName, userType } = params;

  const dispatch = useAppDispatch();
  const  [driverUpdatedOrCreated , setDriverUpdatedOrCreated] = useState(false);

  const [getDriverDetails, { data: getDriverDetailsData, isLoading: getDriverDetailsLoading }] = useDriverDetailsMutation();

  useEffect(() => {
    if (userType === USER_ROLES['driver-partner']) {
      getDriverDetails();
      dispatch(setUserInfo({ userName, userType }));
    }
  }, []);


  useEffect(() => {
    if (userType === USER_ROLES['driver-partner']) {
      getDriverDetails();
      dispatch(setUserInfo({ userName, userType }));
    }
  }, [driverUpdatedOrCreated]); 
 

  switch (userType) {
    case USER_ROLES['driver-partner']:
      return (
        <UserDetailsShow
          isLoading={getDriverDetailsLoading}
          data={getDriverDetailsData?.data}
          userName={userName}
          userType={userType}
          userDetails={userDetails}
          setDriverUpdatedOrCreated={()=>setDriverUpdatedOrCreated(p=> !p)}
        />
      );
    case USER_ROLES.admin:
      return <>Admin</>;
    case USER_ROLES.owner:
      return <>Owner</>;
    default:
      return <>Invalid User Role</>;
  }
}

export default Page;
