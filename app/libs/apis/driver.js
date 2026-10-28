
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import  urls from '../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';
import { encryptedBaseQuery } from './encryptedBaseQuery';

function onboardingAuth(body = {}, extra = {}) {
  const accessToken = body.accessToken
  const rest = { ...body }
  delete rest.accessToken
  const sessionId = rest.sessionId || extra.sessionId
  return {
    url: extra.url,
    method: extra.method,
    headers: {
      authorization: `Bearer ${accessToken || getCookie(SWC_KEYS.SWC_TOKEN) || ''}`,
      ...(sessionId ? { 'x-onboarding-session': String(sessionId) } : {}),
    },
    ...(extra.noBody ? { params: sessionId ? { sessionId } : undefined } : { body: rest }),
  }
}

// Define the base API
const driversApi = createApi({
  reducerPath: 'driversApi',
  tagTypes: ["get-driver-details","get-banks","get-bank-branch","get-driver-list","update-driver-details","driver-rides","driver-dashboard","driver-notifications","driver-documents","driver-support","driver-faqs","driver-active-ride","driver-live-cabs","driver-platform","driver-onboarding"],
  baseQuery:process.env.NEXT_PUBLIC_API_ENCRYPT==="true"?encryptedBaseQuery():fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
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

      getBanks: builder.mutation({ 
        query: (body) => (  {
           url: urls.get_banks,
           method: 'GET',
          headers: {
                      // authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            // body:body
        }),
        providesTags:['get-banks']
      },  
     ),

      getBankBranch: builder.mutation({ 
        query: (query) => (  {
           url: `${urls.get_bank_branch}?${query}`,
           method: 'GET',
          headers: {
                      // authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            // body:body
        }),
        providesTags:['get-bank-branch']
      },  
     ),

      getDriverList: builder.mutation({ 
        query: (query = {}) => {
          const params = new URLSearchParams()
          if (query?.q) params.set('q', String(query.q))
          if (query?.page) params.set('page', String(query.page))
          if (query?.limit) params.set('limit', String(query.limit))
          const qs = params.toString()
          return {
            url: qs ? `${urls.get_driver_list}?${qs}` : urls.get_driver_list,
            method: 'GET',
            headers: {},
          }
        },
        providesTags:['get-driver-list']
      },  
     ),

      updateDriverDetails: builder.mutation({ 
        query: (body) => (  {
           url: `${urls.update_driver_details}`,
           method: 'post',
          headers: {
                      authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
                    },
            body:body
        }),
        providesTags:['update-driver-details'],
        invalidatesTags:['get-driver-details','driver-documents']
      },  
     ),

     driverActiveRide: builder.mutation({
        query: () => ({
           url: urls.driver_active_ride,
           method: 'GET',
           headers: {
             authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
           },
        }),
        providesTags:['driver-active-ride']
     }),

     driverLiveCabs: builder.mutation({
        query: ({ lat, lng }) => ({
           url: urls.driver_live_cabs,
           method: 'GET',
           params: { lat, lng },
           headers: {
             authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
           },
        }),
        providesTags:['driver-live-cabs']
     }),

     driverCompleteRide: builder.mutation({
        query: (body) => ({
           url: urls.driver_complete_ride,
           method: 'POST',
           body: body || {},
           headers: {
             authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
           },
        }),
        invalidatesTags:['driver-active-ride','driver-rides','driver-dashboard']
     }),

     driverRides: builder.mutation({
        query: (scope) => ({
           url: urls.driver_rides,
           method: 'GET',
           params: { scope: scope || 'upcoming' },
           headers: {
             authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}`,
           },
        }),
        providesTags:['driver-rides']
     }),

     driverDashboard: builder.mutation({
        query: () => ({
           url: urls.driver_dashboard,
           method: 'GET',
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        providesTags:['driver-dashboard']
     }),

     driverNotifications: builder.mutation({
        query: () => ({
           url: urls.driver_notifications,
           method: 'GET',
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        providesTags:['driver-notifications']
     }),

     markDriverNotificationsRead: builder.mutation({
        query: (body) => ({
           url: urls.driver_notifications_read,
           method: 'POST',
           body: body || {},
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        invalidatesTags:['driver-notifications']
     }),

     driverDocuments: builder.mutation({
        query: () => ({
           url: urls.driver_documents,
           method: 'GET',
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        providesTags:['driver-documents']
     }),

     updateDriverAccount: builder.mutation({
        query: (body) => ({
           url: urls.driver_update_account,
           method: 'POST',
           body,
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        invalidatesTags:['get-driver-details','driver-dashboard']
     }),

     changeDriverPassword: builder.mutation({
        query: (body) => ({
           url: urls.driver_change_password,
           method: 'POST',
           body,
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
     }),

     driverSupportTickets: builder.mutation({
        query: () => ({
           url: urls.driver_support_tickets,
           method: 'GET',
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        providesTags:['driver-support']
     }),

     createDriverSupportTicket: builder.mutation({
        query: (body) => ({
           url: urls.driver_support_tickets,
           method: 'POST',
           body,
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        invalidatesTags:['driver-support','driver-notifications']
     }),

     driverFaqs: builder.mutation({
        query: () => ({
           url: urls.driver_faqs,
           method: 'GET',
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        providesTags:['driver-faqs']
     }),

     driverPlatformGet: builder.mutation({
        query: ({ path, params }) => ({
           url: `v1/driver/platform/${path}`,
           method: 'GET',
           params: params || {},
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        providesTags:['driver-platform']
     }),

     driverPlatformSave: builder.mutation({
        query: ({ path, method, body }) => ({
           url: `v1/driver/platform/${path}`,
           method: method || 'POST',
           body: body || {},
           headers: { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` },
        }),
        invalidatesTags:['driver-platform','driver-dashboard','driver-support']
     }),

     driverOnboardingCatalog: builder.mutation({
        query: (service) => ({
           url: service ? `${urls.driver_onboarding_catalog}?service=${service}` : urls.driver_onboarding_catalog,
           method: 'GET',
        }),
     }),
     createDriverOnboardingSession: builder.mutation({
        query: (body) => ({
           url: urls.driver_onboarding_session,
           method: 'POST',
           body,
        }),
     }),
     resumeDriverOnboarding: builder.mutation({
        query: (body) => ({
           url: urls.driver_onboarding_resume,
           method: 'POST',
           body,
        }),
     }),
     sendDriverOnboardingOtp: builder.mutation({
        query: (body) => ({
           url: urls.driver_onboarding_send_otp,
           method: 'POST',
           body,
        }),
     }),
     verifyDriverOnboardingOtp: builder.mutation({
        query: (body) => ({
           url: urls.driver_onboarding_verify_otp,
           method: 'POST',
           body,
        }),
     }),
     getDriverOnboarding: builder.mutation({
        query: (body) => onboardingAuth(body || {}, { url: urls.driver_onboarding, method: 'GET', noBody: true }),
        providesTags:['driver-onboarding']
     }),
     saveDriverOnboardingProfile: builder.mutation({
        query: (body) => onboardingAuth(body, { url: urls.driver_onboarding_profile, method: 'PATCH' }),
        invalidatesTags:['driver-onboarding']
     }),
     addDriverOnboardingVehicle: builder.mutation({
        query: (body) => onboardingAuth(body, { url: urls.driver_onboarding_vehicles, method: 'POST' }),
        invalidatesTags:['driver-onboarding']
     }),
     uploadDriverOnboardingDocument: builder.mutation({
        query: (body) => onboardingAuth(body, { url: urls.driver_onboarding_documents, method: 'POST' }),
        invalidatesTags:['driver-onboarding']
     }),
     saveDriverOnboardingVerification: builder.mutation({
        query: (body) => onboardingAuth(body, { url: urls.driver_onboarding_verification, method: 'POST' }),
        invalidatesTags:['driver-onboarding']
     }),
     completeDriverTraining: builder.mutation({
        query: ({ moduleId, ...body }) => onboardingAuth(body, { url: urls.driver_onboarding_training(moduleId), method: 'POST' }),
        invalidatesTags:['driver-onboarding']
     }),
     saveDriverOnboardingPayout: builder.mutation({
        query: (body) => onboardingAuth(body, { url: urls.driver_onboarding_payout, method: 'POST' }),
        invalidatesTags:['driver-onboarding']
     }),
     submitDriverOnboarding: builder.mutation({
        query: (body) => onboardingAuth(body || {}, { url: urls.driver_onboarding_submit, method: 'POST' }),
        invalidatesTags:['driver-onboarding']
     }),
     activateDriver: builder.mutation({
        query: (body) => onboardingAuth(body || {}, { url: urls.driver_activation, method: 'POST' }),
        invalidatesTags:['driver-onboarding','get-driver-details']
     }),

  }),

     
  transformResponse: (response, meta, arg) => response.data ,
      // Pick out errors and prevent nested properties in a hook or selector
  transformErrorResponse: (response, meta, arg) => response.data,

});

