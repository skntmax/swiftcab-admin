
'use client'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from './../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';

// Define the base API
const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['all-users' ,'register-user' , 'vhicle-detail' , 'update-kyc-details' ,'remove-user-by-username','updateRoles',"navbar-list","add-subnavbar","add-menu-roles","get-driver-detail-by-userid","ams-drivers"],
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({ 
     getAllUsers: builder.mutation({
            query: (body) => (  {
               url: urls.get_active_users,
               method: 'POST',
               body:body ,
               headers: {
                authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
              },
            }),
            providesTags:['all-users']
          },  
      ),


      getVhicleDetails: builder.mutation({
        query: (body) => (  {
           url:urls.get_vhicle_details ,
           method: 'POST',
           body:body,
           headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['vhicle-detail']
        },  
    ),

    updateKycStatus: builder.mutation({
      query: (body) => (  {
         url:urls.update_kyc_status ,
         method: 'POST',
         body:body,
         headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
        }),
        providesTags:['update-kyc-details']
      },  
      ),

      removeUser: builder.mutation({
        query: (body) => (  {
           url:urls.remove_user_by_username ,
           method: 'POST',
           body:body,
           headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['remove-user-by-username'],
          invalidatesTags: ['all-users']
        },  
        ),


      blockUnblockUser: builder.mutation({
          query: (body) => (  {
             url:urls.block_unblock_user ,
             method: 'POST',
             body:body,
             headers: {
              authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
            },
            }),
            providesTags:['block-unblock-user'],
          },  
          ),
  

      getUserByRole: builder.mutation({
        query: (body) => (  {
            url:urls.get_user_by_role ,
            method: 'POST',
            body:body,
            headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['getUserByRoles'],
        },  
        ),

        updateRoles: builder.mutation({
          query: (body) => (  {
              url:urls.add_role_to_users ,
              method: 'POST',
              body:body,
              headers: {
              authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
            },
            }),
            providesTags:['updateRoles'],
          },  
          ),

      addNavbar: builder.mutation({
        query: (body) => (  {
            url:urls.add_navbar ,
            method: 'POST',
            body:body,
            headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['add-navbar'],
        },  
        ),

        getNavbarList: builder.mutation({
        query: () => (  {
            url:urls.get_navbar_list ,
            method: 'POST',
            // body:body,
            headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['navbar-list'],
        },  
        ),

        addSubnavBar: builder.mutation({
        query: (body) => (  {
            url:urls.add_subnavbar ,
            method: 'POST',
            body:body,
            headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['add-subnavbar'],
        },  
        ),

        addMenuToRoles: builder.mutation({
        query: (body) => (  {
            url:urls.assing_menu_roles ,
            method: 'POST',
            body:body,
            headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
          }),
          providesTags:['add-menu-roles'],
        },  
        ),

        getUserByRoles: builder.mutation({
          query: (body) => (  {
              url:urls.get_user_by_roles ,
              method: 'POST',
              body:body,
              headers: {
              authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
            },
            }),
            providesTags:['get-users-by-roles'],
          },  
          ),

        getKycDriverDetailsById: builder.mutation({
          query: (body) => (  {
              url:urls.get_driver_detail_by_userid ,
              method: 'POST',
              body:body,
              headers: {
              authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
            },
            }),
            providesTags:['get-driver-detail-by-userid'],
          },  
          ),

          approveDriverKyc: builder.mutation({
          query: (body) => (  {
              url:urls.ams_drivers ,
              method: 'POST',
              body:body,
              headers: {
              authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
            },
            }),
            providesTags:['ams-drivers'],
          },  
          ),


    
  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
 useGetAllUsersMutation , useGetVhicleDetailsMutation , useUpdateKycStatusMutation  , useRemoveUserMutation , useBlockUnblockUserMutation , useGetUserByRoleMutation ,
 useUpdateRolesMutation, useAddNavbarMutation , useGetNavbarListMutation , useAddSubnavBarMutation , useAddMenuToRolesMutation ,useGetUserByRolesMutation ,useGetKycDriverDetailsByIdMutation ,useApproveDriverKycMutation
} = adminApi;


export default adminApi