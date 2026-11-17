import {
  Button,
  Description,
  IconPlus,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { IconCode, IconFingerprint } from "@tabler/icons-react";
import { useForm, useSelector } from "@tanstack/react-form";
import { useState } from "react";
import * as z from "zod";
import { useAuthorization } from "@/auth/useAuthorization";
import { ErrorDisplay, useError } from "@/components";
import {
  CLOUD_API_BASE_URL,
  LOCAL_API_BASE_URL,
  SAFE_NAME_SCHEMA,
} from "@/constants";
import type { CreateEnvironmentRequest, ProjectPath } from "@/core";
import { resolveApiRequest } from "@/utils";
import { useProjectQuery } from "../queries";

const createEnvironmentSchema = z.object({
  name: SAFE_NAME_SCHEMA,
  description: z.string(),
});

export function CreateEnvironmentDialog({
  project_id,
}: {
  project_id: string;
}) {
  const error = useError();
  const [open, setOpen] = useState(false);
  const authorize = useAuthorization(error);
  const project_query = useProjectQuery(project_id);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    } satisfies z.infer<typeof createEnvironmentSchema>,
    validators: {
      onChange: createEnvironmentSchema,
      onMount: createEnvironmentSchema,
    },
    onSubmitMeta: {} as {
      project_path: ProjectPath | null;
      project_id: string;
    },
    onSubmit: async ({
      value: { name, description },
      meta: { project_path, project_id },
    }) => {
      const auth_op = await authorize(project_path, "create environment");

      if (!auth_op.ok) {
        return;
      }

      const create_op = await error.catch("Error creating environment", () =>
        resolveApiRequest(`/api/v1/projects/${project_id}/env`, {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            auth_result: auth_op.result,
          } satisfies CreateEnvironmentRequest),
          base_url:
            project_path === null ? CLOUD_API_BASE_URL : LOCAL_API_BASE_URL,
        }),
      );

      if (!create_op.ok) {
        return;
      }

      project_query.refetch().finally(() => {
        form.reset();
        setOpen(false);
        toast(`Environment '${name}' created successfully`, {
          variant: "success",
        });
      });
    },
  });

  const is_valid = useSelector(form.store, (state) => state.isValid);

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <Button variant="ghost" size="sm">
        <IconPlus className="text-accent" /> Add Environment
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-row items-center">
              <Modal.Icon>
                <IconCode className="size-7" />
              </Modal.Icon>
              <Modal.Heading>Create Environment</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <form
                className="flex flex-col gap-6 my-6"
                onSubmit={(evt) => {
                  evt.preventDefault();

                  form.handleSubmit({
                    project_path: project_query?.data?.path ?? null,
                    project_id,
                  });
                }}
              >
                <form.Field name="name">
                  {(field) => (
                    <TextField
                      isRequired
                      variant="secondary"
                      isDisabled={field.form.state.isSubmitting}
                      isInvalid={
                        field.state.meta.isDirty && !field.state.meta.isValid
                      }
                    >
                      <Label>Environment name</Label>
                      <Input
                        value={field.state.value}
                        onChange={(evt) =>
                          field.handleChange(evt.currentTarget.value)
                        }
                        placeholder="Env name..."
                      />
                    </TextField>
                  )}
                </form.Field>
                <form.Field name="description">
                  {(field) => (
                    <TextField
                      variant="secondary"
                      isDisabled={field.form.state.isSubmitting}
                    >
                      <Label>Description</Label>
                      <TextArea
                        value={field.state.value}
                        onChange={(evt) =>
                          field.handleChange(evt.currentTarget.value)
                        }
                        placeholder="Describe me..."
                        className="field-sizing-content max-h-16"
                      />
                      <Description>
                        (optional) - some extra information about this
                        environment
                      </Description>
                    </TextField>
                  )}
                </form.Field>

                <ErrorDisplay value={error.value} />

                <div className="flex justify-end">
                  <Button type="submit" isDisabled={!is_valid}>
                    <IconFingerprint className="size-5" /> Create Environment
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
