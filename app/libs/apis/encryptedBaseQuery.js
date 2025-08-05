import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptPayload } from '../../../utils/encrypt';


export const encryptedBaseQuery = (config)=>{
  config = config || {}; // If undefined, use empty object
  const baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_URL;
  const rawBaseQuery = fetchBaseQuery({ baseUrl });
  return async (args, api, extraOptions) => {
  // Clone args to avoid mutation
  let modifiedArgs = { ...args };

  // Encrypt body if it exists
  if (args?.body) {
    modifiedArgs.body = {
      payload: encryptPayload(args.body),
    };
  }

  // Call the original baseQuery with modified body
  return rawBaseQuery(modifiedArgs, api, extraOptions);
};  
} 