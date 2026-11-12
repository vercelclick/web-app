import { CLOUD_API_BASE_URL, CONNECTION_REFUSED_ERR } from "@/constants";
import { getSession } from "./session";

export type RequestParameters = RequestInit & { base_url?: string };

export async function makeApiRequest<T = unknown>(
  path: string,
  init?: RequestParameters,
) {
  const headers: Record<string, string> = {};

  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  const session = getSession();
  if (session !== null) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(
    `${init?.base_url ?? CLOUD_API_BASE_URL}${path}`,
    {
      ...init,
      headers,
      mode: "cors",
    },
  );

  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text,
    headers: response.headers,
    json() {
      return JSON.parse(text || "{}") as T;
    },
  };
}

export async function resolveApiRequest<T = unknown>(
  path: string,
  init?: RequestParameters,
): Promise<T> {
  try {
    const response = await makeApiRequest<T>(path, init);

    if (response.ok) {
      if (!response.text) {
        return undefined as unknown as T;
      }

      return response.json();
    }

    return Promise.reject(response.text);
  } catch (_err) {
    return Promise.reject(CONNECTION_REFUSED_ERR);
  }
}
