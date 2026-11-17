import { Button, IconPlus, Modal, Typography } from "@heroui/react";
import { IconMessage, IconTrafficCone } from "@tabler/icons-react";

export function CreateUserDialog() {
  return (
    <Modal>
      <Button variant="ghost" size="sm">
        <IconPlus className="text-accent" /> Add User
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-row items-center">
              <Modal.Icon>
                <IconTrafficCone className="size-7 text-yellow-700" />
              </Modal.Icon>
              <Modal.Heading>Work in Progress</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <Typography type="body" className="text-yellow-700">
                The team is currently working on this feature, we apologize for
                any inconvenience.{" "}
                <span className="font-semibold">
                  If you'd like this feature to be expedited, please ping us in
                  the chat box <IconMessage className="size-4 inline" />,
                  there's always a human behind the chat.
                </span>
              </Typography>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
