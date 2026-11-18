import {
  IconBook2,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandSlack,
  IconBrandX,
} from "@tabler/icons-react";
import type { DropdownItemProps } from "@/components";

export const COMMUNITY_LINKS: DropdownItemProps[] = [
  {
    label: "Slack",
    Icon: IconBrandSlack,
    href: "https://vercel.click/l/s/slack",
    capture: "social-interest-slack",
    is_external: true,
  },
  {
    label: "Github",
    Icon: IconBrandGithub,
    href: "https://vercel.click/l/s/github",
    capture: "social-interest-github",
    is_external: true,
  },
  {
    label: "x.com",
    Icon: IconBrandX,
    href: "https://vercel.click/l/s/x",
    capture: "social-interest-x",
    is_external: true,
  },
  {
    label: "Discord",
    Icon: IconBrandDiscord,
    href: "https://vercel.click/l/s/discord",
    capture: "social-interest-discord",
    is_external: true,
  },
];

export const RESOURCES_LINKS: DropdownItemProps[] = [
  {
    label: "Docs",
    Icon: IconBook2,
    href: "https://vercel.click/docs",
    capture: "resource-interest-docs",
    is_external: true,
  },
];
