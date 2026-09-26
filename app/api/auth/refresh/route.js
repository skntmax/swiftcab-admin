import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SWC_KEYS } from "@constants";
import { apiBaseUrl } from "@utils/authSessionConfig";
import { applySessionCookies, clearSessionCookies } from "../session/route";

export async function POST() {
  const refreshToken = cookies().get(SWC_KEYS.SWC_REFRESH)?.value;
  if (!refreshToken) {
    return NextResponse.json({ skipped: true, missingRefresh: true });
  }

  const apiBase = apiBaseUrl();
  if (!apiBase) {
    return NextResponse.json({ error: true, message: "API URL is not configured" }, { status: 500 });
  }

  const upstream = await fetch(`${apiBase}/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  const payload = await upstream?.json().catch(() => null);
  const data = payload?.data;
  if (!upstream?.ok || payload?.error || !data?.token || !data?.refreshToken) {
    const response = NextResponse.json(
      { error: true, message: payload?.message || "Could not refresh session" },
      { status: 401 },
    );
    return clearSessionCookies(response);
  }

  const response = NextResponse.json({ success: true, user: data.usersObj });
  return applySessionCookies(response, {
    token: data.token,
    user: data.usersObj,
    refreshToken: data.refreshToken,
  });
}
