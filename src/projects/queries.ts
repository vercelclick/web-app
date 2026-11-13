import { useQuery } from "@tanstack/react-query";
import { ABORT_ERROR } from "@/components/error";
import { CLOUD_API_BASE_URL, LOCAL_API_BASE_URL } from "@/constants";
import type { GetProjectResult, ListProjectsResult } from "@/core";
import { makeApiRequest, resolveApiRequest } from "@/utils";

export function useCloudProjectsListQuery() {
  return useQuery({
    queryKey: ["cloud_projects_list"],
    queryFn: (context) =>
      resolveApiRequest<ListProjectsResult>("/api/v1/projects", {
        signal: context.signal,
        base_url: CLOUD_API_BASE_URL,
      }),
  });
}

export function useLocalProjectsListQuery() {
  return useQuery({
    queryKey: ["local_projects_list"],
    queryFn: (context) =>
      resolveApiRequest<ListProjectsResult>("/api/v1/projects", {
        signal: context.signal,
        base_url: LOCAL_API_BASE_URL,
      }),
  });
}

export function useActiveProjectsList() {
  const local_query = useLocalProjectsListQuery();
  const cloud_query = useCloudProjectsListQuery();

  const local = local_query.data?.projects ?? [];
  const cloud = cloud_query.data?.projects ?? [];

  const error =
    local_query.isError && cloud_query.isError ? cloud_query.error : null;

  return {
    error,
    local,
    cloud,
    projects: [...local, ...cloud],
    isPending: local_query.isPending || cloud_query.isPending,
    isFetching: local_query.isFetching || cloud_query.isFetching,
  };
}

export function useProjectQuery(project_id?: string) {
  return useQuery({
    queryKey: ["project", project_id],
    queryFn: async (context) => {
      const fetch_cloud = () =>
        resolveApiRequest<GetProjectResult>(`/api/v1/projects/${project_id}`, {
          signal: context.signal,
          base_url: CLOUD_API_BASE_URL,
        });

      try {
        const response = await makeApiRequest<GetProjectResult>(
          `/api/v1/projects/${project_id}`,
          {
            signal: context.signal,
            base_url: LOCAL_API_BASE_URL,
          },
        );

        if (response.ok) {
          return response.json();
        }

        if (response.status === 404) {
          // Project not found, return cloud project promise
          return fetch_cloud();
        }

        return Promise.reject(response.text);
      } catch (_err) {
        if (context.signal.aborted) {
          return Promise.reject(ABORT_ERROR);
        }

        // Local service offline, return cloud project promise
        return fetch_cloud();
      }
    },
    enabled: typeof project_id === "string",
  });
}
