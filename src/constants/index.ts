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

export const SESSION_LOCAL_STORAGE_KEY = "click-session";

const LOCAL_SERVICE_PORT = import.meta.env.VITE_LOCAL_SERVICE_PORT ?? "20207";
export const LOCAL_API_ORIGIN =
  import.meta.env.VITE_LOCAL_API_ORIGIN ?? "click-dev.localhost";

export const LOCAL_API_BASE_URL = `https://${LOCAL_API_ORIGIN}:${LOCAL_SERVICE_PORT}`;
export const CLOUD_API_BASE_URL =
  import.meta.env.VITE_CLOUD_API_BASE_URL ?? "http://localhost:8080";

export const CONNECTION_REFUSED_ERR = "CONNECTION_REFUSED";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.2.1";

export const ENVIRONMENT_ALL_ACCESS = "$ALL$";
