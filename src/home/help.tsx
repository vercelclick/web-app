import { Accordion, IconChevronDown } from "@heroui/react";
import type { ReactNode } from "react";
import { SimpleMono } from "@/components/command";

interface HelpTopicItem {
  title: string;
  details: ReactNode;
}

const HELP_TOPICS: HelpTopicItem[] = [
  {
    title: "Can't see your local project?",
    details: (
      <div>
        Please navigate to the project folder and run{" "}
        <SimpleMono value="click attach" />. This will give local click vault
        visibility into the project directory.
      </div>
    ),
  },
  {
    title: "Want to setup a new project?",
    details: (
      <div>
        Please navigate to the target folder and run{" "}
        <SimpleMono value="click attach" />. The project will appear under
        pending projects and you can proceed to complete the set up.
      </div>
    ),
  },
  {
    title: "Why is my project under pending projects?",
    details:
      "You attached the folder but the project setup is not completed, click on it under pending projects to complete setup.",
  },
  {
    title: "Why is my project under inaccessible projects?",
    details:
      "The project is attached to the local vault but you don't have access under the current user, sign in with the relevant user to access the project.",
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
