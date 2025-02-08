"use client";
import { SWC_KEYS } from "@constants";
import urls from "../../../constants/urls";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "@node_modules/cookies-next/lib/client";


const ownerApi = createApi({

  reducerPath: "ownerApi",
  tagTypes: ["vehicles", "insert-owner-vhicles"], 
  
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
           headers:{
                "authorization": `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
             },  
        body: body,
      }),
      providesTags: ["insert-owner-vhicles"],
    }),


    
    transformResponse: (response) => response.data, 
    transformErrorResponse: (response) => response.data, 
  
}),
});

export const { useGetVehiclesListQuery, useInsertOwnerVhiclesMutation } = ownerApi;

export default ownerApi;
