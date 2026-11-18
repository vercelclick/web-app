import { buttonVariants, Dropdown, IconChevronDown } from "@heroui/react";
import { IconExternalLink, IconVault } from "@tabler/icons-react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useRawSession } from "@/auth";
import { DropdownItem, type DropdownItemProps } from "@/components";
import { ThemeToggle } from "@/shared/theme/theme-toggle";
import { COMMUNITY_LINKS } from "./links";
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

          <nav className="flex items-center gap-1 md:gap-2 xl:gap-3">
            {session === null && (
              <LinkDropDown items={COMMUNITY_LINKS} label="Community" />
            )}

            <a
              className={clsx(
                buttonVariants.base,
                buttonVariants.variants.variant.ghost,
                "hidden md:flex",
              )}
              target="_blank"
              rel="noreferrer"
              href="https://vercel.click/docs"
            >
              Docs <IconExternalLink className="size-4" />
            </a>

            <div className="flex items-center gap-4 md:border-l pl-4">
              <ThemeToggle />

              {session !== null && <UserProfileButton user={session.user} />}
            </div>
          </nav>
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