// Export hooks for usage in functional components
export const {
  useDriverDetailsMutation,useGetBanksMutation, useGetBankBranchMutation , useGetDriverListMutation , useUpdateDriverDetailsMutation,
  useDriverActiveRideMutation, useDriverLiveCabsMutation, useDriverCompleteRideMutation, useDriverRidesMutation,
  useDriverDashboardMutation, useDriverNotificationsMutation, useMarkDriverNotificationsReadMutation, useDriverDocumentsMutation,
  useUpdateDriverAccountMutation, useChangeDriverPasswordMutation, useDriverSupportTicketsMutation, useCreateDriverSupportTicketMutation, useDriverFaqsMutation,
  useDriverPlatformGetMutation, useDriverPlatformSaveMutation,
  useDriverOnboardingCatalogMutation, useCreateDriverOnboardingSessionMutation, useResumeDriverOnboardingMutation,
  useSendDriverOnboardingOtpMutation, useVerifyDriverOnboardingOtpMutation, useGetDriverOnboardingMutation,
  useSaveDriverOnboardingProfileMutation, useAddDriverOnboardingVehicleMutation, useUploadDriverOnboardingDocumentMutation,
  useSaveDriverOnboardingVerificationMutation, useCompleteDriverTrainingMutation, useSaveDriverOnboardingPayoutMutation,
  useSubmitDriverOnboardingMutation, useActivateDriverMutation
} = driversApi;


export default driversApi