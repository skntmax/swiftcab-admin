'use client'
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from './../../components/container/PageContainer';
import AcceptRideModal from './AcceptOrCancelRider'
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
import { SocketProvider } from '@components/Socket/SocketProvider';
import { SOCKET_EVENTS } from '@constants';
import { getUserInfo } from '@utils';
import { useSendLiveLocationMutation } from '@app/libs/apis/socketApi';
import  DriverProfilePageView from './driverProfilePageView' 

export default function Index({userType, userName}) {
  let params = useSearchParams();
    let tabs = params.get('tabs');
    const [ driverLoc, setDriverLoc ] = React.useState({lat:0,lng:0,driver:userName , time: new Date().toISOString(), isAvailable:true});
   const [sendLiveLocation ,  {data:sendLiveLocationData ,isLoading:sendLiveLocationLoading }] = useSendLiveLocationMutation()
    const {socket} = useContext(SocketProvider)
    let dispatch = useAppDispatch();
    const [rideRequests, setRideRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingIndex, setLoadingIndex] = useState(null);

    
    
    //  save user info in redux store
    useEffect(() => {
      dispatch(setUserInfo({ userName: userName, userType: userType }));
      // socket connection 
      // socket.on('connect', () => {
      // console.log('✅ Connected to socket server:', socket.id);
      //  });

    return ()=>{ 
       socket?.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {...driverLoc ,isLoggedIn:false }  )  // reset the driver location from the redis stack  
    }
    }, []);




    // sending live location in every 5 seconds to driver pool  kafka topic 
      useEffect(() => {
        if(driverLoc?.lat && driverLoc?.lng) {
          socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, driverLoc  )   
        }
    }, [driverLoc]);


    // responsible for sending live location of driver to server in every 5 sec interval 
      useEffect(() => {
          const getLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              // console.log("Current Location:", { lat, lng , driver:userName  });
              setDriverLoc(p=>  ({...p,lat, lng , driver:userName ,timestamp: new Date().toISOString() ,isAvailable:driverLoc.isAvailable  ,isLoggedIn:true }));
            },
            (error) => {
              console.error("Geolocation error:", error);
            }
          );
        } else {
          console.warn("Geolocation is not supported by this browser.");
        }
      };

    // Fetch immediately
    getLocation();

    // Fetch every 5 seconds
    const intervalId = setInterval(getLocation, 5000);

    return () => {
      clearInterval(intervalId)
    }; // Cleanup on unmount
      },[])


      useEffect(() => {
        if (!socket) return;

        const handleRideRequest = (data) => {
          setRideRequests(prev => [...prev, data]); // append to the queue
        };

        socket.on(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);

      socket.on(SOCKET_EVENTS?.RIDE_INTIATED_BY_DRIVER, (data) => {
      console.log("🚖 RIDE_INTIATED_BY_DRIVER", data);
      setLoadingIndex(null);
      // setDriverData(data);
      // setShowDriverPopup(true);
      // dispatch(toggleStep({ step: 4 }));
      });


        return () => {
          socket.off(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);
        };
      }, [socket]);

          
    const handleAccept = (index) => {
      const userInfo = rideRequests[index];
      console.log("userInfo", userInfo);

      // mark this ride as loading
      setLoadingIndex(index);

      socket.emit(SOCKET_EVENTS.DRIVER_ACCEPTED_THE_RIDE, userInfo);
      // setRideRequests(prev => prev.filter((_, i) => i !== index));
    };

    const handleClose = (index) => {
      console.log("handleClose", index)
        setRideRequests(prev => prev.filter((_, i) => i !== index));
    };


    
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
      {tabs === 'driver/profile/view' && <DriverProfilePageView />}
      
    </PageContainer>

    {rideRequests.map((req, index) => (
      <AcceptRideModal
        key={req.customerViewDetails?.correlationId || index}
        open={true}
        rideData={req}
        onClose={() => handleClose(index)}
        onAccept={() => handleAccept(index)}
        loading={loadingIndex === index}   // 👈 pass loading flag
      />
    ))}
    </>
  )
}
