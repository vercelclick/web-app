import { Button, IconPlus, toast } from "@heroui/react";
import { IconLockAccess } from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback } from "react";
import TimeAgo from "react-timeago";
import { useSession } from "@/auth";
import { Alert, useError } from "@/components";
import { generateWebauthnChallenge } from "@/components/otp";
import { SectionHeader } from "@/components/sections/header";
import { authorize_operation, type Passkey, type User } from "@/core";
import { CreatePasskeyButton } from "@/user/CreatePasskey";

export function PasskeysList() {
  const session = useSession();

  return (
    <div>
      <SectionHeader title="Your Passkeys">
        <CreatePasskeyButton variant="ghost">
          <IconPlus className={"text-accent"} />
          Add a new passkey
        </CreatePasskeyButton>
      </SectionHeader>

      <div className="bg-surface px-4 py-6 rounded-xl">
        {session.passkeys.length === 0 && (
          <Alert
            status="warning"
            title={`Vault passkey missing`}
            className="my-8 shadow-none bg-background"
          >
            <p>
              You don't have a vault passkey setup, you won't be able to access
              secrets without a passkey. Click add a new passkey to setup.
            </p>
          </Alert>
        )}

        <div className="grid gap-x-6 gap-y-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {session.passkeys.map((passkey) => (
            <PasskeyItem
              key={passkey.cred_id}
              passkey={passkey}
              user={session.user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PasskeyItem({ passkey, user }: { passkey: Passkey; user: User }) {
  const error = useError();
  const onVerify = useCallback(async () => {
    const challenge_op = await error.catch(
      "Error creating challenge",
      () => generateWebauthnChallenge("PasskeyAuthorize", user.email),
      { toast: true },
    );

    if (!challenge_op.ok) {
      return;
    }

    const authorize_op = await error.catch(
      "Error authorizing passkey check",
      () =>
        authorize_operation({
          challenge: challenge_op.result.challenge,
          allowed_credentials: [passkey.cred_id],
        }),
      { toast: true },
    );

    if (authorize_op.ok) {
      toast(`${passkey.name} is usable on this device!`, {
        variant: "success",
      });
    }
  }, [user.email, passkey.cred_id, passkey.name, error.catch]);

  return (
    <div className="group bg-background hover:bg-background-secondary p-4 rounded-xl flex gap-4 items-start">
      <IconLockAccess className={clsx("size-6 text-accent")} />
      <div className="flex flex-col gap-2 grow">
        <div className="flex justify-between h-6 items-start">
          <div className={clsx("grow font-semibold")}>{passkey.name}</div>
          <Button
            className="hidden group-hover:flex h-auto mr-2"
            size="sm"
            variant="outline"
            onClick={onVerify}
          >
            Check
          </Button>
        </div>
        <div className="text-muted flex gap-2 text-sm">
          <div className="grow" />
          <TimeAgo date={passkey.created_at} />
        </div>
      </div>
    </div>
  );
}
