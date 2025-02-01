
'use client'
import { configureStore } from '@reduxjs/toolkit'
import todosSlice from './slice/counterslice'
import userSlice from './apis/user'
import { useDispatch, useSelector } from '@node_modules/react-redux/dist/react-redux'
export const reduxStore = configureStore({
  reducer: {
    todos: todosSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>getDefaultMiddleware().concat(userSlice.middleware),
})


// ✅ Correct way to create a custom useSelector hook
export const useAppSelector = (selector) => useSelector(selector);

// ✅ Correct way to create a custom useDispatch hook
export const useAppDispatch = () => useDispatch()