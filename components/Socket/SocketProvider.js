'use client'
import { SWC_KEYS, USER_ROLES } from "@constants";
import { getCookie } from "@node_modules/cookies-next/lib";
import React, { createContext } from "react";
import { io } from "socket.io-client";
export let  SocketProvider =  createContext()

export function SocketClient({children}){
  const socket = io(process.env.NEXT_PUBLIC_CLIENT_MEDIUM_URL, {
   reconnectionDelayMax: 10000,
        auth: {
        token: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        portal:USER_ROLES["driver-partner"]
        }
});

        return <>
            <SocketProvider.Provider value={{socket}}>
                    {children}
            </SocketProvider.Provider>
        </>

} 