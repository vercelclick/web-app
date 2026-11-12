import { Dropdown, IconChevronDown } from "@heroui/react";
import { IconVault } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useRawSession } from "@/auth";
import { DropdownItem, type DropdownItemProps } from "@/components";
import { ThemeToggle } from "@/shared/theme/theme-toggle";
import { COMMUNITY_LINKS, RESOURCES_LINKS } from "./links";
import { UserProfileButton } from "./profile";

export function Navbar() {
  const session = useRawSession();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background backdrop-blur supports-backdrop-filter:bg-background/60">
      <header className="container mx-auto">
        <div className="flex grow h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 no-underline">
            <div className="bg-[url('/logo.svg')] dark:bg-[url('/logo-dark.svg')] size-8  bg-cover" />
            <span className="text-2xl font-bold dark:text-muted">Click</span>
            <span className="text-2xl font-bold text-accent">Vault</span>
            <IconVault className="size-7 text-accent" />
          </Link>

          {session === null && (
            <nav className="hidden md:flex items-center gap-3">
              <LinkDropDown items={COMMUNITY_LINKS} label="Community" />
              <LinkDropDown items={RESOURCES_LINKS} label="Resources" />

              <div className="flex items-center gap-4 border-l pl-4">
                <ThemeToggle />
              </div>
            </nav>
          )}

          {session !== null && (
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              <UserProfileButton user={session.user} />
            </div>
          )}
        </div>
      </header>
    </nav>
  );
}

function LinkDropDown({
  items,
  label,
}: {
  items: DropdownItemProps[];
  label: ReactNode;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="button button--md button--ghost w-full md:w-auto justify-start">
          {label}
          <IconChevronDown />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          {items.map((item) => (
            <DropdownItem key={item.href} {...item} />
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
