'use client'
import React, { createContext } from "react";
import { io } from "socket.io-client";
export let  SocketProvider =  createContext()

export function SocketClient({children}){
  const socket = io(process.env.NEXT_PUBLIC_CLIENT_MEDIUM_URL, {
  reconnectionDelayMax: 10000,
   query: {
    "my-key": "my-value"
  }
});

        return <>
            <SocketProvider.Provider value={{socket}}>
                    {children}
            </SocketProvider.Provider>
        </>

} 