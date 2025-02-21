import { SWC_KEYS } from '@constants';
import { getCookie } from '@node_modules/cookies-next/lib';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';

export const fetchUserRoles = createAsyncThunk(
  'userRoles',
  async ( thunkAPI) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/get-all-roles`);
    return response.data?.data;
  }
  
);

const userRolesSlice = createSlice({
  name: 'userRoles',
  initialState: {
    list: [],
    loader:false, 
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default userRolesSlice;