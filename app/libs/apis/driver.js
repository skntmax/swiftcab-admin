
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from '../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';

// Define the base API
const driversApi = createApi({
  reducerPath: 'driversApi',
  tagTypes: ["get-driver-details"],
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
  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
  useDriverDetailsMutation
} = driversApi;


export default driversApi