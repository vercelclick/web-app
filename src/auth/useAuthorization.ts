import { useCallback, useMemo } from "react";
import type { CatchOptions, ErrorHook } from "@/components/error";
import {
  type AuthorizationRequest,
  authorize_operation,
  type DecryptionAuthorizationRequest,
  type PrfDeriveConfig,
  type ProjectPath,
} from "@/core";
import { generateWebauthnAuthorizeChallenge } from "@/utils/challenge";
import { useSession } from "./session.provider";

export function useAuthorizationParams(error: ErrorHook) {
  const { passkeys } = useSession();

  const allowed_credentials = useMemo(
    () => passkeys.map((pk) => pk.cred_id),
    [passkeys],
  );

  const compileParams = useCallback(
    async (
      project_path: ProjectPath | null,
      operation: string,
      options?: CatchOptions,
    ) =>
      error.catch(
        `Error generating ${operation} challenge`,
        () =>
          generateWebauthnAuthorizeChallenge(project_path).then(
            ({ challenge }) =>
              ({
                challenge,
                allowed_credentials,
              }) satisfies AuthorizationRequest,
          ),
        options,
      ),
    [allowed_credentials, error.catch],
  );

  return compileParams;
}

export function useDecryptionParams(error: ErrorHook) {
  const { passkeys, user } = useSession();

  const prf_configs = useMemo(
    () =>
      passkeys.map(
        (pk) =>
          ({
            cred_id: pk.cred_id,
            user_salt: user.key_salt,
            passkey_salt: pk.key_salt,
          }) satisfies PrfDeriveConfig,
      ),
    [passkeys, user.key_salt],
  );

  const compileParams = useCallback(
    async (
      project_path: ProjectPath | null,
      operation: string,
      options?: CatchOptions,
    ) =>
      error.catch(
        `Error generating ${operation} challenge`,
        () =>
          generateWebauthnAuthorizeChallenge(project_path).then(
            ({ challenge }) =>
              ({
                challenge,
                prf_configs,
              }) satisfies DecryptionAuthorizationRequest,
          ),
        options,
      ),
    [prf_configs, error.catch],
  );

  return compileParams;
}

export function useAuthorization(error: ErrorHook) {
  const compileParams = useAuthorizationParams(error);

  const authorize = useCallback(
    async (
      project_path: ProjectPath | null,
      operation: string,
      options?: CatchOptions,
    ) => {
      const params_op = await compileParams(project_path, operation);
      if (!params_op.ok) {
        return params_op;
      }

      return await error.catch(
        `Error authorizing ${operation}`,
        () => authorize_operation(params_op.result),
        options,
      );
    },
    [compileParams, error.catch],
  );

  return authorize;
}
