
import { configureStore } from '@reduxjs/toolkit'
import todosSlice from './slice/counterslice'
import userSlice from './apis/user'
export const reduxStore = configureStore({
  reducer: {
    todos: todosSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>getDefaultMiddleware().concat(userSlice.middleware),
})


