import { Button, IconPlus } from "@heroui/react";
import { IconCloud, IconDeviceLaptop, IconFolder } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";
import TimeAgo from "react-timeago";
import { Alert } from "@/components";
import { SimpleMono } from "@/components/command";
import { SectionHeader } from "@/components/sections/header";
import type { Project, ProjectListItem, ProjectPath } from "@/core";
import { useUuidTimestamp } from "@/utils/uuid";

export function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  return (
    <div>
      <SectionHeader title="Your projects">
        <Link to="/new">
          <Button variant={projects.length === 0 ? "primary" : "ghost"}>
            <IconPlus className={projects.length === 0 ? "" : "text-accent"} />
            Create cloud project
          </Button>
        </Link>
      </SectionHeader>
      <div className="bg-surface px-4 py-6 rounded-xl">
        {projects.length === 0 && (
          <Alert
            status="default"
            className="rounded-2xl bg-background shadow-none"
            title="Create, attach or request access to projects"
          >
            You don't have access to any projects at the moment; you can attach
            a local project by running <SimpleMono value="spass local attach" />{" "}
            or, select <Link to="/new">create cloud project</Link>. To access an
            existing project, request your admin to invite you to an existing
            project.
          </Alert>
        )}

        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(({ path, project }) => (
            <ProjectCard key={project.id} project={project} path={path} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCard({
  project,
  path,
  inaccessible,
}: {
  project: Project;
  path: ProjectPath | null;
  inaccessible?: boolean;
}) {
  const created_at = useUuidTimestamp(project.id);
  return (
    <Link
      to={`/p/${project.id}`}
      className={clsx(
        "bg-background px-4 pt-4 pb-2 rounded-xl flex flex-col gap-2",
        inaccessible && "text-muted pointer-events-none",
        !inaccessible && "hover:bg-background-secondary",
      )}
    >
      <div className="flex gap-2">
        {path !== null && (
          <IconDeviceLaptop
            className={clsx("size-6", inaccessible && "text-muted")}
          />
        )}
        {path === null && <IconCloud className="size-6" />}
        <div className={clsx("font-semibold", inaccessible && "text-muted")}>
          {project.name}
        </div>
      </div>

      {project.description && (
        <div className="text-xs text-muted">{project.description}</div>
      )}

      <div className="flex items-end grow text-xs font-mono text-muted">
        {path !== null && (
          <div className="flex gap-1 items-end">
            <IconFolder className="size-4" />
            {path.short_path}
          </div>
        )}
        <div className="grow" />
        <TimeAgo date={created_at} />
      </div>
    </Link>
  );
}
