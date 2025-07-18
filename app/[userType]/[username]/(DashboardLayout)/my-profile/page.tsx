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
  const [driverEdit, setDriverEdit] = useState<boolean>(false);
  const [hasInit, setHasInit] = useState<boolean>(false);

  const [getDriverDetails, { data: getDriverDetailsData, isLoading: getDriverDetailsLoading }] = useDriverDetailsMutation();

  useEffect(() => {
    if (userType === USER_ROLES['driver-partner']) {
      getDriverDetails();
      dispatch(setUserInfo({ userName, userType }));
    }
  }, []);

  // Only set initial mode once
  useEffect(() => {
    if (!hasInit && userType === USER_ROLES['driver-partner']) {
      if (getDriverDetailsData?.data) {
        setDriverEdit(false); // View mode if data exists
      } else {
        setDriverEdit(true); // Edit mode if data missing
      }
      setHasInit(true); // Prevent re-setting
    }
  }, [getDriverDetailsData, userType, hasInit]);

  switch (userType) {
    case USER_ROLES['driver-partner']:
      return (
        <UserDetailsShow
          isLoading={getDriverDetailsLoading}
          data={getDriverDetailsData?.data}
          userName={userName}
          userType={userType}
          // driverEdit={driverEdit}
          // setDriverEdit={setDriverEdit}
          userDetails={userDetails}
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
