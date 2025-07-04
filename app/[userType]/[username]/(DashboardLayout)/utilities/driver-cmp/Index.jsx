'use client'
import React, { ReactElement, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from './../../components/container/PageContainer';

// components
import SalesOverview from './../../components/dashboard/SalesOverview';
import YearlyBreakup from './../../components/dashboard/YearlyBreakup';
import RecentTransactions from './../../components/dashboard/RecentTransactions';
import ProductPerformance from './../../components/dashboard/ProductPerformance';
import Blog from './../../components/dashboard/Blog';
import MonthlyEarnings from './../../components/dashboard/MonthlyEarnings';
import  ViewSummary from './Dashboard/ViewSummary'
import  Notification from './Dashboard/Notification'
import UpComingRides from './Dashboard/UpComingRides'
import CompletedRides from './Dashboard/CompletedRides'
import CancelledRides from './Dashboard/CancelledRides'
import DilyEarning from './Dashboard/DilyEarning'
import RideHistory from './Dashboard/RideHistory'
import ProfileView from './Dashboard/ProfileView'
import HistoryEarning from './Dashboard/HistoryEarning'
import MonthlyEarning from './Dashboard/MonthlyEarning'
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import { useSearchParams } from 'next/navigation';

export default function Index({userType, userName}) {
  let params = useSearchParams();
    let tabs = params.get('tabs');
  
    let dispatch = useAppDispatch();
    useEffect(() => {
      dispatch(setUserInfo({ userName: userName, userType: userType }));
    }, []);


  return (
    <>

  <PageContainer title="Dashboard" description="This is dashbaord for driver">

    {tabs === null ? (<Box>
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


      {tabs === 'driver/dashboard/summary' && <ViewSummary />}
      {tabs === 'driver/dashboard/notifications' && <Notification />}
      {tabs === 'add-vhicles-services' && <VhicleServices />}
      {tabs === 'driver/my-rides/upcoming' && <UpComingRides />}
      {tabs === 'driver/my-rides/completed' && <CompletedRides />}
      {tabs === 'driver/my-rides/cancelled' && <CancelledRides />}
      {tabs === 'driver/earnings/daily' && <DilyEarning />}
      {tabs === 'driver/earnings/monthly' && <MonthlyEarning />}
      {tabs === 'driver/earnings/history' && <HistoryEarning />}
      {tabs === 'driver/ride-history/all' && <RideHistory />}
      {tabs === 'driver/profile/view' && <ProfileView />}
      

    </PageContainer>  
    </>
  )
}
