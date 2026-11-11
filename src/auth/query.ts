import { useMutation, useQuery } from "@tanstack/react-query";
import type { AuthSession } from "@/core";
import { resolveApiRequest } from "@/utils";

export const SESSION_QUERY_KEY = ["session"];

export function useSessionQuery() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: (context) =>
      resolveApiRequest<AuthSession>("/api/auth/session", {
        signal: context.signal,
      }),
    retryDelay: 200,
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationKey: ["session-logout"],
    mutationFn: () =>
      resolveApiRequest("/api/auth/session", { method: "DELETE" }),
    onSettled: (_, __, ___, ____, context) => {
      // Invalidate all queries
      context.client.resetQueries();
    },
  });
}
