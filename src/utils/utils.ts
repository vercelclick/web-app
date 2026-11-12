import { useState } from "react";
import { create } from "zustand";

export type ComplexState<T extends object> = T & {
  readonly reset: () => void;
  readonly update: (value: Partial<T>) => void;
};

export function useComplexState<T extends object>(
  init: (setState: (update: Partial<T>) => void, getState: () => T) => T,
): ComplexState<T> {
  const [useZustandState] = useState(() =>
    create<ComplexState<T>>((setState, getState) => ({
      ...init(setState as (update: Partial<T>) => void, getState),
      update: (value: Partial<T>) =>
        setState(value as Partial<ComplexState<T>>),
      reset: () => {
        setState(init(setState as (update: Partial<T>) => void, getState));
      },
    })),
  );
  return useZustandState();
}

export function clone<T>(object: T, update?: (cloned: T) => T): T {
  const cloned: T = JSON.parse(JSON.stringify(object));

  if (update) {
    return update(cloned);
  }
  return cloned;
}
