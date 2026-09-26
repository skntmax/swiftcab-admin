
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
    "role-has-capabilities","cap-has-permissions","perm-by-cap-id","get-master-navbar-list",
    "assign-driver-to-owner","owner-driver-assignments","driver-onboarding-queue","vehicle-kyc","vehicle-types","getUserByRoles","userPermissions","userPermissionsMatrix","userPermissionHierarchy","adminDashboard"
  ],
  baseQuery:process.env.NEXT_PUBLIC_API_ENCRYPT==="true"?encryptedBaseQuery():fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({ 
      getDashboardOverview: builder.query({
        query: ({ fromDate, toDate } = {}) => ({
          url: urls.admin_dashboard_overview,
          method: 'GET',
          params: { fromDate, toDate },
          headers: {
            authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
          },
        }),
        providesTags: ['adminDashboard'],
      }),

     listUsers: builder.query({
       query: ({ q = '', page = 1, limit = 10, roles = [], status = 'all', verification = 'all' } = {}) => ({
         url: urls.admin_users,
         method: 'GET',
         params: {
           q,
           page,
           limit,
           roles: Array.isArray(roles) ? roles.join(',') : roles,
           status,
           verification,
         },
         headers: {
           authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
         },
       }),
       providesTags: ['all-users'],
     }),

     listVehicleKyc: builder.query({
       query: ({ q = '', page = 1, limit = 10, status = 'all' } = {}) => ({
         url: urls.admin_vehicle_kyc,
         method: 'GET',
         params: { q, page, limit, status },
         headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
       }),
       providesTags: ['vehicle-kyc'],
     }),

     listVehicleTypes: builder.query({
       query: ({ q = '', page = 1, limit = 12, status = 'all' } = {}) => ({
         url: urls.admin_vehicle_types,
         method: 'GET',
         params: { q, page, limit, status },
         headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
       }),
       providesTags: ['vehicle-types'],
     }),

     createVehicleType: builder.mutation({
       query: (body) => ({
         url: urls.admin_vehicle_types,
         method: 'POST',
         body,
         headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
       }),
       invalidatesTags: ['vehicle-types'],
     }),

     updateVehicleType: builder.mutation({
       query: ({ id, ...body }) => ({
         url: `${urls.admin_vehicle_types}/${id}`,
         method: 'PATCH',
         body,
         headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
       }),
       invalidatesTags: ['vehicle-types'],
     }),

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
        invalidatesTags:['update-kyc-details', 'vehicle-kyc']
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
            invalidatesTags: ['all-users'],
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
            invalidatesTags: ['getUserByRoles'],
          },  
          ),

        getUserPermissions: builder.mutation({
          query: (body) => ({
            url: urls.get_user_permissions,
            method: 'POST',
            body,
            headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
          }),
          providesTags: ['userPermissions'],
        }),

        setUserPermissions: builder.mutation({
          query: (body) => ({
            url: urls.set_user_permissions,
            method: 'POST',
            body,
            headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
          }),
          invalidatesTags: ['userPermissions', 'userPermissionsMatrix', 'userPermissionHierarchy', 'getUserByRoles'],
        }),

        getUserPermissionsMatrix: builder.mutation({
          query: (body) => ({
            url: urls.get_user_permissions_matrix,
            method: 'POST',
            body,
            headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
          }),
          providesTags: ['userPermissionsMatrix'],
        }),

        getUserPermissionHierarchy: builder.mutation({
          query: (body) => ({
            url: urls.get_user_permission_hierarchy,
            method: 'POST',
            body,
            headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
          }),
          providesTags: ['userPermissionHierarchy'],
        }),

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

              listOwnersForDriverAssign: builder.mutation({
                query: (body = {}) => ({
                  url: urls.admin_list_owners_for_driver_assign,
                  method: 'POST',
                  body,
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                providesTags:['assign-driver-to-owner'],
              }),

              ownerAvailableVhicles: builder.mutation({
                query: (body) => ({
                  url: urls.admin_owner_available_vhicles,
                  method: 'POST',
                  body,
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                providesTags:['assign-driver-to-owner'],
              }),

              ownerAllVhicles: builder.mutation({
                query: (body) => ({
                  url: urls.admin_owner_all_vhicles,
                  method: 'POST',
                  body,
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                providesTags:['assign-driver-to-owner'],
              }),

              assignDriverToOwner: builder.mutation({
                query: (body) => ({
                  url: urls.admin_assign_driver_to_owner,
                  method: 'POST',
                  body,
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                invalidatesTags:['assign-driver-to-owner','owner-driver-assignments'],
              }),

              ownerDriverAssignments: builder.mutation({
                query: (body) => ({
                  url: urls.admin_owner_driver_assignments,
                  method: 'POST',
                  body,
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                providesTags:['owner-driver-assignments'],
              }),

              unassignDriverFromOwner: builder.mutation({
                query: (body) => ({
                  url: urls.admin_unassign_driver_from_owner,
                  method: 'POST',
                  body,
                  headers: {
                    authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                  },
                }),
                invalidatesTags:['assign-driver-to-owner','owner-driver-assignments'],
              }),

          getOnboardingQueue: builder.mutation({
            query: () => ({
              url: urls.admin_onboarding_queue,
              method: 'GET',
              headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
            }),
            providesTags:['driver-onboarding-queue'],
          }),
          onboardingQueue: builder.query({
            query: ({ q = '', page = 1, limit = 10, status = 'all' } = {}) => ({
              url: urls.admin_onboarding_queue,
              method: 'GET',
              params: { q, page, limit, status },
              headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
            }),
            providesTags:['driver-onboarding-queue'],
          }),
          getOnboardingCase: builder.mutation({
            query: (driverId) => ({
              url: urls.admin_onboarding_case(driverId),
              method: 'GET',
              headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
            }),
          }),
          decideOnboardingCase: builder.mutation({
            query: ({ driverId, ...body }) => ({
              url: urls.admin_onboarding_decision(driverId),
              method: 'POST',
              body,
              headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
            }),
            invalidatesTags:['driver-onboarding-queue','ams-drivers','get-driver-detail-by-userid'],
          }),



  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
 useGetDashboardOverviewQuery, useListUsersQuery, useListVehicleKycQuery, useListVehicleTypesQuery, useCreateVehicleTypeMutation, useUpdateVehicleTypeMutation, useGetAllUsersMutation , useGetVhicleDetailsMutation , useUpdateKycStatusMutation  , useRemoveUserMutation , useBlockUnblockUserMutation , useGetUserByRoleMutation ,
 useUpdateRolesMutation, useGetUserPermissionsMutation, useSetUserPermissionsMutation, useGetUserPermissionsMatrixMutation, useGetUserPermissionHierarchyMutation, useAddNavbarMutation , useGetNavbarListMutation , useAddSubnavBarMutation , useAddMenuToRolesMutation ,useGetUserByRolesMutation ,useGetKycDriverDetailsByIdMutation 
 ,useApproveDriverKycMutation , useGetMenuPermissionsMutation ,useAddCapabilityMutation , useAddPermissionsToCapabilityMutation , useRoleHasCapsMutation,
 useCapabilityHasPermissionsMutation ,useRemovePermissionsFromCapabilityMutation, usePermByCapabilityMutation , useGetMasterNavbarListMutation,
 useListOwnersForDriverAssignMutation, useOwnerAvailableVhiclesMutation, useOwnerAllVhiclesMutation, useAssignDriverToOwnerMutation, useOwnerDriverAssignmentsMutation, useUnassignDriverFromOwnerMutation,
 useGetOnboardingQueueMutation, useOnboardingQueueQuery, useGetOnboardingCaseMutation, useDecideOnboardingCaseMutation
} = adminApi;


export default adminApi