import { CLOUD_API_BASE_URL, LOCAL_API_BASE_URL } from "@/constants";
import type {
  ProjectPath,
  SignupChallengeRequest,
  WebauthnChallengeAnonymousResponse,
  WebauthnChallengeResponse,
} from "@/core";
import { resolveApiRequest } from "./requests";

export async function generateWebauthnAuthorizeChallenge(
  project_path: ProjectPath | null,
): Promise<WebauthnChallengeResponse> {
  const path = "/api/v1/auth/challenge/webauthn/authorize";

  return resolveApiRequest<WebauthnChallengeResponse>(path, {
    method: "POST",
    base_url: project_path === null ? CLOUD_API_BASE_URL : LOCAL_API_BASE_URL,
  });
}

export async function generatePasskeyCreateChallenge(): Promise<WebauthnChallengeResponse> {
  const path = "/api/v1/users/passkeys/challenge";

  return resolveApiRequest<WebauthnChallengeResponse>(path, {
    method: "POST",
    base_url: CLOUD_API_BASE_URL,
  });
}

export async function generatePasskeySignInChallenge(): Promise<WebauthnChallengeAnonymousResponse> {
  const path = "/api/v1/auth/signin/passkey/challenge";

  return resolveApiRequest<WebauthnChallengeAnonymousResponse>(path, {
    method: "POST",
    base_url: CLOUD_API_BASE_URL,
  });
}

export async function generatePasskeySignupChallenge(
  email: string,
): Promise<WebauthnChallengeResponse> {
  const path = "/api/v1/auth/signup/challenge";

  return resolveApiRequest<WebauthnChallengeResponse>(path, {
    method: "POST",
    body: JSON.stringify({
      owner: email,
    } satisfies SignupChallengeRequest),
    base_url: CLOUD_API_BASE_URL,
  });
}
