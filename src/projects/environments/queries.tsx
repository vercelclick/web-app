import { useQuery } from "@tanstack/react-query";
import { CLOUD_API_BASE_URL, LOCAL_API_BASE_URL } from "@/constants";
import type {
  GetEnvironmentResult,
  ProjectPath,
  TargetedPublicKey,
} from "@/core";
import { resolveApiRequest } from "@/utils";

export function useEnvironmentQuery(
  project_path: ProjectPath | null,
  project_id?: string,
  env_name?: string,
) {
  return useQuery({
    queryKey: ["environment", project_id, env_name],
    queryFn: () =>
      resolveApiRequest<GetEnvironmentResult>(
        `/api/v1/projects/${project_id}/env/${env_name}`,
        {
          base_url:
            project_path === null ? CLOUD_API_BASE_URL : LOCAL_API_BASE_URL,
        },
      ),
    enabled: typeof project_id === "string" && typeof env_name === "string",
  });
}

export function useSecretTargetsQuery(
  project_path: ProjectPath | null,
  project_id?: string,
  env_name?: string,
  secret_name?: string,
) {
  return useQuery({
    queryKey: ["secret-targets", project_id, env_name, secret_name],
    queryFn: () =>
      fetchSecretTargets(project_path, project_id, env_name, secret_name),
    enabled:
      typeof project_id === "string" &&
      typeof env_name === "string" &&
      typeof secret_name === "string",
  });
}

export const fetchSecretTargets = async (
  project_path: ProjectPath | null,
  project_id?: string,
  env_name?: string,
  secret_name?: string,
) =>
  resolveApiRequest<TargetedPublicKey[]>(
    `/api/projects/${project_id}/env/${env_name}/secrets/${secret_name}/targets`,
    {
      base_url: project_path === null ? CLOUD_API_BASE_URL : LOCAL_API_BASE_URL,
    },
  );
