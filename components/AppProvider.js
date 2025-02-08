'use client'
import React, { createContext } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import { useGetCookies, useSetCookie, useHasCookie, useDeleteCookie, useGetCookie } from 'cookies-next';

  
export let contextProvider = createContext(null)

function AppProvider({children}) {
    const setCookie = useSetCookie();
  const hasCookie = useHasCookie();
  const deleteCookie = useDeleteCookie();
  const getCookies = useGetCookies();
  const getCookie = useGetCookie();

   const  successMessage =(msg)=>{
                toast.success(msg)
   }
    
   const  errorMessage =(msg)=>{
    toast.error(msg)
   }

return (
            <>
                <contextProvider.Provider value={{successMessage ,  errorMessage , getCookie, getCookies, setCookie, deleteCookie, hasCookie }}>
                    {children}
                </contextProvider.Provider>
                <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                // transition={Bounce}
                />

            </>
        )
}

export default AppProvider
