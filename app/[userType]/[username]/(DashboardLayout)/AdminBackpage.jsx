'use client';
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import dynamic from 'next/dynamic';
import { glbalFileUploader } from '@app/libs/apis/fileUploader';

// Create a reusable Centered Loader
export const CenteredLoader = () => (
  <Box
    sx={{
      width: '100%',
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress size={20} />
  </Box>
);

// Dynamic imports with Centered Loader
const PageContainer = dynamic(() => import('./components/container/PageContainer'), {
  ssr: false,
  loading: () => <CenteredLoader />,
});

const AdminOperationsDashboard = dynamic(() => import('./components/dashboard/AdminOperationsDashboard'), {
  loading: () => <CenteredLoader />,
});

const UserMgmt = dynamic(() => import('./utilities/admin-cmp/UserMgmt'), {
  loading: () => <CenteredLoader />,
});
const RoleMgmt = dynamic(() => import('./utilities/admin-cmp/RoleMgmt'), {
  loading: () => <CenteredLoader />,
});
const PermissionMgmt = dynamic(() => import('./utilities/admin-cmp/PermissionMgmt'), {
  loading: () => <CenteredLoader />,
});
const KycRequestApproval = dynamic(() => import('./utilities/admin-cmp/KYCRequestApproval'), {
  loading: () => <CenteredLoader />,
});

const VhicleTypes = dynamic(() => import('./utilities/admin-cmp/VhicleTypes'), {
  loading: () => <CenteredLoader />,
});

const AssingRoles = dynamic(() => import('./utilities/admin-cmp/AssignRoles'), {
  loading: () => <CenteredLoader />,
});

const NavItems = dynamic(() => import('./utilities/admin-cmp/NavItems/NavItems'), {
  loading: () => <CenteredLoader />,
});  

const SubNavForm = dynamic(() => import('./utilities/admin-cmp/NavItems/SubNavItem'), {
  loading: () => <CenteredLoader />,
});  

const MenuAssignToRoles = dynamic(() => import('./utilities/admin-cmp/NavItems/MenuAssignToRoles'), {
  loading: () => <CenteredLoader />,
});  

const DriverOnboardAms = dynamic(() => import('./utilities/admin-cmp/DriverOnboardAms'), {
  loading: () => <CenteredLoader />,
});  

const Capabilities = dynamic(() => import('./utilities/admin-cmp/Capabilities'), {
  loading: () => <CenteredLoader />,
});

const UserPermissionMatrix = dynamic(() => import('./utilities/admin-cmp/UserPermissionMatrix'), {
  loading: () => <CenteredLoader />,
});

const AssignDriverToOwner = dynamic(() => import('./utilities/admin-cmp/AssignDriverToOwner'), {
  loading: () => <CenteredLoader />,
}); 


function AdminBackpage({ userType, userName }) {
  const params = useSearchParams();
  const tabs = params.get('tabs')?.trim() || null;
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUserInfo({ userName, userType }));
  }, []);

  
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      {tabs === null ? <AdminOperationsDashboard /> : null}

      {tabs === 'user-management' && <UserMgmt />}
      {tabs === 'role-management' && <RoleMgmt />}
      {tabs === 'permission-management' && <PermissionMgmt />}
      {tabs === 'kyc-request-approval' && <KycRequestApproval />}
      {tabs === 'vhicle-types' && <VhicleTypes />}
      {tabs === 'assing-roles' && <AssingRoles />}
      {tabs === 'user-permission-matrix' && <UserPermissionMatrix />}
      {tabs === 'nav-items' && <NavItems />}
      {tabs === 'sub-nav-items' && <SubNavForm />}
      {tabs === 'menu-assigned-to-roles' && <MenuAssignToRoles />}
      {tabs === 'driver-onboard-ams' && <DriverOnboardAms />}
      {tabs === 'add-capabilites' && <Capabilities />}
      {tabs === 'assign-driver-to-owner' && <AssignDriverToOwner />}
      
      
    </PageContainer>
  );
}

export default AdminBackpage;
