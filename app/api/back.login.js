import { setCookie } from 'cookies-next';
import { NextResponse } from 'next/server';
import { SWC_KEYS } from '../../constants';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get user data from request body
  const { token, userObj } = req.body;

  if (!token || !userObj) {
    return res.status(400).json({ error: 'Missing token or user data' });
  }

    // ✅ Set cookies for the main domain (server-side)
    res.setHeader('Set-Cookie', [
      serialize(SWC_KEYS.SWC_TOKEN, token, {
        path: '/',
        httpOnly: true,
        secure: false, // ❌ Set to `true` only in HTTPS
        sameSite: 'Lax' // Use 'None' only in HTTPS
      }),
       
      serialize(SWC_KEYS.SWC_USER, JSON.stringify(userObj), {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax'
      })
    ]);

  return res.status(200).json({ success: true });
}
