import { Chip } from "@heroui/react";
import { IconBotId, IconCode, IconKeyFilled } from "@tabler/icons-react";
import TimeAgo from "react-timeago";
import { Alert } from "@/components";
import { SectionHeader } from "@/components/sections/header";
import type { AccessKey } from "@/core";
import { CreateAccessKeyDialog } from "./CreateAccessKey";

export function AccessKeyCard({ access_key }: { access_key: AccessKey }) {
  return (
    <div className="bg-background hover:bg-background-secondary p-4 flex gap-4 items-start rounded-xl">
      <IconKeyFilled className="h-6 w-auto text-muted" />
      <div className="flex flex-col grow gap-1">
        <div className="text-lg">{access_key.name}</div>
        <div className="grow flex gap-4">
          {access_key.access.map((item) => (
            <Chip size="sm" key={item.name}>
              <IconCode className="h-3 w-auto" />
              {item.name}
            </Chip>
          ))}
        </div>
        <div className="text-xs text-muted flex justify-between">
          <span>{access_key.generated_by}</span>
          <TimeAgo date={access_key.generated_on} />
        </div>
      </div>
    </div>
  );
}

export function AccessKeysList({
  access_keys,
  project_id,
}: {
  access_keys: AccessKey[];
  project_id: string;
}) {
  return (
    <div>
      <SectionHeader
        title={
          <>
            <IconBotId className="size-6 text-accent" /> Machine Access
          </>
        }
      >
        <CreateAccessKeyDialog project_id={project_id ?? ""} />
      </SectionHeader>
      <div className="bg-surface px-4 py-6 rounded-xl">
        {access_keys.length === 0 && (
          <Alert
            status="warning"
            className="rounded-2xl bg-background shadow-none"
          >
            You don't have any access keys at the moment, click add access key
            to generate new keys
          </Alert>
        )}
        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {access_keys.map((access_key) => (
            <AccessKeyCard key={access_key.id} access_key={access_key} />
          ))}
        </div>
      </div>
    </div>
  );
}
