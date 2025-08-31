import { SWC_KEYS } from '@constants';
import { getCookie } from '@node_modules/cookies-next/lib';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { capitalizeFirstLetter } from '@utils';
import axios from 'axios';

export const fetchGlobalNavPermissions = createAsyncThunk(
  'navbar-perm-list',
  async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/master/get-menu-permissions`, {
      headers: {
        authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
      },
    } );
    return response.data?.data;
  }
);

const navPermSlice = createSlice({
  name: 'navbar-perm-list',
  initialState: {
    list: [],
    loader:false, 
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalNavPermissions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGlobalNavPermissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload?.permissions;
      })
      .addCase(fetchGlobalNavPermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default navPermSlice;