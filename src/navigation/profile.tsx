import {
  Description,
  Dropdown,
  Header,
  IconChevronDown,
  Label,
  Separator,
} from "@heroui/react";
import { IconLogout2, IconUserCircle } from "@tabler/icons-react";
import { type MouseEventHandler, useCallback } from "react";
import { useLogoutMutation } from "@/auth/query";
import { DropdownItem, useError } from "@/components";
import type { User } from "@/core";
import { COMMUNITY_LINKS, RESOURCES_LINKS } from "./links";

export function UserProfileButton({ user }: { user: User }) {
  const error = useError();
  const logout = useLogoutMutation();
  const logoutCallback: MouseEventHandler = useCallback(() => {
    error
      .catch("Error while attempting to logout", () => logout.mutateAsync(), {
        capture: "logout",
        toast: true,
      })
      .catch();
  }, [error.catch, logout.mutateAsync]);

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="button button--md button--ghost h-auto group">
          <IconUserCircle className="size-8 group-hover:text-accent" />
          <div className="hidden md:flex grow flex-col text-left">
            <Label className="group-hover:text-accent">{user.name}</Label>
            <Description>{user.email}</Description>
          </div>
          <IconChevronDown />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Section>
            <Header>Community</Header>
            {COMMUNITY_LINKS.map((item) => (
              <DropdownItem key={item.href} {...item} />
            ))}
          </Dropdown.Section>
          <Dropdown.Section>
            <Header>Resources</Header>
            {RESOURCES_LINKS.map((item) => (
              <DropdownItem key={item.href} {...item} />
            ))}
          </Dropdown.Section>
          <Separator />
          <DropdownItem
            variant="danger"
            capture="logout"
            label="Logout"
            Icon={IconLogout2}
            onClick={logoutCallback}
          />
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
