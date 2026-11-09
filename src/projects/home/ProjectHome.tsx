import { Button, IconPlus } from "@heroui/react";
import { IconUsers } from "@tabler/icons-react";
import { useParams } from "react-router";
import { SectionHeader } from "@/components/sections/header";
import { Shimmer } from "@/components/shimmer";
import { AccessKeysList } from "../access/AccessKeysList";
import { ProjectLayout } from "../ProjectLayout";
import { useProjectQuery } from "../queries";
import { EnvironmentItem } from "./environment";

export function ProjectHome() {
  const { project_id } = useParams<{ project_id: string }>();
  const { data, isPending, isError, isSuccess } = useProjectQuery(
    project_id || "",
  );

  return (
    <ProjectLayout
      links={[]}
      actions={
        isSuccess &&
        data.contributor.role === "Admin" && (
          <Button variant="ghost" size="sm">
            <IconPlus className="text-accent" /> Create Environment
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4 bg-surface rounded-xl py-6 px-4">
        {data?.environments.map((environment) => (
          <EnvironmentItem
            key={environment.name}
            project_id={project_id ?? ""}
            environment={environment}
          />
        ))}
      </div>

      <SectionHeader
        title={
          <>
            <IconUsers className="size-6" /> Users
          </>
        }
      >
        <Button variant="ghost" size="sm">
          <IconPlus className="text-accent" /> Add User
        </Button>
      </SectionHeader>

      <Shimmer active={isPending} hidden={isError}>
        <AccessKeysList
          access_keys={data?.access_keys ?? []}
          project_id={project_id ?? ""}
        />
      </Shimmer>
    </ProjectLayout>
  );
}
