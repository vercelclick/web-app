import {
  Button,
  Description,
  IconPlus,
  Input,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  IconFingerprint,
  IconKeyFilled,
  IconShieldFilled,
  type TablerIcon,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useCallback, useState } from "react";
import { useDecryptionParams } from "@/auth/useAuthorization";
import { Alert, ErrorDisplay, Select, useError } from "@/components";
import { SimpleMono } from "@/components/command";
import { ENVIRONMENT_ALL_ACCESS } from "@/constants";
import {
  type ContributorPublicKey,
  type CreateAccessKeyRequest,
  type GetEnvironmentResult,
  generate_access_key,
  type PasskeyAuthorizationResult,
  type SecretValue,
} from "@/core";
import { resolveApiRequest } from "@/utils";
import { useProjectQuery } from "../queries";

export interface CreateMachineKeyProps {
  project_id: string;
}

export function CreateAccessKeyDialog({ project_id }: CreateMachineKeyProps) {
  const error = useError();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [is_federated, setIsFederated] = useState(true);
  const [generated_key, setGeneratedKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environments, setEnvironments] = useState<string[]>([]);
  const project_query = useProjectQuery(project_id);
  const get_params = useDecryptionParams(error);

  const reset = useCallback(() => {
    error.reset();
    setIsFederated(true);
    setGeneratedKey(null);
    setName("");
    setDescription("");
    setEnvironments([]);
  }, [error.reset]);

  const generateStandardKey = useCallback(async () => {
    if (!project_query.isSuccess) {
      return;
    }

    const params_op = await get_params(
      project_query.data.path,
      "key generation",
    );
    if (!params_op.ok) {
      return;
    }

    const env_ops = await error.catch(
      "Error fetching environment details",
      () =>
        Promise.all(
          environments.map((env_name) =>
            resolveApiRequest<GetEnvironmentResult>(
              `/api/projects/${project_id}/env/${env_name}`,
            ),
          ),
        ),
    );
    if (!env_ops.ok) {
      return;
    }

    const encrypted_secrets: [ContributorPublicKey, SecretValue][] = [];
    for (const env_result of env_ops.result) {
      for (const secret of env_result.secrets) {
        const secret_values = secret.contributor_values.filter(
          ([_, value]) => value.tag === "latest",
        );
        encrypted_secrets.push(
          ...(secret_values as [ContributorPublicKey, SecretValue][]),
        );
      }
    }

    const generate_op = await error.catch("Error generating private key", () =>
      generate_access_key({
        encrypted_secrets,
        project_id: project_query.data.project.id,
        auth_request: params_op.result,
      }),
    );

    if (!generate_op.ok) {
      return;
    }

    const save_op = await error.catch("Error saving private key", () =>
      resolveApiRequest(`/api/projects/${project_id}/access-keys`, {
        method: "POST",
        body: JSON.stringify({
          id: generate_op.result.public_key.target,
          auth_result: generate_op.result
            .auth_result as PasskeyAuthorizationResult,
          description,
          name,
          access: environments.map((env_name) => ({
            level: "ReadOnly",
            name: env_name,
            secrets: [ENVIRONMENT_ALL_ACCESS],
          })),
          encrypted_values: generate_op.result.encrypted_values,
          public_key: generate_op.result.public_key.value,
        } satisfies CreateAccessKeyRequest),
      }),
    );

    if (!save_op.ok) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["project", project_id] });

    setGeneratedKey(generate_op.result.private_key);
  }, [
    get_params,
    project_query,
    environments,
    error.catch,
    project_id,
    description,
    name,
    queryClient.invalidateQueries,
  ]);

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        reset();
      }}
    >
      <Button variant="ghost" size="sm">
        <IconPlus className="text-accent" />
        Grant access
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-row items-center">
              <Modal.Icon>
                {is_federated && (
                  <IconShieldFilled className="size-5 text-accent" />
                )}
                {!is_federated && (
                  <IconKeyFilled className="size-5 text-accent" />
                )}
              </Modal.Icon>
              <Modal.Heading>Generate access key</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <form
                className="flex flex-col gap-6 my-6"
                onSubmit={(evt) => {
                  evt.preventDefault();
                  if (is_federated) {
                  } else {
                    generateStandardKey();
                  }
                }}
              >
                <RadioGroup
                  name="key-type"
                  value={is_federated ? "federated" : "standard"}
                  onChange={(value) => setIsFederated(value === "federated")}
                  className="mb-5"
                >
                  <Label>Access Key Type</Label>
                  {KEY_ITEMS.map((item) => (
                    <Radio key={item.value} value={item.value}>
                      <Radio.Content
                        className={clsx(
                          "group relative flex flex-col px-4 py-4 rounded-2xl text-justify items-start bg-background",
                          "data-[selected=true]:bg-background-secondary data-[selected=true]:text-accent",
                        )}
                      >
                        <Radio.Control className="absolute top-3 right-4">
                          <Radio.Indicator />
                        </Radio.Control>
                        <Label className="text-inherit flex items-center gap-2">
                          <item.Icon className="size-4" />
                          {item.label}
                        </Label>

                        <Description>{item.description}</Description>
                      </Radio.Content>
                    </Radio>
                  ))}
                </RadioGroup>

                <TextField
                  isRequired
                  variant="secondary"
                  isDisabled={generated_key !== null}
                >
                  <Label>Key Name</Label>
                  <Input
                    value={name}
                    onChange={(evt) => setName(evt.currentTarget.value)}
                    placeholder="Key name..."
                  />
                  <Description>
                    Provide a name that can help easily identify this key and
                    it's purpose
                  </Description>
                </TextField>

                <TextField
                  variant="secondary"
                  isDisabled={generated_key !== null}
                >
                  <Label>Description</Label>
                  <TextArea
                    value={description}
                    onChange={(evt) => setDescription(evt.currentTarget.value)}
                    placeholder="Describe me..."
                    className="field-sizing-content max-h-16"
                  />
                  <Description>
                    (optional) - additional details about this key
                  </Description>
                </TextField>
                {project_query.isSuccess && (
                  <Select<string[]>
                    disabled={generated_key !== null}
                    multiselect
                    label="Environments"
                    items={project_query.data.environments.map((env) => ({
                      label: env.name,
                      value: env.name,
                    }))}
                    value={environments}
                    onChange={setEnvironments}
                    description="Select at least one environment that this private key can access"
                    variant="secondary"
                    placeholder="Select environments..."
                  />
                )}
                <ErrorDisplay value={error.value} />

                {generated_key !== null && (
                  <Alert
                    title="Congratulations!"
                    status="success"
                    className="shadow-none bg-background"
                  >
                    <div className="flex flex-col gap-4">
                      <p>
                        Copy the private key below, this key cannot be displayed
                        again once this dialog is closed.
                      </p>
                      <SimpleMono
                        className="wrap-break-word"
                        value={generated_key}
                      />
                      <p>
                        You can now run commands or export secrets with this
                        key.
                      </p>
                      <SimpleMono
                        className="wrap-break-word"
                        value={`spass run --[local/cloud] --private-key=${generated_key} --env=${environments[0]} -- your command here`}
                      />
                      <SimpleMono
                        className="wrap-break-word"
                        value={`spass export --[local/cloud] --private-key=${generated_key} --env=${environments[0]}{" "} --format=[json/dot-env]`}
                      />
                    </div>
                  </Alert>
                )}
                {generated_key === null && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isDisabled={environments.length === 0 || !name}
                    >
                      <IconFingerprint className="size-5" /> Generate Key
                    </Button>
                  </div>
                )}
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

const KEY_ITEMS: {
  label: string;
  Icon: TablerIcon;
  value: string;
  description: string;
}[] = [
  {
    label: "Federated Access Key (recommended)",
    description:
      "These access keys generate short-live private keys on demand, the user remotely approves and shares encrypted values for this key, the key is discarded after use.",
    Icon: IconShieldFilled,
    value: "federated",
  },
  {
    label: "Standard Access Key",
    description:
      "These are long living private keys that can decrypt secrets without user approval, these keys are security sensitive and should be avoided whenever possible",
    Icon: IconKeyFilled,
    value: "standard",
  },
];
