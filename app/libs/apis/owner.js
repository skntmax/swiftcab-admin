"use client";
import { SWC_KEYS } from "@constants";
import urls from "../../../constants/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@node_modules/cookies-next/lib/client";

const ownerApi = createApi({
  reducerPath: "ownerApi",
  providesTags: ["admin_service_list"],
  tagTypes: [
    "vehicles",
    "insert-owner-vhicles",
    "owner-ownes-vhicle",
    "owner_active_vhicle_list",
    "create_vhicle_provide_services",
    "vhicle_services_list",
    "owner-vhicle-active-services",
    "owner-kyc-request",
  ],

  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getVehiclesList: builder.query({
      query: () => ({
        url: urls.get_vehicles_list,
        method: "GET",
      }),
      providesTags: ["vehicles"],
    }),

    insertOwnerVhicles: builder.mutation({
      query: (body) => ({
        url: urls.insert_owner_vhicles,
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
        body: body,
      }),
      providesTags: ["insert-owner-vhicles"],
    }),

    getVehiclesTypeList: builder.query({
      query: () => ({
        url: urls.owner_service_list,
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
      }),
      providesTags: ["owner_active_vhicle_list"],
    }),

     getActiveOwnerVehiclesTypeList: builder.mutation({
      query: () => ({
        url: urls.owner_varified_vhicles,
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
      }),
      providesTags: ["owner_active_vhicle_list"],
    }),


    getVehiclesServiceList: builder.query({
      query: () => ({
        url: "v1/admin/service-list",
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
      }),
      providesTags: ["admin_service_list"],
    }),

    getVehiclesServiceListRender: builder.query({
      query: () => ({
        url: "v1/owner/get-vhicle-services-list",
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
      }),
      providesTags: ["vhicle_services_list"],
    }),

    addVehicleService: builder.mutation({
      query: (body) => ({
        url: "v1/owner/create-vhicle-provide-services",
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
        body: body,
      }),
      providesTags: ["create_vhicle_provide_services"],
      invalidatesTags: ['owner-vhicle-active-services']
    }),

    getOwnerVhiclesList: builder.mutation({
      query: (body) => ({
        url: urls.owner_ownes_vhicle,
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
        body: body,
      }),
      providesTags: ["owner-ownes-vhicle"],
    }),

    ownerVhicleServiceList: builder.query({
      query: (body) => ({
        url: urls.owner_active_vhicle_service_list,
        method: "GET",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
      }),
      providesTags: ["owner-vhicle-active-services"],
    }),

    ownerKycRequest: builder.mutation({
      query: (body) => ({
        url: urls.owner_kyc_request,
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
        body: body,
      }),
      providesTags: ["owner-kyc-request"],
    }),

     assignDriverToVhicle: builder.mutation({
      query: (body) => ({
        url: urls.assign_driver_to_vhicle,
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
        },
        body: body,
      }),
      providesTags: ["owner-kyc-request"],
    }),


    transformResponse: (response) => response.data,
    transformErrorResponse: (response) => response.data,
  }),
});

export const {
  useGetVehiclesListQuery,
  useInsertOwnerVhiclesMutation,
  useGetOwnerVhiclesListMutation,
  useGetVehiclesTypeListQuery,
  useGetVehiclesServiceListQuery,
  useAddVehicleServiceMutation,
  useGetVehiclesServiceListRenderQuery,
  useOwnerVhicleServiceListQuery,
  useOwnerKycRequestMutation,
  useGetActiveOwnerVehiclesTypeListMutation,
  useAssignDriverToVhicleMutation
} = ownerApi;

export default ownerApi;
