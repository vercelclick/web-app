import { Accordion, IconChevronDown } from "@heroui/react";
import type { ReactNode } from "react";
import { SimpleMono } from "@/components/command";

interface HelpTopicItem {
  title: string;
  details: ReactNode;
}

const HELP_TOPICS: HelpTopicItem[] = [
  {
    title: "Connect a local project",
    details: (
      <div>
        From your project folder, run <SimpleMono value="click attach" /> to
        connect it to Click Vault. The vault can then manage its encrypted
        secrets alongside your project.
      </div>
    ),
  },
  {
    title: "Bring another project into your vault",
    details: (
      <div>
        From the folder you want to connect, run{" "}
        <SimpleMono value="click attach" />. It will appear in Pending Projects
        so you can finish setting it up.
      </div>
    ),
  },
  {
    title: "Finish setting up a project",
    details: (
      <div>
        Your folder is connected and ready for the last setup step. Select it
        under Pending Projects to create its Click Vault project and start
        managing secrets.
      </div>
    ),
  },
  {
    title: "Can't open one of your projects?",
    details: (
      <div>
        This project is connected to your local vault under a different Click
        account. Sign in to the account that has access to the project, and
        you'll be able to continue managing its secrets.
      </div>
    ),
  },
];

export function HelpTopicList() {
  return (
    <Accordion variant="surface" className="w-full max-w-lg mx-auto ">
      {HELP_TOPICS.map((topic) => (
        <Accordion.Item key={topic.title}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {topic.title}
              <Accordion.Indicator>
                <IconChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{topic.details}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
