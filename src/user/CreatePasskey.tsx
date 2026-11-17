import {
  Button,
  type ButtonProps,
  Description,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import { IconCircleCheck, IconFingerprint } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { type SubmitEventHandler, useCallback, useState } from "react";
import * as z from "zod";
import { useSession } from "@/auth";
import { ErrorDisplay, useError } from "@/components";
import { ConfirmationCodeInput, sendEmailChallenge } from "@/components/otp";
import { CLOUD_API_BASE_URL } from "@/constants";
import {
  type AuthTokenResponse,
  type CreatePasskeyRequest,
  create_passkey,
  generate_public_keys,
  generate_salt,
  type PasskeyCreationResult,
} from "@/core";
import { resolveApiRequest, updateSessionToken } from "@/utils";
import { generatePasskeyCreateChallenge } from "@/utils/challenge";

const createSchema = z.object({
  passkey_name: z.string().min(2),
  confirmation_code: z.string().length(6),
});

type CreateForm = z.infer<typeof createSchema>;

export function CreatePasskeyButton(props: ButtonProps) {
  const [create_response, setCreateResponse] = useState<{
    create_response: PasskeyCreationResult;
    challenge: string;
  } | null>(null);
  const error = useError();
  const { user, passkeys } = useSession();
  const [success, setSuccess] = useState(false);

  const createPasskey = useCallback(async () => {
    const passkey_challenge_op = await error.catch(
      "Error starting passkey creation",
      () => generatePasskeyCreateChallenge(),
    );
    if (!passkey_challenge_op.ok) {
      return;
    }

    const create_result = await error.catch("Error creating passkey", () =>
      create_passkey({
        challenge: passkey_challenge_op.result.challenge,
        email: user.email,
        user_id: user.id,
        exclude_keys: passkeys.map((passkey) => passkey.cred_id),
        full_name: user.name,
      }),
    );

    if (!create_result.ok) {
      return;
    }

    // Ignore this result allowing the user to retry
    await error.catch(
      "Error sending email challenge",
      () =>
        sendEmailChallenge("EmailAuthorize", user.email, {
          operation: "attempted to create a new passkey",
        }),
      { toast: true },
    );

    setCreateResponse({
      create_response: create_result.result,
      challenge: passkey_challenge_op.result.challenge,
    });
  }, [error.catch, user, passkeys]);

  const form = useForm({
    defaultValues: {
      passkey_name: "",
      confirmation_code: "",
    } satisfies CreateForm,
    onSubmitMeta: {} as {
      create_response: PasskeyCreationResult;
      challenge: string;
    },
    onSubmit: async (data) => {
      const passkey_salt = generate_salt();

      const pubkey_op = await error.catch(
        "Error authorizing save passkey",
        () =>
          generate_public_keys({
            prf_configs: [
              {
                passkey_salt,
                user_salt: user.key_salt,
                cred_id: data.meta.create_response.id,
              },
            ],
            challenge: data.meta.challenge,
          }),
      );

      if (!pubkey_op.ok) {
        return;
      }

      const save_response = await error.catch("Error saving passkey", () =>
        resolveApiRequest<AuthTokenResponse>("/api/users/passkeys/create", {
          method: "POST",
          body: JSON.stringify({
            salt: passkey_salt,
            confirmation_code: data.value.confirmation_code,
            create_result: data.meta.create_response,
            name: data.value.passkey_name,
            public_key: pubkey_op.result.public_key,
            auth_result: pubkey_op.result.auth_result,
          } satisfies CreatePasskeyRequest),
          base_url: CLOUD_API_BASE_URL,
        }),
      );

      if (!save_response.ok) {
        return;
      }

      updateSessionToken(save_response.result.token);
    },
  });

  const onSubmit: SubmitEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      if (create_response === null) {
        createPasskey();
        return;
      }

      form.handleSubmit(create_response);
    },
    [create_response, createPasskey, form.handleSubmit],
  );

  const reset = useCallback(() => {
    form.reset();
    setCreateResponse(null);
    setSuccess(false);
  }, [form.reset]);

  return (
    <Modal
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
        }
      }}
    >
      <Button {...props} onClick={createPasskey}></Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex-row items-center">
              <Modal.Icon>
                {!success && <IconFingerprint className="size-6" />}
                {success && <IconCircleCheck className="size-6 text-success" />}
              </Modal.Icon>
              {!success && <Modal.Heading>Create a new passkey</Modal.Heading>}
              {success && <Modal.Heading>Passkey created</Modal.Heading>}
            </Modal.Header>
            <Modal.Body>
              {!success && (
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                  {create_response !== null && (
                    <form.Field name="passkey_name">
                      {(field) => (
                        <TextField isRequired variant="secondary">
                          <Label>Passkey Name</Label>
                          <Input
                            type="text"
                            name={field.name}
                            value={field.state.value}
                            onChange={(evt) =>
                              field.handleChange(evt.currentTarget.value)
                            }
                          />
                          <Description>
                            Since your account can have multiple passkeys, git
                            this one a name to distinguish it
                          </Description>
                        </TextField>
                      )}
                    </form.Field>
                  )}

                  {create_response !== null && (
                    <form.Field name="confirmation_code">
                      {(field) => (
                        <ConfirmationCodeInput
                          kind="EmailAuthorize"
                          onConfirmation={field.handleChange}
                          owner={user.email}
                          operation="attempted to create a new passkey"
                        />
                      )}
                    </form.Field>
                  )}
                  <ErrorDisplay value={error.value} />

                  <div className="flex justify-between">
                    <Button variant="danger-soft" type="button" onClick={reset}>
                      Reset
                    </Button>

                    <Button type="submit">
                      <IconFingerprint />
                      {create_response === null && "Create Passkey"}
                      {create_response !== null && "Save Passkey"}
                    </Button>
                  </div>
                </form>
              )}
              {success && (
                <Description>
                  Your passkey has been created successfully and ready for use,
                  you can close this dialog.
                </Description>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
