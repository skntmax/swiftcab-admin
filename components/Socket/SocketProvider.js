'use client'
import { SWC_KEYS, USER_ROLES } from "@constants";
import { getCookie } from "@node_modules/cookies-next/lib";
import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";
export let  SocketProvider =  createContext()

export function SocketClient({children}){
         
   const [ socket , setSocket ] = React.useState(null)

   useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_CLIENT_MEDIUM_URL, {
        transports: ["websocket"], // avoid long polling
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 5000, // wait 5s before trying to reconnect
        reconnectionDelayMax: 10000,
        auth: {
        token: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        portal:USER_ROLES["driver-partner"],
        portal:"driver-portal",
        }
    });

    setSocket(newSocket);
    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
    });

    newSocket.on("ride-update", (data) => {
      console.log("Ride Update:", data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

        return <>
            <SocketProvider.Provider value={{socket}}>
                    {children}
            </SocketProvider.Provider>
        </>

} 