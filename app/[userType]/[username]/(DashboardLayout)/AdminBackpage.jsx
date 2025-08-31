'use client';
import React, { useEffect } from 'react';
import { Grid, Box, CircularProgress } from '@mui/material';
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

const SalesOverview = dynamic(() => import('./components/dashboard/SalesOverview'), {
  loading: () => <CenteredLoader />,
});
const YearlyBreakup = dynamic(() => import('./components/dashboard/YearlyBreakup'), {
  loading: () => <CenteredLoader />,
});
const RecentTransactions = dynamic(() => import('./components/dashboard/RecentTransactions'), {
  loading: () => <CenteredLoader />,
});
const ProductPerformance = dynamic(() => import('./components/dashboard/ProductPerformance'), {
  loading: () => <CenteredLoader />,
});
const Blog = dynamic(() => import('./components/dashboard/Blog'), {
  loading: () => <CenteredLoader />,
});
const MonthlyEarnings = dynamic(() => import('./components/dashboard/MonthlyEarnings'), {
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


function AdminBackpage({ userType, userName }) {
  const params = useSearchParams();
  const tabs = params.get('tabs');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUserInfo({ userName, userType }));
  }, []);

  
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      {tabs === null ? (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <SalesOverview />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <YearlyBreakup />
                </Grid>
                <Grid item xs={12}>
                  <MonthlyEarnings />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4}>
              <RecentTransactions />
            </Grid>
            <Grid item xs={12} lg={8}>
              <ProductPerformance />
            </Grid>
            <Grid item xs={12}>
              <Blog />
            </Grid>
          </Grid>
        </Box>
      ) : null}

      {tabs === 'user-management' && <UserMgmt />}
      {tabs === 'role-management' && <RoleMgmt />}
      {tabs === 'permission-management' && <PermissionMgmt />}
      {tabs === 'kyc-request-approval' && <KycRequestApproval />}
      {tabs === 'vhicle-types' && <VhicleTypes />}
      {tabs === 'assing-roles' && <AssingRoles />}
      {tabs === 'nav-items' && <NavItems />}
      {tabs === 'sub-nav-items' && <SubNavForm />}
      {tabs === 'menu-assigned-to-roles' && <MenuAssignToRoles />}
      {tabs === 'driver-onboard-ams' && <DriverOnboardAms />}
      {tabs === 'add-capabilites' && <Capabilities />}
      
      
    </PageContainer>
  );
}

export default AdminBackpage;
