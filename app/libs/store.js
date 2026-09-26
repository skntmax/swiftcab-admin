
'use client'
import { configureStore } from '@reduxjs/toolkit'
import todosSlice from './slice/counterslice'
import userApi from './apis/user'
import usersSlice from './slice/usersSlice'
import { useDispatch, useSelector } from 'react-redux'
import ownerApi from './apis/owner'
import navbarSlice from './slice/navMenuSlice'
import adminApi from './apis/admin'
import masterApi from './apis/master'
import userRolesSlice from './slice/userRolesSlice' 
import profileSlice from './slice/profile'
import driversApi from './apis/driver'
import walletApi from './apis/wallet'
import socketsApi from './apis/socketApi'
import capabilitySlice from './slice/capabilities'
import navPermSlice from './slice/navPermissions'
export const reduxStore = configureStore({
  reducer: {
    [usersSlice.reducerPath]:usersSlice.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [ownerApi.reducerPath]: ownerApi.reducer,
    [navbarSlice.reducerPath]:navbarSlice.reducer,
    [adminApi.reducerPath]:adminApi.reducer,
    [masterApi.reducerPath]:masterApi.reducer,
    [userRolesSlice.reducerPath]:userRolesSlice.reducer,
    [capabilitySlice.reducerPath]:capabilitySlice.reducer,
    [navPermSlice.reducerPath]:navPermSlice.reducer,
    [profileSlice.reducerPath]:profileSlice.reducer ,
    [driversApi.reducerPath]:driversApi.reducer,
    [walletApi.reducerPath]:walletApi.reducer,
    [socketsApi.reducerPath]:socketsApi.reducer,
    
  },
  middleware: (getDefaultMiddleware) =>getDefaultMiddleware().concat(
    userApi.middleware,
    ownerApi.middleware ,
    adminApi.middleware,
    masterApi.middleware,
    driversApi.middleware,
    walletApi.middleware,
    socketsApi.middleware
  ),
})


// ✅ Correct way to create a custom useSelector hook
export const useAppSelector = (selector) => useSelector(selector);

// ✅ Correct way to create a custom useDispatch hook
export const useAppDispatch = () => useDispatch()