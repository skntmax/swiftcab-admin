
'use client'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from './../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';
import { encryptedBaseQuery } from './encryptedBaseQuery';

// Define the base API
const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['all-users' ,'register-user' , 'vhicle-detail' , 'update-kyc-details' ,
    'remove-user-by-username','updateRoles',"navbar-list","add-subnavbar","add-menu-roles",
    "get-driver-detail-by-userid","ams-drivers","get-menu-permissions" ,"add-capabilities","add-capabilities-have-permissions",
    "role-has-capabilities","cap-has-permissions","perm-by-cap-id","get-master-navbar-list"
  ],
  baseQuery:process.env.NEXT_PUBLIC_API_ENCRYPT==="true"?encryptedBaseQuery():fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
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

          getMenuPermissions: builder.mutation({
          query: (body) => (  {
              url:`${urls.get_menu_permissions}/${body.page}/${body.rowsPerPage}`,
              method: 'GET',
              // body:body,
              headers: {
              // authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
            },
            }),
            providesTags:['get-menu-permissions'],
          },  
          ),
        
            addCapability : 
              builder.mutation({
                  query: (body) => (  {
                  url:urls.add_capabilities,
                  method: 'POST',
                  body:body,
                  headers: {
                  authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
                }),
                invalidatesTags: ['role-has-capabilities',"perm-by-cap-id"],
                providesTags:['add-capabilities'],
              },  
              ), 


            addPermissionsToCapability : 
              builder.mutation({
                  query: (body) => (  {
                  url:urls.add_capabilities_have_permissions,
                  method: 'POST',
                  body:body,
                  headers: {
                  authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
                }),
                providesTags:['add-capabilities-have-permissions'],
                invalidatesTags: ['role-has-capabilities',"perm-by-cap-id"]
              },  
              ), 

                roleHasCaps : builder.mutation({
                      query: (body) => ({
                        url: `${urls.get_role_has_capabilities}/${body.userType}`,
                        method: 'GET',
                        headers: {
                          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                        },
                      }),
                      // Mutations don't use providesTags, they use invalidatesTags
                      invalidatesTags: ['role-has-capabilities'],
                    }),

                  capabilityHasPermissions : builder.mutation({
                      query: (body) => ({
                        url: `${urls.get_cap_has_permissions}/${body.userType}`,
                        method: 'GET',
                        headers: {
                          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                        },
                      }),
                      invalidatesTags: ['cap-has-permissions'],
                    }),

              removePermissionsFromCapability: builder.mutation({
                query: (body) => ({
                  url: "remove-capability", // or whatever your endpoint is
                  method: 'POST', // or 'DELETE' depending on your API
                  body: {
                    permissionsToRemove: "ok",
                    // Add any other fields your API needs
                  },
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                // Invalidate tags to refetch the data after mutation
                invalidatesTags: ['cap-has-permissions', 'role-has-capabilities'],
              }),


              permByCapability: builder.mutation({
                query: (body) => ({
                  url: `${urls.get_perm_by_cap_id}/${body.capid}`, // or whatever your endpoint is
                  method: 'GET', // or 'DELETE' depending on your API
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                // Invalidate tags to refetch the data after mutation
                providesTags:['perm-by-cap-id'],
              }),

                getMasterNavbarList: builder.mutation({
                query: (body) => ({
                  url: `${urls.get_master_navbar_list}`, // or whatever your endpoint is
                  method: 'GET', // or 'DELETE' depending on your API
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                // Invalidate tags to refetch the data after mutation
                providesTags:['get-master-navbar-list'],
              }),




  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
 useGetAllUsersMutation , useGetVhicleDetailsMutation , useUpdateKycStatusMutation  , useRemoveUserMutation , useBlockUnblockUserMutation , useGetUserByRoleMutation ,
 useUpdateRolesMutation, useAddNavbarMutation , useGetNavbarListMutation , useAddSubnavBarMutation , useAddMenuToRolesMutation ,useGetUserByRolesMutation ,useGetKycDriverDetailsByIdMutation 
 ,useApproveDriverKycMutation , useGetMenuPermissionsMutation ,useAddCapabilityMutation , useAddPermissionsToCapabilityMutation , useRoleHasCapsMutation,
 useCapabilityHasPermissionsMutation ,useRemovePermissionsFromCapabilityMutation, usePermByCapabilityMutation , useGetMasterNavbarListMutation
} = adminApi;


export default adminApi