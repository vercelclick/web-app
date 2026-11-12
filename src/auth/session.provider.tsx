import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { SESSION_LOCAL_STORAGE_KEY } from "@/constants";
import type { AuthSession } from "@/core";
import { getSession } from "@/utils";
import { AuthDashboard } from "./auth-dashboard";

const SessionContext = createContext<AuthSession>(JSON.parse("null"));

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useRawSession();

  return (
    <>
      {session !== null && (
        <SessionContext.Provider value={session}>
          {children}
        </SessionContext.Provider>
      )}
      {session === null && <AuthDashboard />}
    </>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function useRawSession() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getSession()?.session || null);

    const handler = (event: StorageEvent) => {
      if (event.key !== SESSION_LOCAL_STORAGE_KEY) {
        return;
      }

      setSession(getSession()?.session || null);
    };
    window.addEventListener("storage", handler);

    return () => window.removeEventListener("storage", handler);
  }, []);

  return session;
}
