import { IconCopyCheckFilled, IconCopyFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

interface CopyIconProps {
  value: string;
  className?: string;
}

export function CopyIcon({ value, className }: CopyIconProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(
    () => navigator.clipboard.writeText(value).then(() => setCopied(true)),
    [value],
  );

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), 2500);

    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <>
      {!copied && (
        <IconCopyFilled
          className={clsx(
            "size-5 text-muted hover:text-accent cursor-pointer",
            className,
          )}
          onClick={onCopy}
        />
      )}
      {copied && (
        <IconCopyCheckFilled className={clsx("text-green-600", className)} />
      )}
    </>
  );
}
