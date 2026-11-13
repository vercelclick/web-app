import { Button, InputGroup, Separator, toast } from "@heroui/react";
import {
  IconAlignLeft,
  IconCircleCheck,
  IconFingerprint,
  IconKeyFilled,
  IconLock,
  IconLockOpen2,
  IconTag,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  useAuthorizationParams,
  useDecryptionParams,
} from "@/auth/useAuthorization";
import { useError } from "@/components";
import { CopyIcon } from "@/components/CopyIcon";
import { CLOUD_API_BASE_URL, LOCAL_API_BASE_URL } from "@/constants";
import {
  type ContributorPublicKey,
  type DecryptedSecret,
  decrypt_secrets,
  encrypt_secret,
  type SecretValue,
  type SecretWithEncryptedValues,
  type UpdateSecretRequest,
  type UpdateSecretValueRequest,
} from "@/core";
import { useVisibleAction } from "@/hooks";
import { resolveApiRequest } from "@/utils";
import { useProjectQuery } from "../queries";
import { fetchSecretTargets, useEnvironmentQuery } from "./queries";

export function SecretItem({
  definition,
  contributor_values,
}: SecretWithEncryptedValues) {
  const project = useProjectQuery(definition.project_id);
  const environment_query = useEnvironmentQuery(
    project.data?.path ?? null,
    definition.project_id,
    definition.env_name,
  );
  const error = useError();
  const [tag_values, setTagValues] = useState<DecryptedSecret[] | undefined>(
    undefined,
  );
  const [latest_value, setLatestValue] = useState<string | undefined>(
    undefined,
  );
  const [updated_value, setUpdatedValue] = useState<string | undefined>(
    undefined,
  );
  const [updated_comments, setUpdatedComments] = useState<string | undefined>(
    undefined,
  );

  const locked = useMemo(
    () => typeof latest_value === "undefined",
    [latest_value],
  );
  const get_decryption_params = useDecryptionParams(error);
  const get_authorization_params = useAuthorizationParams(error);

  const unLock = useCallback(async () => {
    const params_op = await get_decryption_params(
      project.data?.path ?? null,
      "secret decryption",
      {
        toast: true,
      },
    );
    if (!params_op.ok) {
      return;
    }

    const decryption_op = await error.catch(
      "Error decrypting secret",
      () =>
        decrypt_secrets({
          auth_request: params_op.result,
          encrypted_secrets: contributor_values as [
            ContributorPublicKey,
            SecretValue,
          ][],
        }),
      { toast: true },
    );

    if (!decryption_op.ok) {
      return;
    }

    const decrypted_secrets = decryption_op.result.decrypted_secrets;

    setLatestValue(
      decrypted_secrets.find((secret) => secret.tag === "latest")
        ?.plain_value ?? "",
    );
    setTagValues(decrypted_secrets.filter((secret) => secret.tag !== "latest"));
  }, [
    get_decryption_params,
    error.catch,
    contributor_values,
    project.data?.path,
  ]);

  const reset = useCallback(() => {
    setTagValues(undefined);
    setLatestValue(undefined);
    setUpdatedValue(undefined);
    setUpdatedComments(undefined);
    error.reset();
  }, [error.reset]);

  const onVisibilityChange = useCallback(
    (is_visible: boolean) => {
      if (!is_visible) {
        reset();
      }
    },
    [reset],
  );

  const updateSecret = useCallback(async () => {
    if (typeof updated_comments === "undefined") {
      return;
    }

    const update_op = await error.catch(
      "Error updating secret",
      () =>
        resolveApiRequest(
          `/api/projects/${definition.project_id}/env/${definition.env_name}/secrets/${definition.name}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              comments: updated_comments,
            } satisfies UpdateSecretRequest),
            base_url:
              (project.data?.path ?? null) === null
                ? CLOUD_API_BASE_URL
                : LOCAL_API_BASE_URL,
          },
        ),
      { toast: true },
    );

    if (!update_op.ok) {
      return;
    }

    const refresh_op = await error.catch(
      "Error updating secrets",
      () => environment_query.refetch(),
      { toast: true },
    );
    if (!refresh_op.ok) {
      return;
    }

    setUpdatedComments(undefined);
    toast("Update successful!", { variant: "success" });
  }, [
    definition.env_name,
    definition.name,
    definition.project_id,
    environment_query.refetch,
    error.catch,
    updated_comments,
    project.data?.path,
  ]);

  const updateSecretValue = useCallback(async () => {
    if (typeof updated_value === "undefined") {
      return;
    }
    const [challenge_op, targets_op] = await Promise.all([
      get_authorization_params(
        project.data?.path ?? null,
        "updating secret value",
        { toast: true },
      ),
      error.catch("Error fetching secret target keys", () =>
        fetchSecretTargets(
          project.data?.path ?? null,
          definition.project_id,
          definition.name,
          definition.project_id,
        ),
      ),
    ]);
    if (!challenge_op.ok || !targets_op.ok) {
      return;
    }

    const encryption_op = await error.catch(
      "Error encrypting secret",
      () =>
        encrypt_secret({
          auth_request: challenge_op.result,
          keys: targets_op.result,
          env_name: definition.env_name,
          name: definition.name,
          secret_value: updated_value,
          tag_name: "latest",
          project_id: definition.project_id,
        }),
      { toast: true },
    );

    if (!encryption_op.ok) {
      return;
    }

    const update_op = await error.catch(
      "Error updating secret",
      () =>
        resolveApiRequest(
          `/api/projects/${definition.project_id}/env/${definition.env_name}/secrets/${definition.name}/value`,
          {
            method: "PATCH",
            body: JSON.stringify({
              auth_result: encryption_op.result.auth_result,
              encrypted_values: encryption_op.result.encrypted_values,
            } satisfies UpdateSecretValueRequest),
            base_url:
              (project.data?.path ?? null) === null
                ? CLOUD_API_BASE_URL
                : LOCAL_API_BASE_URL,
          },
        ),
      { toast: true },
    );

    if (!update_op.ok) {
      return;
    }

    const refresh_op = await error.catch(
      "Error updating secrets",
      () => environment_query.refetch(),
      { toast: true },
    );
    if (!refresh_op.ok) {
      return;
    }

    // Set the previous value tag
    setTagValues((values) => {
      if (typeof values === "undefined") {
        return undefined;
      }

      return values.map((value) => {
        if (value.tag === "previous") {
          value.plain_value = latest_value ?? "";
        }
        return value;
      });
    });

    setLatestValue(updated_value);
    setUpdatedValue(undefined);

    toast("Update successful!", { variant: "success" });
  }, [
    error.catch,
    get_authorization_params,
    definition.env_name,
    definition.name,
    definition.project_id,
    environment_query.refetch,
    updated_value,
    latest_value,
    project.data?.path,
  ]);

  const ref = useRef<HTMLDivElement | null>(null);

  useVisibleAction(ref, undefined, onVisibilityChange);

  return (
    <div
      ref={ref}
      className={clsx(
        "bg-background-secondary px-6 py-4 rounded-xl flex flex-col",
      )}
    >
      <div className="flex items-start gap-4 flex-col md:flex-row">
        <div className="w-full md:w-1/3 xl:w-1/4 text-base text-left font-mono font-light flex justify-between items-center">
          {definition.name}
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className={clsx(
              "inline md:hidden",
              locked ? "hover:text-yellow-800" : "hover:text-success",
            )}
            onClick={locked ? unLock : reset}
          >
            {locked && <IconLock className="size-5" />}
            {!locked && <IconLockOpen2 className="size-5" />}
          </Button>
        </div>
        <div className={clsx("flex flex-col grow", locked ? "gap-1" : "gap-4")}>
          <InputGroup
            isDisabled={locked}
            variant={locked ? "secondary" : "primary"}
            className="group relative"
          >
            <InputGroup.Prefix>
              <IconKeyFilled className="text-muted size-5" />
            </InputGroup.Prefix>
            <InputGroup.TextArea
              disabled={locked || error.is_pending}
              placeholder={locked ? "--ENCRYPTED-SECRET--" : "SECRET VALUE..."}
              value={updated_value ?? latest_value ?? ""}
              onChange={(evt) => setUpdatedValue(evt.currentTarget.value)}
              className={clsx(
                "field-sizing-content overflow-x-auto resize-none max-h-24 font-mono",
              )}
            />
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <Button
                isDisabled={error.is_pending}
                className={clsx(
                  "h-auto",
                  typeof updated_value === "undefined" && "hidden",
                  updated_value === latest_value && "hidden",
                )}
                size="sm"
                variant="secondary"
                onClick={updateSecretValue}
              >
                <IconFingerprint /> Update
              </Button>

              <CopyIcon
                value={updated_value ?? latest_value ?? ""}
                className="size-5 hidden group-hover:inline"
              />
            </div>
          </InputGroup>

          <InputGroup
            className={clsx(
              locked && definition.comments.trim().length === 0 && "hidden",
            )}
            isDisabled={locked}
            variant={locked ? "secondary" : "primary"}
          >
            <InputGroup.Prefix>
              <IconAlignLeft className="text-muted size-5" />
            </InputGroup.Prefix>
            <InputGroup.TextArea
              disabled={error.is_pending}
              className={clsx("field-sizing-content resize-none max-h-24")}
              placeholder="Comments..."
              value={updated_comments ?? definition.comments}
              onChange={(evt) => setUpdatedComments(evt.currentTarget.value)}
            />
            <InputGroup.Suffix>
              <Button
                isDisabled={error.is_pending}
                className={clsx(
                  "h-auto",
                  typeof updated_comments === "undefined" && "hidden",
                  updated_comments === definition.comments && "hidden",
                )}
                size="sm"
                variant="secondary"
                onClick={updateSecret}
              >
                <IconCircleCheck /> Update
              </Button>
            </InputGroup.Suffix>
          </InputGroup>

          {(tag_values?.length ?? 0) > 0 && <Separator variant="secondary" />}
          {tag_values?.map((value) => (
            <InputGroup key={value.tag} className="group relative">
              <InputGroup.Prefix>
                <IconTag className="text-muted size-4" />
              </InputGroup.Prefix>

              <InputGroup.TextArea
                readOnly
                value={value.plain_value}
                className={clsx(
                  "field-sizing-content resize-none max-h-24 text-sm font-mono text-muted",
                )}
              />

              <div className="absolute top-2 right-2 flex items-center gap-2">
                <span className="text-sm text-muted">{value.tag}</span>
                <CopyIcon
                  value={value.plain_value}
                  className="size-5 hidden group-hover:inline"
                />
              </div>
            </InputGroup>
          ))}
        </div>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          className={clsx(
            "hidden md:inline",
            locked ? "hover:text-yellow-800" : "hover:text-success",
          )}
          onClick={locked ? unLock : reset}
        >
          {locked && <IconLock className="size-5" />}
          {!locked && <IconLockOpen2 className="size-5" />}
        </Button>
      </div>
    </div>
  );
}
