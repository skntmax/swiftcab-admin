import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API
const userSlice = createApi({
  reducerPath: 'userApi',
  tagTypes: ['user-types' ,'register-user'],
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

     signupUser: builder.mutation({
        query: (body) => (  {
           url: 'v1/auth/signup',
           method: 'post',
            body:body
        }),
        providesTags:['register-user']
      },  
    )    ,

    loginUser: builder.mutation({
        query: (body) => (  {
           url: 'v1/auth/login',
           method: 'post',
            body:body
        }),
        providesTags:['login-user']
      },  
    )   

  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
  useGetUserQuery, useSignupUserMutation , useLoginUserMutation
} = userSlice;


export default userSlice