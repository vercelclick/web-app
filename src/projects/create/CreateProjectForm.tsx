import { toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router";
import * as uuid from "uuid";
import * as z from "zod";
import { useAuthorization } from "@/auth/useAuthorization";
import type { ErrorHook } from "@/components/error";
import {
  CLOUD_API_BASE_URL,
  LOCAL_API_BASE_URL,
  SAFE_NAME_SCHEMA,
} from "@/constants";
import type { CreateProjectRequest, Project, ProjectPath } from "@/core";
import { resolveApiRequest } from "@/utils";
import {
  useCloudProjectsListQuery,
  useLocalProjectsListQuery,
} from "../queries";

const createEnvironmentSchema = z.object({
  id: z.string(),
  name: SAFE_NAME_SCHEMA,
  description: z.string(),
});

const create_project_schema = z.object({
  name: z.string().min(2),
  description: z.string(),
  environments: z.array(createEnvironmentSchema).refine((values) => {
    const names = values.map((env) => env.name);

    if (names.length !== new Set(names).size) {
      return false;
    }

    for (const env of values) {
      if (!createEnvironmentSchema.validate(env)) {
        return false;
      }
    }

    return true;
  }),
});

export type CreateProjectFormData = z.infer<typeof create_project_schema>;

export function useCreateProjectForm(error: ErrorHook) {
  const authorize = useAuthorization(error);
  const navigate = useNavigate();
  const cloud_projects = useCloudProjectsListQuery();
  const local_projects = useLocalProjectsListQuery();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      environments: [
        {
          id: uuid.v7(),
          name: "development",
          description: "For testing by developers before moving to QC",
        },
        {
          id: uuid.v7(),
          name: "staging",
          description: "For testing by QAs before promoting to production",
        },
        {
          id: uuid.v7(),
          name: "production",
          description: "Prod secrets, heavily restricted",
        },
      ],
    } satisfies CreateProjectFormData,
    validators: {
      onChange: create_project_schema,
      onMount: create_project_schema,
    },
    onSubmitMeta: {} as { project_path: ProjectPath | null },
    onSubmit: async ({
      value: { description, environments, name },
      meta: { project_path },
    }) => {
      const auth_op = await authorize(project_path, "project creation");
      if (!auth_op.ok) {
        return;
      }

      const create_op = await error.catch("Error creating project", () =>
        resolveApiRequest<Project>("/api/v1/projects", {
          method: "POST",
          body: JSON.stringify({
            path: project_path?.path ?? null,
            name,
            description,
            environments,
            auth_result: auth_op.result,
          } satisfies CreateProjectRequest),
          base_url:
            project_path === null ? CLOUD_API_BASE_URL : LOCAL_API_BASE_URL,
        }),
      );

      if (!create_op.ok) {
        return;
      }

      await Promise.allSettled([
        cloud_projects.refetch(),
        local_projects.refetch(),
      ]).then(() => navigate(`/p/${create_op.result.id}`));

      toast(`Project '${name}' created successfully!`, { variant: "success" });
    },
  });

  return form;
}

export type CreateProjectForm = ReturnType<typeof useCreateProjectForm>;
