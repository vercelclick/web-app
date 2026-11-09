import * as z from "zod";

export enum UiTheme {
  Dark = "dark",
  Light = "light",
  System = "system",
}

export enum OperationMode {
  Local = "Local",
  Cloud = "Cloud",
}

export const CWD_HEADER = "x-current-working-directory";

export const SAFE_NAME_SCHEMA = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z_][a-zA-Z0-9_-]*$/, {
    message:
      "Invalid variable name (letters, numbers, underscores, cannot start with a number).",
  });

export const LOCAL_API_BASE_URL =
  import.meta.env.VITE_LOCAL_API_BASE_URL ?? "https://localhost:20206";
export const CLOUD_API_BASE_URL =
  import.meta.env.VITE_CLOUD_API_BASE_URL ?? "http://localhost:8080";

export const CONNECTION_REFUSED_ERR = "CONNECTION_REFUSED_ERROR";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.2.1";

export const ENVIRONMENT_ALL_ACCESS = "$ALL$";
