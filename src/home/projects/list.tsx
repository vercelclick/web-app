import { Button, IconPlus } from "@heroui/react";
import { IconFolder, IconShieldHalfFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { Link } from "react-router";
import { Alert } from "@/components";
import { SimpleMono } from "@/components/command";
import { SectionHeader } from "@/components/sections/header";
import type { Project, ProjectListItem, ProjectPath } from "@/core";

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
            status="warning"
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
  return (
    <Link
      to={`/p/${project.id}`}
      className={clsx(
        "bg-background p-4 rounded-xl flex gap-4 items-start",
        inaccessible && "text-muted",
        !inaccessible && "hover:bg-background-secondary",
      )}
    >
      <IconShieldHalfFilled
        className={clsx("size-6", inaccessible ? "" : "text-accent")}
      />
      <div className="flex flex-col gap-2 grow">
        <div className="font-semibold">{project.name}</div>
        {project.description && (
          <div className="text-xs text-muted">{project.description}</div>
        )}

        {path !== null && (
          <div className="flex justify-end text-xs font-mono items-center text-muted">
            <IconFolder className="size-4" />
            {path.short_path}
          </div>
        )}
      </div>
    </Link>
  );
}
