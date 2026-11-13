import { Description } from "@heroui/react";
import { IconCode } from "@tabler/icons-react";
import { Link } from "react-router";
import TimeAgo from "react-timeago";
import type { Environment } from "@/core";

export function EnvironmentItem({
  environment,
  project_id,
}: {
  environment: Environment;
  project_id: string;
}) {
  return (
    <Link
      to={`/p/${project_id}/env/${environment.name}`}
      className="bg-background hover:bg-background-secondary p-4 flex flex-col gap-2 rounded-xl"
    >
      <div className="flex gap-2 font-mono text-lg items-center">
        <IconCode className="h-6 w-auto" />
        {environment.name}
      </div>

      {environment.description && (
        <Description>{environment.description}</Description>
      )}
      <div className="flex grow justify-end items-end text-xs font-mono text-muted">
        <TimeAgo date={environment.created_at} />
      </div>
    </Link>
  );
}
