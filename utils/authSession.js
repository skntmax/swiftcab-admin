export async function persistAuthSession({ token, user, refreshToken }) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ token, user, refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to persist login session");
  }

  return response.json().catch(() => ({ success: true }));
}

export async function refreshAuthSession() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
  });
  const body = await response.json().catch(() => ({}));
  if (body?.skipped) {
    return { skipped: true };
  }
  if (!response.ok) {
    throw new Error(body?.message || "Failed to refresh session");
  }
  return body;
}

export async function clearAuthSession() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  }).catch(() => {});
}
