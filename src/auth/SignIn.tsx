import {
  Button,
  Description,
  Input,
  Label,
  Separator,
  TextField,
  toast,
} from "@heroui/react";
import { IconArrowRight, IconFingerprint, IconMail } from "@tabler/icons-react";
import { useForm, useSelector } from "@tanstack/react-form";
import clsx from "clsx";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import { ErrorDisplay, useError } from "@/components";
import { LoadingIcon } from "@/components/loader";
import { ConfirmationCodeInput, sendEmailChallenge } from "@/components/otp";
import { CLOUD_API_BASE_URL } from "@/constants";
import {
  type AuthTokenResponse,
  authorize_operation,
  type EmailSignInRequest,
  type PasskeySignInRequest,
} from "@/core";
import { resolveApiRequest, updateSessionToken } from "@/utils";
import { generatePasskeySignInChallenge } from "@/utils/challenge";

const signin_schema = z.object({
  email_address: z.email(),
  confirmation_code: z.string(),
});

type SignInFormData = z.infer<typeof signin_schema>;

export function SignInForm() {
  const error = useError();
  const [started, setStarted] = useState(false);

  const signInWithPasskey = useCallback(async () => {
    const challenge_op = await error.catch(
      "Error generating passkey challenge",
      () => generatePasskeySignInChallenge(),
    );

    if (!challenge_op.ok) {
      return;
    }

    const auth_result = await error.catch("Error signing in with passkey", () =>
      authorize_operation({
        challenge: challenge_op.result.challenge,
        allowed_credentials: [],
      }),
    );

    if (!auth_result.ok) {
      return;
    }

    const completion_result = await error.catch(
      "Error completing signing in process",
      () =>
        resolveApiRequest<AuthTokenResponse>("/api/v1/auth/signin/passkey", {
          method: "POST",
          body: JSON.stringify({
            owner: challenge_op.result.owner,
            auth_response: auth_result.result,
          } satisfies PasskeySignInRequest),
          base_url: CLOUD_API_BASE_URL,
        }),
    );

    if (!completion_result.ok) {
      return;
    }

    updateSessionToken(completion_result.result.token);

    toast("Sign in successful!", { variant: "success" });
  }, [error.catch]);

  const form = useForm({
    defaultValues: {
      email_address: "",
      confirmation_code: "",
    } satisfies SignInFormData,
    validators: { onChange: signin_schema, onMount: signin_schema },
    onSubmit: async ({ value: { email_address, confirmation_code } }) => {
      if (confirmation_code) {
        const completion_result = await error.catch(
          "Error completing sign in",
          () =>
            resolveApiRequest<AuthTokenResponse>("/api/v1/auth/signin/email", {
              method: "POST",
              body: JSON.stringify({
                email_address,
                confirmation_code,
              } satisfies EmailSignInRequest),
              base_url: CLOUD_API_BASE_URL,
            }),
        );

        if (!completion_result.ok) {
          return;
        }

        updateSessionToken(completion_result.result.token);
        toast("Sign in successful!", { variant: "success" });

        return;
      }

      await error.catch(
        "Error sending signin code, if not received, please resend",
        () => sendEmailChallenge("EmailSignIn", email_address),
        { toast: true },
      );
      setStarted(true);
    },
  });

  const email_valid = useSelector(
    form.store,
    (state) => state.fieldMeta.email_address?.isValid,
  );

  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      form.handleSubmit();
    },
    [form.handleSubmit],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex justify-center my-2">
        <Button
          aria-label="Signin with Passkey"
          isDisabled={error.is_pending}
          size="lg"
          type="button"
          value="false"
          onClick={signInWithPasskey}
        >
          <LoadingIcon
            Icon={IconFingerprint}
            loading={error.is_pending}
            className="size-5"
          />
          Sign in with a Passkey
        </Button>
      </div>

      <div className="flex gap-6 items-center">
        <Separator className="flex-1" />
        Or
        <Separator className="flex-1" />
      </div>

      <form.Field name="email_address">
        {(field) => (
          <TextField
            variant="secondary"
            isReadOnly={started}
            isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
            isRequired
          >
            <Label htmlFor="id">Email address</Label>
            <Input
              autoComplete="email"
              spellCheck={false}
              type="email"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
            />
            <Description>
              Use this option if you don't have a passkey registered on this
              device.
            </Description>
          </TextField>
        )}
      </form.Field>

      {started && (
        <form.Field name="confirmation_code">
          {(field) => (
            <ConfirmationCodeInput
              kind="EmailSignIn"
              onConfirmation={field.handleChange}
              owner={form.state.values.email_address}
            />
          )}
        </form.Field>
      )}

      <ErrorDisplay value={error.value} />

      <div
        className={clsx(
          "flex gap-4 flex-col-reverse md:flex-row items-center justify-end",
        )}
      >
        {!started && (
          <Button
            size="lg"
            type="submit"
            variant="ghost"
            aria-label="Sign in with Email"
            isDisabled={error.is_pending || !email_valid}
            value="true"
          >
            <IconMail className="size-5" />
            Sign in with Email
          </Button>
        )}

        {started && (
          <Button
            aria-label="Complete sign in"
            isDisabled={error.is_pending || !form.state.isValid}
            size="lg"
            type="submit"
          >
            <IconArrowRight className="size-5" />
            Complete sign in
          </Button>
        )}
      </div>
    </form>
  );
}
