'use client'
import React, { useContext, useEffect, useRef, useState } from 'react';
import PageContainer from './../../components/container/PageContainer';
import AcceptRideModal from './AcceptOrCancelRider'
import  ViewSummary from './Dashboard/ViewSummary'
import  Notification from './Dashboard/Notification'
import UpComingRides from './Dashboard/UpComingRides'
import CompletedRides from './Dashboard/CompletedRides'
import CancelledRides from './Dashboard/CancelledRides'
import DilyEarning from './Dashboard/DilyEarning'
import RideHistory from './Dashboard/RideHistory'
import HistoryEarning from './Dashboard/HistoryEarning'
import MonthlyEarning from './Dashboard/MonthlyEarning'
import { useAppDispatch } from '@app/libs/store';
import { setUserInfo } from '@app/libs/slice/usersSlice';
import { useSearchParams } from 'next/navigation';
import { SocketProvider } from '@components/Socket/SocketProvider';
import { SOCKET_EVENTS } from '@constants';
import { RIDE_OFFER_POPUP_MS, REALTIME } from '@/constants/realtime';
import { getCookie } from 'cookies-next';
import { SWC_KEYS } from '@constants';
import StartRideOtpModal from './Dashboard/StartRideOtpModal'
import DriverProfilePageView from './driverProfilePageView' 
import EditDriverProfile from './portal/EditDriverProfile'
import ChangeDriverPassword from './portal/ChangeDriverPassword'
import UploadDocuments from './portal/UploadDocuments'
import ViewDocuments from './portal/ViewDocuments'
import DocumentStatus from './portal/DocumentStatus'
import ContactSupport from './portal/ContactSupport'
import DriverFaqs from './portal/DriverFaqs'
import DriverDutyHome from './Dashboard/DriverDutyHome'
import DriverOnboardingWizard from '@components/driver-onboarding/DriverOnboardingWizard'
import { useDriverActiveRideMutation, useDriverCompleteRideMutation, useGetDriverOnboardingMutation } from '@app/libs/apis/driver';
import SmartEarning from './portal/platform/SmartEarning'
import NetIncome from './portal/platform/NetIncome'
import Protection from './portal/platform/Protection'
import VehiclePro from './portal/platform/VehiclePro'
import Copilot from './portal/platform/Copilot'
import Growth from './portal/platform/Growth'

