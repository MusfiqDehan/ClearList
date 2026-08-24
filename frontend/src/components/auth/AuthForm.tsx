"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { ClearlistLogo } from "@/components/brand/ClearlistLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import type { User } from "@/lib/types";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let authenticatedUser: User;
      if (isRegister) {
        authenticatedUser = await register(name, email, password, passwordConfirmation);
      } else {
        authenticatedUser = await login(email, password, remember);
      }
      router.push(authenticatedUser.is_admin ? "/admin" : "/app");
    } catch (submissionError) {
      if (axios.isAxiosError(submissionError) && submissionError.response?.status === 422) {
        const errors = submissionError.response.data?.errors as
          | Record<string, string[]>
          | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? submissionError.response.data?.message);
      } else {
        setError("We could not complete that request. Check the API and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <section className="auth-card w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8">
          <div className="auth-brand mb-5">
            <ClearlistLogo priority />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Clearlist
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRegister
              ? "Start turning open loops into a clear plan."
              : "Sign in to continue organizing your day."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="field"
                placeholder="Ada Lovelace"
                autoComplete="name"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              placeholder="At least 8 characters"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>
          {isRegister && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password
              </span>
              <input
                required
                minLength={8}
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className="field"
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </label>
          )}
          {!isRegister && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          <button disabled={isSubmitting} className="button-primary w-full" type="submit">
            {isSubmitting ? "Working..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "New to Clearlist?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            {isRegister ? "Sign in" : "Create one"}
          </Link>
        </p>
      </section>
    </main>
  );
}
