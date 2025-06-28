import { createSlice } from '@reduxjs/toolkit'

const usersSlice = createSlice({
  name: 'usersInfo',
  initialState: {
     userType:"",
     userName:""
  },
  reducers: {
    setUserInfo(state, action) {
       const {userType , userName} = action.payload
       state.userName = userName
       state.userType = userType
    },
   
  }
})

export const { setUserInfo } = usersSlice.actions
export default usersSlice