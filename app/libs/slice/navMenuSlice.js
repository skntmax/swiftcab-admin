import { SWC_KEYS } from '@constants';
import { getCookie } from '@node_modules/cookies-next/lib';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetGlobalNavbar = createAsyncThunk(
  'navMenu',
  async ({userType}, thunkAPI) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/${userType}/get-nav`, {
      headers: {
        authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
      },
    } );
    return response.data?.data;
  }
  
);

const navbarSlice = createSlice({
  name: 'navbar-menu',
  initialState: {
    navbar: null,
    loader:false, 
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetGlobalNavbar.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetGlobalNavbar.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.navbar = action.payload;
      })
      .addCase(fetGlobalNavbar.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default navbarSlice;