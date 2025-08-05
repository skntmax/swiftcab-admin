
'use client'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from './../../../constants/urls'
import { encryptedBaseQuery } from './encryptedBaseQuery';

// Define the base API
const usersApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['user-types' ,'register-user'],
  baseQuery:process.env.NEXT_PUBLIC_API_ENCRYPT==="true"?encryptedBaseQuery():fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),    
  endpoints: (builder) => ({ 
     getUser: builder.query({
            query: (body) => (  {
               url: urls.get_role,
               method: 'GET',
                //    headers:{
                //     "authorization": `Bearer ${getCookie(constants.btcode_live_cd_key)}`,
                //     "Content-Type": "appliation/json"   
                //      }
            }),
            providesTags:['user-types']
          },  
      ),

     signupUser: builder.mutation({ 
        query: (body) => (  {
           url: 'v1/auth/signup',
           method: 'post',
            body:body
        }),
        providesTags:['register-user']
      },  
     ),

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
} = usersApi;


export default usersApi