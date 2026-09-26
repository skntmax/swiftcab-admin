import { NextResponse } from "next/server";
import { SWC_KEYS } from "@constants";
import { AUTH_SESSION } from "@utils/authSessionConfig";

const ACCESS_COOKIE = {
  path: "/",
  httpOnly: false,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: Math.floor(AUTH_SESSION.accessTtlMs / 1000),
};

const REFRESH_COOKIE = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: Math.floor(AUTH_SESSION.refreshTtlMs / 1000),
};

function asCookieValue(value) {
  if (value == null) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function applySessionCookies(response, { token, user, refreshToken }) {
  if (token) {
    response.cookies.set(SWC_KEYS.SWC_TOKEN, String(token), ACCESS_COOKIE);
  }
  if (user) {
    response.cookies.set(SWC_KEYS.SWC_USER, asCookieValue(user), ACCESS_COOKIE);
  }
  if (refreshToken) {
    response.cookies.set(SWC_KEYS.SWC_REFRESH, String(refreshToken), REFRESH_COOKIE);
  }
  return response;
}

export function clearSessionCookies(response) {
  const clearAccess = { ...ACCESS_COOKIE, maxAge: 0 };
  const clearRefresh = { ...REFRESH_COOKIE, maxAge: 0 };
  response.cookies.set(SWC_KEYS.SWC_TOKEN, "", clearAccess);
  response.cookies.set(SWC_KEYS.SWC_USER, "", clearAccess);
  response.cookies.set(SWC_KEYS.SWC_REFRESH, "", clearRefresh);
  return response;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const user = body?.user ?? body?.usersObj ?? body?.userObj;
  const refreshToken = body?.refreshToken;

  if (!token || !user) {
    return NextResponse.json(
      { error: true, message: "Missing token or user" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true, message: "session set" });
  return applySessionCookies(response, { token, user, refreshToken });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "session cleared" });
  return clearSessionCookies(response);
}
