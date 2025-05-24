import { createSlice } from '@reduxjs/toolkit'

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
     baseUrl:"",
  },
  reducers: {
    setBaseUrl(state, action) {
       const {baseUrl} = action.payload

       state.baseUrl = baseUrl
    },
   
  }
})

export const { setBaseUrl } = profileSlice.actions
export default profileSlice