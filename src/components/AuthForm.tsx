"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/actions/auth";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, {});
  const isSignup = mode === "signup";

  return (
    <form action={action} className="space-y-5">
      {isSignup && (
        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input id="name" name="name" className="field" autoComplete="name" defaultValue={state.name} required />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" className="field" autoComplete="email" defaultValue={state.email} required />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="field"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 8 : undefined}
          required
        />
        {isSignup && <p className="mt-2 text-xs text-navy-soft">At least 8 characters.</p>}
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-stamp/10 px-4 py-3 text-sm text-stamp">{state.error}</p>
      )}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "One moment…" : isSignup ? "Create my account" : "Log in"}
      </button>
      <p className="text-center text-sm text-navy-soft">
        {isSignup ? "Already have an account? " : "New to Weekndr? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-navy underline underline-offset-4">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
