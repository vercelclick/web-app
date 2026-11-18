import { Card, Typography } from "@heroui/react";
import {
  IconArrowUpRight,
  IconFingerprint,
  IconShieldLock,
} from "@tabler/icons-react";
import { useState } from "react";
import { SignInForm } from "./SignIn";
import { SignupForm } from "./signup";

export enum ActiveView {
  SignIn = "sign-in",
  Signup = "signup",
}

export function AuthDashboard() {
  const [signup_email, setSignupEmail] = useState<string | null>(null);

  return (
    <main className="content relative isolate flex flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="w-full max-w-5xl">
        <a
          href="https://vercel.click"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Back to Vercel Click
        </a>
        <Card className="w-full overflow-hidden rounded-3xl border border-border/70 bg-surface/85 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-400/5 to-cyan-500/10 p-7 sm:p-10 md:border-r md:border-border/70">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-16 size-64 rounded-full border border-emerald-500/10"
              />
              <div>
                <div className="mb-8 flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <IconFingerprint className="size-8" stroke={1.6} />
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                  Your keys. Your secrets.
                </p>
                <h1 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Pick up where your trust begins.
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-6 text-muted sm:text-base">
                  Your passkey unlocks the vault. Your secrets stay encrypted on
                  your device, always beyond our reach.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/50 p-4">
                <IconShieldLock className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs leading-5 text-muted">
                  Zero-knowledge by design{" "}
                  <span className="text-foreground">·</span> Locked behind your
                  fingerprint
                </p>
              </div>
            </section>

            <div className="px-6 py-7 sm:px-10 sm:py-9">
              <Card.Header>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px] shadow-emerald-500/60" />
                  Welcome to your vault
                </div>
                <Card.Title className="mb-4 text-2xl font-semibold tracking-tight">
                  {signup_email === null && "Sign in or create account"}
                  {signup_email !== null && "Create account"}
                </Card.Title>
              </Card.Header>

              <Card.Content className="mt-6">
                {signup_email === null && (
                  <SignInForm onUserNotFound={setSignupEmail} />
                )}
                {signup_email !== null && (
                  <SignupForm
                    email_address={signup_email}
                    onReset={() => setSignupEmail(null)}
                  />
                )}
              </Card.Content>
              {signup_email === null && (
                <Card.Footer className="mt-4">
                  <div className="max-w-3xl rounded-xl px-4 py-4 gap-2 bg-background text-sm shadow-none">
                    <Typography type="h6" className="mb-2">
                      A helpful note about email sign-in
                    </Typography>
                    <ul className="list-outside list-disc ml-4 text-sm text-muted">
                      <li>
                        Email gets you into your account. Your passkey unlocks
                        your secrets.
                      </li>
                      <li>
                        On a new device? Sign in with email, then create a
                        passkey for it.
                      </li>
                      <li>
                        Ask a project admin to grant your new passkey access to
                        each project you need.
                      </li>
                    </ul>
                  </div>
                </Card.Footer>
              )}
              <p className="mt-6 text-center text-xs text-muted">
                New to Click?{" "}
                <a
                  href="https://vercel.click"
                  className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  See what makes your vault yours
                  <IconArrowUpRight className="size-3.5" />
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
