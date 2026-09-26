import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import urls from '../../../constants/urls'
import { getCookie } from '@node_modules/cookies-next/lib';
import { SWC_KEYS } from '@constants';
import { encryptedBaseQuery } from './encryptedBaseQuery';

function authHeaders() {
  return { authorization: `Bearer ${getCookie(SWC_KEYS.SWC_TOKEN)}` };
}

const walletApi = createApi({
  reducerPath: 'walletApi',
  tagTypes: ['driver-wallet', 'wallet-plans'],
  baseQuery: process.env.NEXT_PUBLIC_API_ENCRYPT === 'true'
    ? encryptedBaseQuery()
    : fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getDriverWallet: builder.query({
      query: (id) => ({ url: urls.wallet_driver(id), headers: authHeaders() }),
      providesTags: ['driver-wallet'],
    }),
    getDriverLedger: builder.query({
      query: (id) => ({ url: urls.wallet_driver_ledger(id), headers: authHeaders() }),
      providesTags: ['driver-wallet'],
    }),
    getWalletPlans: builder.query({
      query: () => ({ url: urls.wallet_plans, headers: authHeaders() }),
      providesTags: ['wallet-plans'],
    }),
    getWalletPlan: builder.query({
      query: (code) => ({ url: urls.wallet_plan(code), headers: authHeaders() }),
      providesTags: ['wallet-plans'],
    }),
    getDriverEntitlement: builder.query({
      query: (id) => ({ url: urls.wallet_driver_entitlement(id), headers: authHeaders() }),
      providesTags: ['driver-wallet'],
    }),
    getDriverSubscriptions: builder.query({
      query: (id) => ({ url: urls.wallet_driver_subscriptions(id), headers: authHeaders() }),
      providesTags: ['driver-wallet'],
    }),
    createRechargeIntent: builder.mutation({
      query: ({ id, amountPaise }) => ({
        url: urls.wallet_recharge_intent(id),
        method: 'POST',
        body: { amountPaise },
        headers: authHeaders(),
      }),
    }),
    confirmRecharge: builder.mutation({
      query: ({ id, orderId, razorpay }) => ({
        url: urls.wallet_recharge_confirm(id),
        method: 'POST',
        body: { orderId, razorpay },
        headers: authHeaders(),
      }),
      invalidatesTags: ['driver-wallet'],
    }),
    buyDriverPack: builder.mutation({
      query: ({ id, planId }) => ({
        url: urls.wallet_driver_subscriptions(id),
        method: 'POST',
        body: { planId },
        headers: authHeaders(),
      }),
      invalidatesTags: ['driver-wallet'],
    }),
  }),
});

export const {
  useGetDriverWalletQuery,
  useGetDriverLedgerQuery,
  useGetWalletPlansQuery,
  useGetWalletPlanQuery,
  useGetDriverEntitlementQuery,
  useGetDriverSubscriptionsQuery,
  useCreateRechargeIntentMutation,
  useConfirmRechargeMutation,
  useBuyDriverPackMutation,
} = walletApi;

export default walletApi;
