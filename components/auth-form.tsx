"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string } | never>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const initialState: { error?: string } = {};
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSignup = mode === "signup";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignup ? "Use your personal email to start matching." : "Continue to your UniVibe matches."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Input name="email" type="email" placeholder="you@example.com" required />
          <Input name="password" type="password" placeholder="Password" minLength={8} required />
          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button className="w-full" disabled={pending}>
            {pending ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "New to UniVibe?"}{" "}
          <Link className="font-semibold text-primary" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
