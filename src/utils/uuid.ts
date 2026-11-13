import { useMemo } from "react";

export function uuidTimestamp(id: string) {
  const hex = id.replace(/-/g, "").slice(0, 12);

  return parseInt(hex, 16);
}

export function useUuidTimestamp(id: string) {
  return useMemo(() => uuidTimestamp(id), [id]);
}
