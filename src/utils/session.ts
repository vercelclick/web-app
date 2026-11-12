import { SESSION_LOCAL_STORAGE_KEY } from "@/constants";
import { type AuthSession, check_session_token } from "@/core";

export function getSession(): { token: string; session: AuthSession } | null {
  const token = window.localStorage.getItem(SESSION_LOCAL_STORAGE_KEY);
  if (token === null) {
    return null;
  }

  try {
    const session = check_session_token(token);
    return { session, token };
  } catch (err) {
    console.log("Invalid session token", token);
    console.error(err);

    // Clear session storage when the session is invalid
    window.localStorage.removeItem(SESSION_LOCAL_STORAGE_KEY);
    return null;
  }
}

export function updateSessionToken(token: string | null) {
  if (typeof token === "string") {
    window.localStorage.setItem(SESSION_LOCAL_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(SESSION_LOCAL_STORAGE_KEY);
  }

  const event = new StorageEvent("storage", {
    key: SESSION_LOCAL_STORAGE_KEY,
    newValue: token,
    url: window.location.href,
    storageArea: localStorage,
  });

  window.dispatchEvent(event);
}
