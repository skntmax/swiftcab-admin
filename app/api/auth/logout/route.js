import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SWC_KEYS } from "@constants";
import { apiBaseUrl } from "@utils/authSessionConfig";
import { clearSessionCookies } from "../session/route";

export async function POST() {
  const refreshToken = cookies().get(SWC_KEYS.SWC_REFRESH)?.value || "";
  const accessToken = cookies().get(SWC_KEYS.SWC_TOKEN)?.value || "";
  const apiBase = apiBaseUrl();
  if (apiBase) {
    await fetch(`${apiBase}/v1/auth/logout`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => null);
  }
  const response = NextResponse.json({ success: true, message: "logged out" });
  return clearSessionCookies(response);
}
