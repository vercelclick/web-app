import { useQuery } from "@tanstack/react-query";
import type { GetEnvironmentResult } from "@/api-types/GetEnvironmentResult";
import type { TargetedPublicKey } from "@/core";
import { resolveApiRequest } from "@/utils";

export function useEnvironmentQuery(project_id?: string, env_name?: string) {
  return useQuery({
    queryKey: ["environment", project_id, env_name],
    queryFn: () =>
      resolveApiRequest<GetEnvironmentResult>(
        `/api/projects/${project_id}/env/${env_name}`,
      ),
    enabled: typeof project_id === "string" && typeof env_name === "string",
  });
}

export function useSecretTargetsQuery(
  project_id?: string,
  env_name?: string,
  secret_name?: string,
) {
  return useQuery({
    queryKey: ["secret-targets", project_id, env_name, secret_name],
    queryFn: () => fetchSecretTargets(project_id, env_name, secret_name),
    enabled:
      typeof project_id === "string" &&
      typeof env_name === "string" &&
      typeof secret_name === "string",
  });
}

export const fetchSecretTargets = async (
  project_id?: string,
  env_name?: string,
  secret_name?: string,
) =>
  resolveApiRequest<TargetedPublicKey[]>(
    `/api/projects/${project_id}/env/${env_name}/secrets/${secret_name}/targets`,
  );
