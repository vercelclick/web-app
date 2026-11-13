import { ProgressBar, type ProgressBarProps } from "@heroui/react";
import { IconRefresh, type TablerIcon } from "@tabler/icons-react";
import clsx from "clsx";

export function LoadingBar(props: ProgressBarProps) {
  return (
    <ProgressBar {...props}>
      <ProgressBar.Output />
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}

export function LoadingIcon({
  loading,
  Icon,
  className,
}: {
  Icon: TablerIcon;
  loading: boolean;
  className?: string;
}) {
  return (
    <>
      {!loading && <Icon className={className} />}
      {loading && <IconRefresh className={clsx("animate-spin", className)} />}
    </>
  );
}
