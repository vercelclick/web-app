import {
  ProgressBar,
  type ProgressBarProps,
  ProgressCircle,
  type ProgressCircleProps,
} from "@heroui/react";
import type { TablerIcon } from "@tabler/icons-react";

export function LoadingCircle(props: ProgressCircleProps) {
  return (
    <ProgressCircle {...props}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}

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
      {loading && <LoadingCircle className={className} />}
    </>
  );
}
