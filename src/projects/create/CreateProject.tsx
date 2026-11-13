import { Button } from "@heroui/react";
import {
  IconCloud,
  IconDeviceLaptop,
  IconFingerprint,
  IconFolder,
} from "@tabler/icons-react";
import { useSelector } from "@tanstack/react-form";
import { type SubmitEventHandler, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { ErrorDisplay, LoadingIcon, useError } from "@/components";
import { PageHeader } from "@/components/sections/header";
import type { ProjectPath } from "@/core";
import { useCreateProjectForm } from "./CreateProjectForm";
import { NewProjectEnvironmentDefinitions } from "./EnvironmentDefinitions";
import { ProjectOverview } from "./NewProjectOverview";

export function CreateProject() {
  const [search, _] = useSearchParams();
  const error = useError();
  const project_path = useMemo(() => {
    const path = search.get("path");
    const short_path = search.get("short_path");
    if (!path || !short_path) {
      return null;
    }

    return { path, short_path } satisfies ProjectPath;
  }, [search]);

  const form = useCreateProjectForm(error);

  const onSubmit: SubmitEventHandler = useCallback(
    (evt) => {
      evt.preventDefault();

      form.handleSubmit({ project_path });
    },
    [form.handleSubmit, project_path],
  );

  const is_valid = useSelector(form.store, (state) => state.isValid);

  return (
    <form className="content mx-auto container" onSubmit={onSubmit}>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            {project_path !== null && <IconDeviceLaptop className="size-10" />}
            {project_path === null && <IconCloud className="size-10" />}
            Create {project_path !== null ? "Local" : "Cloud"} Project
          </div>
        }
        className="sticky-below-nav bg-background"
      >
        {project_path !== null && (
          <div className="flex items-center gap-2 font-mono">
            <IconFolder /> {project_path.short_path}
          </div>
        )}
      </PageHeader>

      <ProjectOverview form={form} />

      <NewProjectEnvironmentDefinitions form={form} />

      <ErrorDisplay className="mt-8" value={error.value} />
      <div className="flex justify-end my-8">
        <Button
          type="submit"
          size="lg"
          isDisabled={!is_valid || error.is_pending}
        >
          <LoadingIcon
            Icon={IconFingerprint}
            loading={error.is_pending}
            className="size-6"
          />{" "}
          Create {project_path ? "Local" : "Cloud"} Project
        </Button>
      </div>
    </form>
  );
}
