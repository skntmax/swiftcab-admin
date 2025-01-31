import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API
const userSlice = createApi({
  reducerPath: 'userApi',
  tagTypes: ['user-types'],
  baseQuery: fetchBaseQuery({ baseUrl: 'http://swiftcab-api.365itsolution.com/' }),
  endpoints: (builder) => ({ 
     getUser: builder.query({
            query: (body) => (  {
               url: 'v1/owner/get-user-types',
               method: 'GET',
            //    headers:{
            //     "authorization": `Bearer ${getCookie(constants.btcode_live_cd_key)}`,
            //     "Content-Type": "appliation/json"   
            //      }
            }),
            providesTags:['user-types']
          },  
      )            
     ,
  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
  useGetUserQuery,
} = userSlice;


export default userSlice