export default function Index({userType, userName}) {
  let params = useSearchParams();
    let tabs = params.get('tabs')?.trim() || null;
    const [ driverLoc, setDriverLoc ] = React.useState({lat:0,lng:0,driver:userName , time: new Date().toISOString(), isAvailable:true, isLoggedIn:true});
    const {socket, incomingRideRequests} = useContext(SocketProvider)
    let dispatch = useAppDispatch();
    const [rideRequests, setRideRequests] = useState([]);
    const [ignoredRideIds, setIgnoredRideIds] = useState(() => new Set());
    const [loadingIndex, setLoadingIndex] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [rideClaimed, setRideClaimed] = useState(false);
    const [rideStarted, setRideStarted] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelCompleted, setCancelCompleted] = useState(false);
    const [loadActiveRide] = useDriverActiveRideMutation();
    const [completeRide] = useDriverCompleteRideMutation();
    const [loadOnboarding] = useGetDriverOnboardingMutation();
    const [onboardingGate, setOnboardingGate] = useState('loading');
    const [ending, setEnding] = useState(false);
    const loadingIndexRef = useRef(null);
    const clearingRideRef = useRef(false);
    loadingIndexRef.current = loadingIndex;

    
    
    useEffect(() => {
      dispatch(setUserInfo({ userName: userName, userType: userType }));
    }, [dispatch, userName, userType]);

    useEffect(() => {
      let cancelled = false
      loadOnboarding()
        .then((res) => {
          if (cancelled) return
          const body = res?.data
          const data = body?.data ?? body
          if (!data?.found) {
            setOnboardingGate('pending')
            return
          }
          const status = data.case?.status
          if (status === 'APPROVED' && data.case?.completedAt) {
            setOnboardingGate('ready')
            return
          }
          setOnboardingGate(status === 'APPROVED' ? 'activate' : 'pending')
        })
        .catch(() => {
          if (!cancelled) setOnboardingGate('pending')
        })
      return () => {
        cancelled = true
      }
    }, [loadOnboarding]);

    useEffect(() => {
      let cancelled = false
      const restoreActiveRide = async () => {
        try {
          const response = await loadActiveRide().unwrap()
          const payload = response?.data || response
          if (cancelled || !payload?.isActiveRide || !payload?.result) {
            return
          }
          const mapped = mapDriverActiveRide(payload.result)
          setSelectedRide(mapped)
          setRideClaimed(true)
          setRideStarted(Boolean(payload.result.rideStarted || payload.result.otpVerified))
          if (!payload.result.otpVerified && !payload.result.rideStarted) {
            setShowOtpModal(true)
          }
        } catch (err) {
          console.warn('Could not restore driver active ride', err)
        }
      }
      restoreActiveRide()
      return () => {
        cancelled = true
      }
    }, [loadActiveRide]);

    // GPS only updates React state. Emit only after Socket.IO is connected.
    // Do not logout on effect cleanup — React Strict Mode remounts in dev and that
    // was publishing EV_DRIVER_LOGGED_OUT, which Kafka then used to drop the driver from GEO.
    useEffect(() => {
      if (!socket) return;

      const locationPayload = (lat, lng) => ({
        lat,
        lng,
        driver: userName,
        timestamp: new Date().toISOString(),
        isAvailable: true,
        isLoggedIn: true,
        access: "private",
        token: socket.auth?.token || `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN) || ""}`,
      });

      const emitLiveLocation = (lat, lng) => {
        if (!lat || !lng) return;
        socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, locationPayload(lat, lng));
      };

      const getLocation = () => {
        if (!navigator.geolocation) {
          console.warn("Geolocation is not supported by this browser.");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setDriverLoc((p) => ({
              ...p,
              lat,
              lng,
              driver: userName,
              timestamp: new Date().toISOString(),
              isAvailable: true,
              isLoggedIn: true,
            }));
            emitLiveLocation(lat, lng);
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
      };

      const startPinging = () => {
        getLocation();
      };

      socket.on("unauthorized", (info) => {
        console.error("Driver live location rejected:", info);
      });

      if (socket.connected) {
        startPinging();
      } else {
        socket.once("connect", startPinging);
      }

      const intervalId = setInterval(getLocation, 5000);

      const logout = () => {
        socket.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {
          driver: userName,
          isLoggedIn: false,
          access: "private",
          token: socket.auth?.token || `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN) || ""}`,
        });
      };
      window.addEventListener("beforeunload", logout);
      window.addEventListener("pagehide", logout);

      return () => {
        clearInterval(intervalId);
        socket.off("connect", startPinging);
        socket.off("unauthorized");
        window.removeEventListener("beforeunload", logout);
        window.removeEventListener("pagehide", logout);
      };
    }, [socket, userName]);


    const rideIdOf = (req) =>
      req?.universalRideId || req?.customerViewDetails?.correlationId;

    useEffect(() => {
      if (!incomingRideRequests?.length) return;
      setRideRequests((prev) => {
        const next = [...prev];
        for (const incoming of incomingRideRequests) {
          const rideId = rideIdOf(incoming);
          if (rideId && ignoredRideIds.has(rideId)) continue;
          if (rideId && next.some((req) => rideIdOf(req) === rideId)) continue;
          next.push({
            ...incoming,
            offeredAt: Date.now(),
          });
        }
        return next.slice(-REALTIME.RIDE_OFFER_STACK_MAX);
      });
    }, [incomingRideRequests, ignoredRideIds]);

    useEffect(() => {
      const timer = setInterval(() => {
        const now = Date.now();
        const accepting = loadingIndexRef.current;
        const expiredIds = [];
        setRideRequests((prev) =>
          prev.filter((req, i) => {
            if (i === accepting) return true;
            const alive = now - Number(req.offeredAt || now) < RIDE_OFFER_POPUP_MS;
            if (!alive) {
              const id = rideIdOf(req);
              if (id) expiredIds.push(id);
            }
            return alive;
          }),
        );
        if (expiredIds.length) {
          setIgnoredRideIds((prev) => {
            const next = new Set(prev);
            expiredIds.forEach((id) => next.add(id));
            return next;
          });
        }
      }, 250);
      return () => clearInterval(timer);
    }, []);

      useEffect(() => {
        if (!socket) return

      socket.on(SOCKET_EVENTS?.RIDE_INTIATED_BY_DRIVER, (data) => {
      console.log("🚖 RIDE_INTIATED_BY_DRIVER", data);
      setLoadingIndex(null);
      setRideClaimed(true);
      setRideStarted(false);
      setShowOtpModal(true);
      setRideRequests([]);
      setSelectedRide((current) => mergeInitiatedRide(current, data));
      });


       //  when customer or driver cancels the ride
        const clearActiveRide = (data) => {
          if (clearingRideRef.current) {
            return;
          }
          clearingRideRef.current = true;
          setOtpLoading(false);
          setShowOtpModal(false);
          setLoadingIndex(null);
          setRideClaimed(false);
          setRideStarted(false);
          setSelectedRide(null);
          setCancelling(false);
          setCancelCompleted(true);
          const message = data?.message
            || (data?.cancelledBy === 'driver' ? 'Ride cancelled by driver' : 'Ride cancelled by customer');
          alert(message);
          window.setTimeout(() => {
            clearingRideRef.current = false;
          }, 1500);
        };

        socket.on(SOCKET_EVENTS?.CUSTOMER_CANCELLED_RIDE, clearActiveRide);
        socket.on(SOCKET_EVENTS?.DRIVER_CANCELLED_RIDE, clearActiveRide);


        
       //  when customer cancels the ride
        socket.on(SOCKET_EVENTS?.RIDE_ALREADY_TAKEN, (data) => {
        console.log("🚖 ride already taken by another driver ", data);
        const rideId = data?.universalRideId
        const driverBusy = data?.reason === "DRIVER_BUSY";
        if (rideId && !driverBusy) {
          setIgnoredRideIds((prev) => {
            const next = new Set(prev)
            next.add(rideId)
            return next
          })
        }
        alert(data?.message || "Ride has been already booked");
        setLoadingIndex(null);
        setShowOtpModal(false);
        setRideClaimed(false);
        setRideStarted(false);
        setSelectedRide((current) => {
          if (rideId && current?.universalRideId && current.universalRideId !== rideId) {
            return current
          }
          return null
        });
        if (!driverBusy) {
          setRideRequests((prev) =>
            rideId ? prev.filter((req) => req?.universalRideId !== rideId) : prev,
          );
        }
        });


        //
        socket.on(SOCKET_EVENTS.INVALID_RIDE_OTP, () => {
          setOtpLoading(false);
          alert("Invalid OTP");
        });
        

        
        //
        socket.on(SOCKET_EVENTS.RIDE_STARTED, (rideObj) => {
          setOtpLoading(false);
          setShowOtpModal(false);
          setRideStarted(true);
          console.log("OTP verified, ride started", rideObj);
        });

        socket.on(SOCKET_EVENTS.RIDE_COMPLETED, () => {
          if (clearingRideRef.current) {
            return;
          }
          clearingRideRef.current = true;
          setOtpLoading(false);
          setShowOtpModal(false);
          setLoadingIndex(null);
          setRideClaimed(false);
          setRideStarted(false);
          setSelectedRide(null);
          setEnding(false);
          alert("Ride completed");
          window.setTimeout(() => {
            clearingRideRef.current = false;
          }, 1500);
        });

        return () => {
          socket.off(SOCKET_EVENTS?.RIDE_INTIATED_BY_DRIVER);
          socket.off(SOCKET_EVENTS?.CUSTOMER_CANCELLED_RIDE);
          socket.off(SOCKET_EVENTS?.DRIVER_CANCELLED_RIDE);
          socket.off(SOCKET_EVENTS?.RIDE_ALREADY_TAKEN);
          socket.off(SOCKET_EVENTS.INVALID_RIDE_OTP);
          socket.off(SOCKET_EVENTS.RIDE_STARTED);
          socket.off(SOCKET_EVENTS.RIDE_COMPLETED);
        };
      }, [socket]);

          
    const handleAccept = (index) => {
      const userInfo = rideRequests[index];
      setLoadingIndex(index);
      setSelectedRide(userInfo);
      socket.emit(SOCKET_EVENTS.DRIVER_ACCEPTED_THE_RIDE, {...userInfo , access: "private"});
    };

    const handleClose = (index) => {
      const rideId = rideIdOf(rideRequests[index]);
      if (rideId) {
        setIgnoredRideIds((prev) => {
          const next = new Set(prev);
          next.add(rideId);
          return next;
        });
      }
      setRideRequests((prev) => prev.filter((_, i) => i !== index));
    };


    const handleOtpVerify = (otp) => {
     if (!selectedRide) return;

      setOtpLoading(true); // start  otp varification loader

      socket.emit(SOCKET_EVENTS.OTP_VARIFICATION, {
        customer: {
          username: selectedRide?.userDetails?.username,
          id: selectedRide?.userDetails?.id,
        },
        driver: {
          username: selectedRide?.driverDetails?.username || userName,
          id: selectedRide?.driverDetails?.id,
        },
        userInputOtp: otp,
        universalRideId: selectedRide?.universalRideId,
        access: "private",
      });

      // setShowOtpModal(false);
      // setSelectedRide(null);
    };

    const handleEndRide = async () => {
      if (!selectedRide) {
        return;
      }
      setEnding(true);
      try {
        await completeRide({
          rideId: selectedRide.rideId,
          universalRideId: selectedRide.universalRideId,
        }).unwrap();
        clearingRideRef.current = true;
        if (socket) {
          socket.emit(SOCKET_EVENTS.DRIVER_ENDED_THE_RIDE, {
            ...selectedRide,
            access: "private",
            token: socket.auth?.token || `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN) || ""}`,
          });
        }
        setShowOtpModal(false);
        setRideClaimed(false);
        setRideStarted(false);
        setSelectedRide(null);
        setEnding(false);
        alert("Ride completed");
        window.setTimeout(() => {
          clearingRideRef.current = false;
        }, 1500);
      } catch (err) {
        setEnding(false);
        const message =
          err?.data?.message ||
          err?.data?.data ||
          err?.message ||
          "Could not end the ride. Start it with OTP first, then try again.";
        alert(typeof message === "string" ? message : "Could not end the ride");
      }
    };

    const handleCancelRide = (cancelReason) => {
      if (!selectedRide || !socket) {
        return Promise.resolve(false);
      }
      setCancelling(true);
      setCancelCompleted(false);
      return new Promise((resolve) => {
        socket.emit(
          SOCKET_EVENTS.DRIVER_CANCELLED_RIDE,
          {
            ...selectedRide,
            cancelReason,
            access: "private",
            token: socket.auth?.token || `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN) || ""}`,
          },
          () => resolve(true),
        );
        window.setTimeout(() => resolve(true), 8000);
      });
    };


    const pickupPoint = selectedRide?.customerViewDetails
      ? {
          lat: Number(selectedRide.customerViewDetails.pickup_lat),
          lng: Number(selectedRide.customerViewDetails.pickup_lng),
        }
      : null;
    const dropPoint = selectedRide?.customerViewDetails
      ? {
          lat: Number(selectedRide.customerViewDetails.drop_lat),
          lng: Number(selectedRide.customerViewDetails.drop_lng),
        }
      : null;
    const driverPoint =
      driverLoc?.lat && driverLoc?.lng
        ? { lat: Number(driverLoc.lat), lng: Number(driverLoc.lng) }
        : null;

    
  return (
    <>

  <PageContainer title="Dashboard" description="This is dashbaord for driver">

    {tabs === null && (onboardingGate === 'pending' || onboardingGate === 'activate') ? (
      <div style={{ maxWidth: 720, margin: '0 auto', background: '#0b0b0b', borderRadius: 16, padding: 20, border: '1px solid rgba(196,248,42,0.18)' }}>
        <DriverOnboardingWizard
          embedded
          onFinished={() => setOnboardingGate('ready')}
        />
      </div>
    ) : tabs === null ? (
      <DriverDutyHome
        userName={userName}
        socket={socket}
        rideClaimed={rideClaimed}
        selectedRide={selectedRide}
        driverPoint={driverPoint}
        pickupPoint={pickupPoint}
        dropPoint={dropPoint}
        offerCount={rideRequests.length}
        rideStarted={rideStarted}
        cancelling={cancelling}
        cancelCompleted={cancelCompleted}
        onCancelRide={handleCancelRide}
        onEnterOtp={() => setShowOtpModal(true)}
        onEndRide={handleEndRide}
        ending={ending}
      />
    ) : (
      <>
        {tabs === 'driver/dashboard/summary' && <ViewSummary />}
        {tabs === 'driver/dashboard/notifications' && <Notification />}
        {tabs === 'driver/my-rides/upcoming' && <UpComingRides />}
        {tabs === 'driver/my-rides/completed' && <CompletedRides />}
        {tabs === 'driver/my-rides/cancelled' && <CancelledRides />}
        {tabs === 'driver/earnings/daily' && <DilyEarning />}
        {tabs === 'driver/earnings/monthly' && <MonthlyEarning />}
        {tabs === 'driver/earnings/history' && <HistoryEarning />}
        {tabs === 'driver/ride-history/all' && <RideHistory />}
        {tabs === 'driver/ride-history/filter' && <RideHistory />}
        {tabs === 'driver/profile/view' && <DriverProfilePageView />}
        {tabs === 'driver/profile/edit' && <EditDriverProfile />}
        {tabs === 'driver/profile/password' && <ChangeDriverPassword />}
        {tabs === 'driver/documents/upload' && <UploadDocuments />}
        {tabs === 'driver/documents/view' && <ViewDocuments />}
        {tabs === 'driver/documents/status' && <DocumentStatus />}
        {tabs === 'driver/support/contact' && <ContactSupport />}
        {tabs === 'driver/support/faqs' && <DriverFaqs />}
        {tabs === 'driver/platform/smart-earning' && <SmartEarning />}
        {tabs === 'driver/platform/net-income' && <NetIncome />}
        {tabs === 'driver/platform/protection' && <Protection />}
        {tabs === 'driver/platform/vehicle' && <VehiclePro />}
        {tabs === 'driver/platform/copilot' && <Copilot />}
        {tabs === 'driver/platform/growth' && <Growth />}
      </>
    )}

      <StartRideOtpModal
        open={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setLoadingIndex(null);
        }}
        onVerify={handleOtpVerify}
         loading={otpLoading}
      />
      
    </PageContainer>

    {!showOtpModal && rideRequests.map((req, index) => (
      <AcceptRideModal
        key={rideIdOf(req) || index}
        open={true}
        rideData={req}
        offeredAt={req.offeredAt}
        stackIndex={index}
        onClose={() => handleClose(index)}
        onAccept={() => handleAccept(index)}
        loading={loadingIndex === index}
      />
    ))}
    </>
  )
}

