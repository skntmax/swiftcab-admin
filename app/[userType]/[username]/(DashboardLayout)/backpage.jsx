'use client';
import React, { useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import { useSearchParams } from 'next/navigation';
import { CenteredLoader } from './AdminBackpage';

// Dynamic imports
const PageContainer = dynamic(() => import('./components/container/PageContainer', { loading:<CenteredLoader />} ));
const SalesOverview = dynamic(() => import('./components/dashboard/SalesOverview' ,{ loading:<CenteredLoader />}));
const YearlyBreakup = dynamic(() => import('./components/dashboard/YearlyBreakup'),{  ssr: false, loading: () => <CenteredLoader />,});
const RecentTransactions = dynamic(() => import('./components/dashboard/RecentTransactions'),{  ssr: false, loading: () => <CenteredLoader />,});
const ProductPerformance = dynamic(() => import('./components/dashboard/ProductPerformance'),{  ssr: false, loading: () => <CenteredLoader />,});
const Blog = dynamic(() => import('./components/dashboard/Blog'),{  ssr: false, loading: () => <CenteredLoader />,});
const MonthlyEarnings = dynamic(() => import('./components/dashboard/MonthlyEarnings'),{  ssr: false, loading: () => <CenteredLoader />,});
const TypographyPage = dynamic(() => import('./utilities/typography/page'),{  ssr: false, loading: () => <CenteredLoader />,});
const Shadow = dynamic(() => import('./utilities/shadow/page'),{  ssr: false, loading: () => <CenteredLoader />,});
const Icons = dynamic(() => import('./icons/page'),{  ssr: false, loading: () => <CenteredLoader />,});
const SamplePage = dynamic(() => import('./sample-page/page'),{  ssr: false, loading: () => <CenteredLoader />,});
const AddVhicle = dynamic(() => import('./utilities/owner-cmp/AddVhicle'),{  ssr: false, loading: () => <CenteredLoader />,});

  const RegisteredVhicles = dynamic(() => import('./utilities/owner-cmp/RegisteredVhicles'),{  ssr: false, loading: () => <CenteredLoader />,});
const VhicleServices = dynamic(() => import('./utilities/owner-cmp/VhicleServices'),{  ssr: false, loading: () => <CenteredLoader />,});
const VhicleOccupiedServies = dynamic(() => import('./utilities/owner-cmp/VhicleOccupiedServies'),{  ssr: false, loading: () => <CenteredLoader />,});
const VarifyKyc = dynamic(() => import('./utilities/owner-cmp/VarifyKyc'),{  ssr: false, loading: () => <CenteredLoader />,});
const OccupiedDrivers = dynamic(() => import('./utilities/owner-cmp/OccupiedDrivers'),{  ssr: false, loading: () => <CenteredLoader />,});
const AssingDrivers = dynamic(() => import('./utilities/owner-cmp/AssingDrivers'),{  ssr: false, loading: () => <CenteredLoader />,});
 
function UsersDashboard({ userType, userName }) {
  const params = useSearchParams();
  const tabs = params.get('tabs');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUserInfo({ userName: userName, userType: userType }));
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

      {tabs === 'add-vhicles' && <AddVhicle />}
      {tabs === 'registered-vhicles' && <RegisteredVhicles />}
      {tabs === 'add-vhicles-services' && <VhicleServices />}
      {tabs === 'vhicles-services' && <VhicleOccupiedServies />}
      {tabs === 'kyc-update' && <VarifyKyc />}
      {tabs === 'today-rides' && <SamplePage />}
      {tabs === 'all-rides' && <SamplePage />}
      {tabs === 'all-vhicles' && <SamplePage />}
      {tabs === 'roles' && <SamplePage />}
      {tabs === 'active-month-settlement' && <SamplePage />}
      {tabs === 'any-month-settlement' && <SamplePage />}
      {tabs === 'occupied-drivers' && <OccupiedDrivers /> }
      {tabs === 'assign-self-driver' && <AssingDrivers /> }
      
    </PageContainer>
  );
}

export default UsersDashboard;
