
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from '../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';
import { encryptedBaseQuery } from './encryptedBaseQuery';

// Define the base API
const socketsApi = createApi({
  reducerPath: 'socketsApi',
  tagTypes: ["driver-live-location"],
    baseQuery:process.env.NEXT_PUBLIC_API_ENCRYPT==="true"?encryptedBaseQuery({baseUrl:process.env.NEXT_PUBLIC_API_URL}):fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),    
  
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_CLIENT_MEDIUM_URL }),
  endpoints: (builder) => ({ 
     sendLiveLocation: builder.mutation({ 
        query: (body) => (  {
           url: urls.driver_live_location,
           method: 'post',
        //   headers: {
        //               authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        //             },
            body:body
        }),
        providesTags:['driver-live-location']
      },  
     ),

  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
  
    useSendLiveLocationMutation
} = socketsApi;


export default socketsApi