function mapDriverActiveRide(result) {
  if (!result) {
    return null
  }
  return {
    rideId: result.rideId,
    universalRideId: result.universalRideId,
    otp: result.otp,
    otpVerified: result.otpVerified,
    rideStarted: result.rideStarted,
    totalFare: result.totalFare,
    customerViewDetails: {
      pickup_name: result.pickup?.name,
      pickup_lat: result.pickup?.lat,
      pickup_lng: result.pickup?.lng,
      drop_name: result.destination?.name,
      drop_lat: result.destination?.lat,
      drop_lng: result.destination?.lng,
      correlationId: result.customer?.correlationId,
    },
    userDetails: {
      id: result.customer?.id,
      username: result.customer?.username,
      first_name: result.customer?.first_name,
      last_name: result.customer?.last_name,
      avatar: result.customer?.avatar,
      phone_no: result.customer?.phone_no,
    },
    driverDetails: {
      id: result.driver?.id,
      username: result.driver?.username,
    },
    customer: result.customer,
    driver: result.driver,
    pickup: result.pickup,
    destination: result.destination,
  }
}

function mergeInitiatedRide(current, data) {
  if (!data) {
    return current
  }
  return {
    ...(current || {}),
    rideId: data.rideId ?? current?.rideId,
    universalRideId: data.universalRideId ?? current?.universalRideId,
    otp: data.otp ?? current?.otp,
    driver: data.driver || current?.driver,
    pickup: data.pickup || current?.pickup,
    destination: data.destination || current?.destination,
    customerViewDetails: {
      ...(current?.customerViewDetails || {}),
      pickup_name: data.pickup?.name ?? current?.customerViewDetails?.pickup_name,
      pickup_lat: data.pickup?.lat ?? current?.customerViewDetails?.pickup_lat,
      pickup_lng: data.pickup?.lng ?? current?.customerViewDetails?.pickup_lng,
      drop_name: data.destination?.name ?? current?.customerViewDetails?.drop_name,
      drop_lat: data.destination?.lat ?? current?.customerViewDetails?.drop_lat,
      drop_lng: data.destination?.lng ?? current?.customerViewDetails?.drop_lng,
    },
    driverDetails: {
      ...(current?.driverDetails || {}),
      id: data.driver?.id ?? current?.driverDetails?.id,
      username: data.driver?.username ?? current?.driverDetails?.username,
    },
    userDetails: {
      ...(current?.userDetails || {}),
      ...(data.customer || {}),
      phone_no:
        data.customer?.phone_no ??
        current?.userDetails?.phone_no ??
        data.userDetails?.phone_no,
    },
    customer: data.customer ?? current?.customer,
  }
}
