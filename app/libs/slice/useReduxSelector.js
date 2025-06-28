'use client'
import { createContext } from "react"
import { useAppSelector } from "@app/libs/store";
export const ReduxProvider = createContext() 

export default function UseReduxSelector({children}){
    let userInfo =  useAppSelector(ele=>ele.usersInfo)

    let  reduxValues = {
        userInfo ,
    }

    return <ReduxProvider.Provider value={reduxValues} >
          {children}   
            </ReduxProvider.Provider>

}