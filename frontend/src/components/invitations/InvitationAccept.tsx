"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClearlistLogo } from "@/components/brand/ClearlistLogo";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { invitationsApi } from "@/lib/api";

export function InvitationAccept({ token }: { token: string }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const invitation = await invitationsApi.preview(token);
        setEmail(invitation.email);
      } catch {
        setError("This invitation is invalid, expired, or has already been used.");
      } finally {
        setIsLoading(false);
      }
    });
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await invitationsApi.accept(token, name, password, passwordConfirmation);
      router.replace("/app");
    } catch (submissionError) {
      if (axios.isAxiosError(submissionError) && submissionError.response?.status === 422) {
        const errors = submissionError.response.data?.errors as Record<string, string[]> | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "Please check your account details.");
      } else if (axios.isAxiosError(submissionError) && submissionError.response?.status === 410) {
        setError("This invitation is invalid, expired, or has already been used.");
      } else {
        setError("We could not accept this invitation. Please try again.");
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
        <div className="auth-brand mb-5">
          <ClearlistLogo priority />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Clearlist</p>
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-500">Checking your invitation...</p>
        ) : email ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Join Clearlist</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create your account for <strong className="text-slate-700">{email}</strong>.
            </p>
            <form className="mt-7 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                <input
                  className="field"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <input
                  className="field"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
                <input
                  className="field"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}
              <button type="submit" className="button-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Accept invitation"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Invitation unavailable</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500" role="alert">{error}</p>
          </>
        )}
      </section>
    </main>
  );
}
