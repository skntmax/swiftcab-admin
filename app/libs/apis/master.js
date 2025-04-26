
'use client'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from './../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';

// Define the base API
const masterApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['vhicle-types' ,],
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({ 
     getVhicleTypes: builder.mutation({
            query: (body) => (  {
               url: urls.get_vhicle_type,
               method: 'GET',
               headers: {
                authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
              },
            }),
            providesTags:['vhicle-types']
          },  
      ),    
  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
 useGetVhicleTypesMutation 
} = masterApi;


export default masterApi