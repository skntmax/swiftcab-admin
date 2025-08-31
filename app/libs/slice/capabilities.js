import { SWC_KEYS } from '@constants';
import { getCookie } from '@node_modules/cookies-next/lib';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { capitalizeFirstLetter } from '@utils';
import axios from 'axios';

export const fetchGlobalCapability = createAsyncThunk(
  'capability-list',
  async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/get-capabilities`, {
      headers: {
        authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
      },
    } );
    return response.data?.data;
  }
  
);

const capabilitySlice = createSlice({
  name: 'capability-list',
  initialState: {
    list: [],
    loader:false, 
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalCapability.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGlobalCapability.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload?.data;
      })
      .addCase(fetchGlobalCapability.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default capabilitySlice;