import { toast } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import * as uuid from "uuid";
import * as z from "zod";
import type { ErrorHook } from "@/components/error";
import { sendEmailChallenge } from "@/components/otp";
import {
  type AuthTokenResponse,
  create_passkey,
  generate_public_keys,
  generate_salt,
  type PasskeyCreationResult,
  type SignupRequest,
} from "@/core";
import { resolveApiRequest, updateSessionToken } from "@/utils";
import { generatePasskeySignupChallenge } from "@/utils/challenge";

const signup_schema = z.object({
  profile: z.object({
    id: z.string(),
    email: z.email(),
    name: z.string().min(2),
  }),
  confirmation: z.object({
    confirmation_code: z.string(),
    passkey_name: z.string(),
  }),
  passkey: z.object({
    challenge: z.string(),
    create_result: z.string(),
  }),
});

export type SignupFormData = z.infer<typeof signup_schema>;

export function useSignupForm(error: ErrorHook) {
  const [started, setStarted] = useState(false);
  const form = useForm({
    defaultValues: {
      profile: {
        id: uuid.v7(),
        name: "",
        email: "",
      },
      confirmation: {
        passkey_name: "",
        confirmation_code: "",
      },
      passkey: {
        challenge: "",
        create_result: "",
      },
    } satisfies SignupFormData,
    validators: { onChange: signup_schema, onMount: signup_schema },
    onSubmit: async ({
      value: { profile, passkey, confirmation },
      formApi,
    }) => {
      if (passkey.challenge === "") {
        const challenge_op = await error.catch(
          "Error creating passkey challenge",
          () => generatePasskeySignupChallenge(profile.email),
          { capture: "signup_generate_passkey_challenge" },
        );
        if (!challenge_op.ok) {
          return;
        }

        const create_op = await error.catch(
          "Error creating passkey",
          () =>
            create_passkey({
              challenge: challenge_op.result.challenge,
              email: profile.email,
              full_name: profile.name,
              exclude_keys: [],
              user_id: profile.id,
            }),
          { capture: "signup_create_passkey" },
        );
        if (!create_op.ok) {
          return;
        }

        // Intentionally allow temporary failure allowing the user to resend the challenge
        await error.catch(
          "Temporary error sending email code",
          () =>
            sendEmailChallenge("EmailSignup", profile.email, {
              name: profile.name,
            }),
          {
            toast: true,
            capture: "signup_send_email_challenge",
          },
        );

        formApi.setFieldValue("passkey", {
          challenge: challenge_op.result.challenge,
          create_result: JSON.stringify(create_op.result),
        });

        setStarted(true);
        return;
      }

      const create_result: PasskeyCreationResult = JSON.parse(
        passkey.create_result,
      );

      const user_salt = generate_salt();
      const passkey_salt = generate_salt();

      const pubkey_op = await error.catch(
        "Error authorizing with passkey",
        () =>
          generate_public_keys({
            challenge: passkey.challenge,
            prf_configs: [
              {
                cred_id: create_result.id,
                user_salt,
                passkey_salt,
              },
            ],
          }),
        { capture: "signup_authorize_create" },
      );

      if (!pubkey_op.ok) {
        return;
      }

      const registration_result = await error.catch(
        "Error creating account",
        () =>
          resolveApiRequest<AuthTokenResponse>("/api/v1/auth/signup", {
            method: "POST",
            body: JSON.stringify({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              user_salt,
              passkey_name: confirmation.passkey_name,
              confirmation_code: confirmation.confirmation_code,
              passkey_salt,
              passkey_result: create_result,
              public_key: pubkey_op.result.public_key,
              auth_result: pubkey_op.result.auth_result,
            } satisfies SignupRequest),
          }),
        {
          capture: "signup_complete",
        },
      );

      if (!registration_result.ok) {
        return;
      }

      updateSessionToken(registration_result.result.token);

      toast("Registration successful!", { variant: "success" });
    },
  });

  return { started, form };
}
