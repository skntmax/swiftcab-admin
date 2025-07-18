
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from '../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';

// Define the base API
const driversApi = createApi({
  reducerPath: 'driversApi',
  tagTypes: ["get-driver-details","get-banks","get-bank-branch","get-driver-list","update-driver-details"],
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({ 
     driverDetails: builder.mutation({ 
        query: (body) => (  {
           url: urls.get_driver_details,
           method: 'GET',
          headers: {
                      authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            // body:body
        }),
        providesTags:['get-driver-details']
      },  
     ),

      getBanks: builder.mutation({ 
        query: (body) => (  {
           url: urls.get_banks,
           method: 'GET',
          headers: {
                      // authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            // body:body
        }),
        providesTags:['get-banks']
      },  
     ),

      getBankBranch: builder.mutation({ 
        query: (query) => (  {
           url: `${urls.get_bank_branch}?${query}`,
           method: 'GET',
          headers: {
                      // authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            // body:body
        }),
        providesTags:['get-bank-branch']
      },  
     ),

      getDriverList: builder.mutation({ 
        query: (query) => (  {
           url: `${urls.get_driver_list}`,
           method: 'GET',
          headers: {
                      // authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            // body:body
        }),
        providesTags:['get-driver-list']
      },  
     ),

      updateDriverDetails: builder.mutation({ 
        query: (body) => (  {
           url: `${urls.update_driver_details}`,
           method: 'post',
          headers: {
                      authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            body:body
        }),
        providesTags:['update_driver_details']
      },  
     ),



  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
  useDriverDetailsMutation,useGetBanksMutation, useGetBankBranchMutation , useGetDriverListMutation , useUpdateDriverDetailsMutation
} = driversApi;


export default driversApi