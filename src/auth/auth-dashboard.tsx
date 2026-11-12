import { Card, Tabs } from "@heroui/react";
import { Activity, useState } from "react";
import { Alert } from "@/components/alert";
import { SignInForm } from "./SignIn";
import { SignupForm } from "./signup";

export enum ActiveView {
  SignIn = "sign-in",
  Signup = "signup",
}

export function AuthDashboard() {
  const [view, setView] = useState<ActiveView>(ActiveView.SignIn);

  return (
    <div className="content flex flex-col items-center gap-8">
      <div className="h-[10%]" />
      <Card className="w-full max-w-3xl px-8 py-6">
        <Card.Header>
          <Card.Title className="text-xl font-light mb-4">
            Sign in or Create account
          </Card.Title>
          <Tabs
            className="w-full"
            variant="secondary"
            selectedKey={view}
            onSelectionChange={(key) => setView(key as ActiveView)}
          >
            <Tabs.ListContainer>
              <Tabs.List>
                <Tabs.Tab id={ActiveView.SignIn}>
                  <Tabs.Indicator />
                  Sign in
                </Tabs.Tab>
                <Tabs.Tab id={ActiveView.Signup}>
                  <Tabs.Indicator />
                  Create Account
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </Card.Header>

        <Card.Content className="mt-6">
          <Activity mode={view === ActiveView.SignIn ? "visible" : "hidden"}>
            <SignInForm />
          </Activity>
          <Activity mode={view === ActiveView.Signup ? "visible" : "hidden"}>
            <SignupForm />
          </Activity>
        </Card.Content>
        {view === ActiveView.SignIn && (
          <Card.Footer className="mt-4">
            <Alert
              status="warning"
              title="Email sign in limitations"
              className="max-w-3xl bg-background shadow-none flex gap-2 text-sm"
            >
              <ul className="list-disc list-inside">
                <li>
                  If you sign in with your email, you'll still need your passkey
                  to view secrets.
                </li>
                <li>
                  If this is a new device, you can create a new passkey after
                  signing in.
                </li>
                <li>
                  The new passkey must be granted access on each project for it
                  to access secrets.
                </li>
              </ul>
            </Alert>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
