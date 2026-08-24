"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClearlistLogo } from "@/components/brand/ClearlistLogo";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import type { ProfileInput, User } from "@/lib/types";

export function ProfilePage() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated" || !user) {
    return (
      <main className="dashboard-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading your account...</p>
      </main>
    );
  }

  return <ProfileEditor key={user.id} user={user} />;
}

function ProfileEditor({ user }: { user: User }) {
  const router = useRouter();
  const { updateProfile, logout } = useAuth();
  const [form, setForm] = useState<ProfileInput>({
    name: user.name,
    phone: user.phone ?? "",
    timezone: user.timezone ?? "",
    bio: user.bio ?? "",
    avatar_url: user.avatar_url ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ProfileInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateProfile(form);
      setMessage("Your profile has been updated.");
    } catch (saveError) {
      if (axios.isAxiosError(saveError) && saveError.response?.status === 422) {
        const errors = saveError.response.data?.errors as Record<string, string[]> | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "Please check your profile details.");
      } else {
        setError("We could not update your profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="dashboard-shell min-h-screen">
      <header className="dashboard-header border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="dashboard-brand">
            <ClearlistLogo priority />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Clearlist</p>
              <p className="mt-1 text-sm text-slate-500">Your account settings.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <button type="button" className="button-secondary" onClick={() => router.push(user.is_admin ? "/admin" : "/app")}>
              Back to workspace
            </button>
            <button type="button" className="button-secondary" onClick={() => void handleLogout()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="profile-intro mb-8">
          <p className="dashboard-eyebrow">Personal details</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Make your profile yours.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Keep your contact details and preferences up to date. Your sign-in email stays unchanged.
          </p>
        </div>

        <section className="profile-panel" aria-labelledby="profile-heading">
          <div className="profile-panel-heading">
            <div className="profile-avatar">
              {form.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatar_url} alt="" />
              ) : (
                form.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <h2 id="profile-heading" className="text-2xl font-semibold text-slate-950">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              <span>Full name</span>
              <input
                className="field"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
              />
            </label>
            <label>
              <span>Phone number</span>
              <input
                className="field"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                maxLength={30}
                autoComplete="tel"
                placeholder="+1 555 123 4567"
              />
            </label>
            <label>
              <span>Timezone</span>
              <input
                className="field"
                value={form.timezone}
                onChange={(event) => updateField("timezone", event.target.value)}
                placeholder="Asia/Dhaka"
                autoComplete="off"
              />
              <small>Use an IANA timezone such as Asia/Dhaka or America/New_York.</small>
            </label>
            <label>
              <span>Avatar image URL</span>
              <input
                className="field"
                type="url"
                value={form.avatar_url}
                onChange={(event) => updateField("avatar_url", event.target.value)}
                placeholder="https://example.com/your-photo.jpg"
              />
            </label>
            <label className="profile-form-wide">
              <span>Bio</span>
              <textarea
                className="field"
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="A little about you..."
              />
            </label>

            {message && <p className="profile-success" role="status">{message}</p>}
            {error && <p className="admin-alert profile-form-wide" role="alert">{error}</p>}
            <div className="profile-form-actions profile-form-wide">
              <button type="submit" className="button-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
