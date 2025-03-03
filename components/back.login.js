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
  setCookie(SWC_KEYS.SWC_TOKEN, token, {
    req, res,
    domain: '.swiftcab.in', // ✅ Makes cookie available on all subdomains
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'None'
  });

  setCookie(SWC_KEYS.SWC_USER, JSON.stringify(userObj), {
    req, res,
    domain: '.swiftcab.in',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'None'
  });

  return res.status(200).json({ success: true });
}
