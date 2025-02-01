'use client'
import React, { useContext, useEffect } from 'react'
import { Grid, Box, colors } from '@mui/material';
import PageContainer from './components/container/PageContainer';
// components
import SalesOverview from './components/dashboard/SalesOverview';
import YearlyBreakup from './components/dashboard/YearlyBreakup';
import RecentTransactions from './components/dashboard/RecentTransactions';
import ProductPerformance from './components/dashboard/ProductPerformance';
import Blog from './components/dashboard/Blog';
import MonthlyEarnings from './components/dashboard/MonthlyEarnings';
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import { useSearchParams } from '@node_modules/next/navigation';
import TypographyPage from './utilities/typography/page';
import Shadow from './utilities/shadow/page';
import Icons from './icons/page';
import SamplePage from './sample-page/page';
function UsersDashboard({userType , userName}) {
  
  let params = useSearchParams()
  let tabs = params.get('tabs')
  

    let dispatch = useAppDispatch()
    useEffect(()=>{
        dispatch(setUserInfo({userName:userName , userType:userType}))
        
    }, [userType ,  userName])

    return (
     <>
     <PageContainer title="Dashboard" description="this is Dashboard" >
       {tabs==null? <Box>
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
      </Box>:""}
      

      {tabs=="typography" && <TypographyPage />}
      {tabs=="shadow" && <Shadow />}
      {tabs=="icons" && <Icons />}
      {tabs=="sample-page" && <SamplePage />}
    
    

    </PageContainer>
      </>
  )
}

export default UsersDashboard
