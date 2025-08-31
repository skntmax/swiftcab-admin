'use client'
import { createContext, useState } from "react"
import { useAppSelector } from "@app/libs/store";
export const ReduxProvider = createContext() 

export default function UseReduxSelector({children}){
    let userInfo =  useAppSelector(ele=>ele.usersInfo)
    let [extraPath ,  setExtraPaths] =  useState({
         active:"",
         list:[],
         params:""
    })

    const setActiveExtraPath = (path, params=null)=>{
         setExtraPaths({
            ...extraPath,
            active:path,
            params
         })
    }

    let  reduxValues = {
        userInfo ,
    }

    return <ReduxProvider.Provider value={{reduxValues,setActiveExtraPath, activeExtraPath : extraPath.active,}} >
             {children}   
            </ReduxProvider.Provider>

}