import { Button, Separator, Tooltip } from "@heroui/react";
import {
  IconCloud,
  IconDeviceLaptop,
  type TablerIcon,
} from "@tabler/icons-react";
import type { UseQueryResult } from "@tanstack/react-query";
import clsx from "clsx";
import { useMemo } from "react";
import { Alert, LoadingIcon } from "@/components";
import { PageHeader } from "@/components/sections/header";
import { Shimmer } from "@/components/shimmer";
import { CLOUD_API_BASE_URL, LOCAL_API_BASE_URL } from "@/constants";
import {
  useCloudProjectsListQuery,
  useLocalProjectsListQuery,
} from "@/projects";
import { HelpTopicList } from "./help";
import { PasskeysList } from "./PasskeysList";
import { InaccessibleProjectsList } from "./projects/inaccessible";
import { ProjectsList } from "./projects/list";
import { PendingProjectsList } from "./projects/pending";
import { RunnerDialog } from "./run";

export function HomeDashboard() {
  const local_projects = useLocalProjectsListQuery();
  const cloud_projects = useCloudProjectsListQuery();

  const isPending = useMemo(
    () => local_projects.isPending && cloud_projects.isPending,
    [local_projects.isPending, cloud_projects.isPending],
  );

  const projects = useMemo(
    () => [
      ...(local_projects.data?.projects ?? []),
      ...(cloud_projects.data?.projects ?? []),
    ],
    [cloud_projects.data, local_projects.data],
  );

  const pending = useMemo(
    () => [...(local_projects.data?.pending ?? [])],
    [local_projects.data],
  );
  const inaccessible = useMemo(
    () => [...(local_projects.data?.inaccessible ?? [])],
    [local_projects.data],
  );

  return (
    <div className="content mx-auto container">
      <PageHeader title="Home" className="sticky-below-nav">
        <StatusButton
          query={local_projects}
          Icon={IconDeviceLaptop}
          title={LOCAL_API_BASE_URL}
        />
        <StatusButton
          query={cloud_projects}
          Icon={IconCloud}
          title={CLOUD_API_BASE_URL}
        />
      </PageHeader>

      {cloud_projects.isError && (
        <Alert
          status="warning"
          title={`Error loading projects list`}
          className="my-8 shadow-none"
        >
          {String(cloud_projects.error)}
        </Alert>
      )}

      <Shimmer className="h-32" active={isPending}>
        <ProjectsList projects={projects} />
      </Shimmer>

      <Shimmer className="h-32" active={isPending}>
        <PendingProjectsList paths={pending} />
      </Shimmer>

      <Shimmer className="h-32" active={isPending}>
        <PasskeysList />
      </Shimmer>

      <Shimmer
        className="h-32"
        active={isPending}
        hidden={inaccessible.length === 0}
      >
        <InaccessibleProjectsList projects={inaccessible} />
      </Shimmer>

      <section className="my-10" aria-labelledby="home-help-title">
        <div className="mb-3 flex items-center gap-6">
          <Separator className="flex-1" />
          <h2
            id="home-help-title"
            className="text-center text-lg font-semibold tracking-tight"
          >
            Need a hand with your vault?
          </h2>
          <Separator className="flex-1" />
        </div>
        <p className="mx-auto mb-6 max-w-xl text-center text-sm leading-6 text-muted">
          Connect a project, finish setup, or check your account access. Your
          passkey keeps your secrets yours.
        </p>
        <HelpTopicList />
      </section>

      <RunnerDialog />
    </div>
  );
}

function StatusButton({
  query,
  title,
  Icon,
}: {
  query: UseQueryResult;
  title: string;
  Icon: TablerIcon;
}) {
  return (
    <Tooltip shouldSkipAnimation delay={0}>
      <Button
        isIconOnly
        isDisabled={query.isFetching}
        variant="ghost"
        onClick={() => query.refetch()}
      >
        <LoadingIcon
          Icon={Icon}
          className={clsx(
            "size-6",
            query.isError && "text-danger",
            query.isSuccess && "text-success",
          )}
          loading={query.isFetching}
        />
      </Button>
      <Tooltip.Content showArrow placement="bottom">
        <Tooltip.Arrow />
        <Alert
          title={<div className="text-sm font-bold font-mono">{title}</div>}
          status={
            query.isSuccess ? "success" : query.isError ? "danger" : "default"
          }
          className="shadow-none"
        >
          {query.isError && String(query.error)}
          {query.isSuccess && "CONNECTED"}
          {query.isPending && "Pending"}
        </Alert>
      </Tooltip.Content>
    </Tooltip>
  );
}
