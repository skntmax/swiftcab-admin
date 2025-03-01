
'use client'
import { configureStore } from '@reduxjs/toolkit'
import todosSlice from './slice/counterslice'
import userApi from './apis/user'
import usersSlice from './slice/usersSlice'
import { useDispatch, useSelector } from '@node_modules/react-redux/dist/react-redux'
import ownerApi from './apis/owner'
import navbarSlice from './slice/navMenuSlice'
import adminApi from './apis/admin'
import userRolesSlice from './slice/userRolesSlice' 
export const reduxStore = configureStore({
  reducer: {
     [usersSlice.reducerPath]:usersSlice.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [ownerApi.reducerPath]: ownerApi.reducer,
    [navbarSlice.reducerPath]:navbarSlice.reducer,
    [adminApi.reducerPath]:adminApi.reducer,
    [userRolesSlice.reducerPath]:userRolesSlice.reducer 
    
  },
  middleware: (getDefaultMiddleware) =>getDefaultMiddleware().concat(
    userApi.middleware,
    ownerApi.middleware ,
    adminApi.middleware
  ),
})


// ✅ Correct way to create a custom useSelector hook
export const useAppSelector = (selector) => useSelector(selector);

// ✅ Correct way to create a custom useDispatch hook
export const useAppDispatch = () => useDispatch()