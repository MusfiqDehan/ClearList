"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClearlistLogo } from "@/components/brand/ClearlistLogo";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { adminApi } from "@/lib/api";
import type {
  AdminDirectoryEntry,
  AdminInvitation,
  AdminMetrics,
  AdminUser,
  AdminUserStatus,
} from "@/lib/types";

const statusOptions: AdminUserStatus[] = ["all", "active", "inactive", "invited"];

function formatDate(date: string | null, timezone: string | null): string {
  if (!date) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: timezone ?? "Asia/Dhaka",
  }).format(new Date(date));
}

export function AdminDashboard() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminDirectoryEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<AdminUserStatus>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUser | null>(null);
  const [pendingDeleteInvitation, setPendingDeleteInvitation] = useState<AdminInvitation | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextMetrics, nextUsers] = await Promise.all([
        adminApi.metrics(),
        adminApi.users(statusFilter, search, page),
      ]);
      setMetrics(nextMetrics);
      setUsers(nextUsers.data);
      setLastPage(nextUsers.meta.last_page);
      setTotalUsers(nextUsers.meta.total);
    } catch (loadError) {
      if (axios.isAxiosError(loadError) && loadError.response?.status === 403) {
        router.replace("/app");
      } else {
        setError("We could not load the admin overview. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, router, search, statusFilter]);

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    } else if (status === "authenticated" && user && !user.is_admin) {
      router.replace("/app");
    } else if (status === "authenticated" && user?.is_admin) {
      void Promise.resolve().then(() => refresh());
    }
  }, [refresh, router, status, user]);

  async function handleStatusChange() {
    if (!pendingUser) return;

    const targetUser = pendingUser;
    setBusyUserId(targetUser.id);
    setError(null);

    try {
      await adminApi.updateStatus(targetUser.id, !targetUser.is_active);
      setPendingUser(null);
      await refresh();
    } catch (statusError) {
      if (axios.isAxiosError(statusError) && statusError.response?.status === 422) {
        const errors = statusError.response.data?.errors as
          | Record<string, string[]>
          | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "That status change is not allowed.");
      } else {
        setError("We could not update this account. Please try again.");
      }
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleDeleteUser() {
    if (!pendingDeleteUser) return;

    const targetUser = pendingDeleteUser;
    setBusyUserId(targetUser.id);
    setError(null);

    try {
      await adminApi.deleteUser(targetUser.id);
      setPendingDeleteUser(null);
      await refresh();
    } catch (deleteError) {
      if (axios.isAxiosError(deleteError) && deleteError.response?.status === 422) {
        const errors = deleteError.response.data?.errors as
          | Record<string, string[]>
          | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "That account cannot be deleted.");
      } else {
        setError("We could not delete this account. Please try again.");
      }
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsInviting(true);
    setError(null);
    setInviteMessage(null);

    try {
      await adminApi.invite(inviteEmail.trim());
      setInviteEmail("");
      setInviteMessage("Invitation sent successfully.");
    } catch (inviteError) {
      if (axios.isAxiosError(inviteError) && inviteError.response?.status === 422) {
        const errors = inviteError.response.data?.errors as Record<string, string[]> | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "Please enter a valid, available email address.");
      } else {
        setError("We could not send the invitation. Please try again.");
      }
    } finally {
      setIsInviting(false);
    }
  }

  async function handleResendInvitation(invitation: AdminInvitation) {
    setBusyUserId(invitation.id);
    setError(null);
    setInviteMessage(null);

    try {
      await adminApi.resendInvitation(invitation.id);
      setInviteMessage(`Invitation resent to ${invitation.email}.`);
      await refresh();
    } catch (resendError) {
      if (axios.isAxiosError(resendError) && resendError.response?.status === 422) {
        const errors = resendError.response.data?.errors as Record<string, string[]> | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "That invitation cannot be resent.");
      } else {
        setError("We could not resend this invitation. Please try again.");
      }
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleDeleteInvitation() {
    if (!pendingDeleteInvitation) return;

    const invitation = pendingDeleteInvitation;
    setBusyUserId(invitation.id);
    setError(null);

    try {
      await adminApi.deleteInvitation(invitation.id);
      setPendingDeleteInvitation(null);
      await refresh();
    } catch (deleteError) {
      if (axios.isAxiosError(deleteError) && deleteError.response?.status === 422) {
        const errors = deleteError.response.data?.errors as Record<string, string[]> | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "That invitation cannot be deleted.");
      } else {
        setError("We could not delete this invitation. Please try again.");
      }
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  if (status !== "authenticated" || !user?.is_admin) {
    return (
      <main className="dashboard-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading your admin workspace...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-shell min-h-screen">
      <header className="dashboard-header border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="dashboard-brand">
            <ClearlistLogo priority />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Clearlist</p>
              <p className="mt-1 text-sm text-slate-500">Admin control center.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <button type="button" onClick={() => router.push("/account")} className="button-secondary">
              Account
            </button>
            <button type="button" onClick={() => router.push("/app")} className="button-secondary">
              Workspace
            </button>
            <span className="hidden text-sm text-slate-500 lg:block">Hi, {user.name}</span>
            <button type="button" onClick={() => void handleLogout()} className="button-secondary">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="dashboard-intro mb-8">
          <div>
            <p className="dashboard-eyebrow">Admin overview</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              See the whole picture.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              Monitor account growth, task health, and access status from one calm workspace.
            </p>
          </div>
          <div className="dashboard-intro-note">
            <span className="dashboard-intro-dot" aria-hidden="true" />
            <div>
              <strong>Live overview</strong>
              <span>Counts reflect the current database.</span>
            </div>
          </div>
        </div>

        <section className="admin-invite-panel mb-8" aria-labelledby="invite-heading">
          <div>
            <p className="dashboard-eyebrow">Grow your team</p>
            <h2 id="invite-heading" className="mt-2 text-2xl font-semibold text-slate-950">
              Invite a new user
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Send a secure, one-time registration link that expires in 7 days.
            </p>
          </div>
          <form className="admin-invite-form" onSubmit={(event) => void handleInvite(event)}>
            <label htmlFor="invite-email" className="sr-only">Invite email address</label>
            <input
              id="invite-email"
              className="field"
              type="email"
              required
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="person@example.com"
            />
            <button type="submit" className="button-primary" disabled={isInviting}>
              {isInviting ? "Sending..." : "Send invite"}
            </button>
          </form>
          {inviteMessage && <p className="profile-success mt-4" role="status">{inviteMessage}</p>}
        </section>

        {error && (
          <div role="alert" className="admin-alert mb-6">
            <span>{error}</span>
            <button type="button" onClick={() => void refresh()} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <section aria-labelledby="metrics-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="dashboard-eyebrow">At a glance</p>
              <h2 id="metrics-heading" className="mt-2 text-2xl font-semibold text-slate-950">
                Platform metrics
              </h2>
            </div>
            <span className="text-sm text-slate-500">{totalUsers} users in directory</span>
          </div>
          <div className="admin-metrics-grid">
            <MetricCard label="Total users" value={metrics?.total_users} tone="indigo" />
            <MetricCard label="Active users" value={metrics?.active_users} tone="emerald" />
            <MetricCard label="Inactive users" value={metrics?.inactive_users} tone="amber" />
            <MetricCard label="Total tasks" value={metrics?.total_tasks} tone="violet" />
            <MetricCard label="Completed tasks" value={metrics?.completed_tasks} tone="emerald" />
            <MetricCard label="Pending tasks" value={metrics?.pending_tasks} tone="amber" />
          </div>
        </section>

        <section className="admin-panel mt-8" aria-labelledby="users-heading">
          <div className="admin-panel-header">
            <div>
              <p className="dashboard-eyebrow">Account directory</p>
              <h2 id="users-heading" className="mt-2 text-2xl font-semibold text-slate-950">
                Users and task health
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Review each account&apos;s task activity and access status.
              </p>
            </div>
            <form className="admin-search" onSubmit={submitSearch}>
              <label htmlFor="admin-user-search" className="sr-only">Search users</label>
              <input
                id="admin-user-search"
                className="field"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email..."
              />
              <button type="submit" className="button-secondary">Search</button>
            </form>
          </div>

          <div className="admin-filters" role="group" aria-label="Filter users">
            {statusOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={statusFilter === option}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(option);
                }}
                className={`filter-button ${statusFilter === option ? "filter-button-active" : ""}`}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="admin-empty-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="admin-empty-state">No users match the current filters.</div>
          ) : (
            <>
              <div className="admin-user-table-wrap">
                <table className="admin-user-table">
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Status</th>
                      <th scope="col">Tasks</th>
                      <th scope="col">Joined</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((directoryEntry) => directoryEntry.type === "invitation" ? (
                      <InvitationRow
                        key={`invitation-${directoryEntry.id}`}
                        invitation={directoryEntry}
                        isBusy={busyUserId === directoryEntry.id}
                        onResend={() => void handleResendInvitation(directoryEntry)}
                        onDelete={() => setPendingDeleteInvitation(directoryEntry)}
                      />
                    ) : (
                      <UserRow
                        key={`user-${directoryEntry.id}`}
                        user={directoryEntry}
                        isBusy={busyUserId === directoryEntry.id}
                        onToggle={() => setPendingUser(directoryEntry)}
                        onDelete={() => setPendingDeleteUser(directoryEntry)}
                        canDelete={directoryEntry.id !== user.id}
                        timezone={user.timezone}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-user-cards">
                {users.map((directoryEntry) => directoryEntry.type === "invitation" ? (
                  <InvitationCard
                    key={`invitation-${directoryEntry.id}`}
                    invitation={directoryEntry}
                    isBusy={busyUserId === directoryEntry.id}
                    onResend={() => void handleResendInvitation(directoryEntry)}
                    onDelete={() => setPendingDeleteInvitation(directoryEntry)}
                  />
                ) : (
                  <UserCard
                    key={`user-${directoryEntry.id}`}
                    user={directoryEntry}
                    isBusy={busyUserId === directoryEntry.id}
                    onToggle={() => setPendingUser(directoryEntry)}
                    onDelete={() => setPendingDeleteUser(directoryEntry)}
                    canDelete={directoryEntry.id !== user.id}
                    timezone={user.timezone}
                  />
                ))}
              </div>
            </>
          )}

          {lastPage > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="button-secondary"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {lastPage}</span>
              <button
                type="button"
                className="button-secondary"
                disabled={page === lastPage || isLoading}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      {pendingUser && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && busyUserId === null) {
              setPendingUser(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-status-dialog-title"
            className="dialog-card"
          >
            <div className="dialog-icon">!</div>
            <h2 id="user-status-dialog-title" className="mt-5 text-xl font-semibold text-slate-950">
              {pendingUser.is_active ? "Deactivate this user?" : "Activate this user?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {pendingUser.is_active
                ? `${pendingUser.name} will no longer be able to sign in or access Clearlist.`
                : `${pendingUser.name} will be able to sign in and use Clearlist again.`}
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="button-secondary"
                disabled={busyUserId !== null}
                onClick={() => setPendingUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={pendingUser.is_active ? "button-danger" : "button-primary"}
                disabled={busyUserId !== null}
                onClick={() => void handleStatusChange()}
              >
                {busyUserId !== null ? "Updating..." : pendingUser.is_active ? "Deactivate user" : "Activate user"}
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingDeleteUser && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && busyUserId === null) {
              setPendingDeleteUser(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-dialog-title"
            aria-describedby="delete-user-dialog-description"
            className="dialog-card"
          >
            <div className="dialog-icon">!</div>
            <h2 id="delete-user-dialog-title" className="mt-5 text-xl font-semibold text-slate-950">
              Permanently delete this user?
            </h2>
            <p id="delete-user-dialog-description" className="mt-2 text-sm leading-6 text-slate-500">
              &ldquo;{pendingDeleteUser.name}&rdquo; and all of their tasks will be permanently removed.
              This action cannot be undone.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="button-secondary"
                disabled={busyUserId !== null}
                onClick={() => setPendingDeleteUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-danger"
                disabled={busyUserId !== null}
                onClick={() => void handleDeleteUser()}
              >
                {busyUserId !== null ? "Deleting..." : "Delete user permanently"}
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingDeleteInvitation && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && busyUserId === null) {
              setPendingDeleteInvitation(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-invitation-dialog-title"
            aria-describedby="delete-invitation-dialog-description"
            className="dialog-card"
          >
            <div className="dialog-icon">!</div>
            <h2 id="delete-invitation-dialog-title" className="mt-5 text-xl font-semibold text-slate-950">
              Delete this invitation?
            </h2>
            <p id="delete-invitation-dialog-description" className="mt-2 text-sm leading-6 text-slate-500">
              The pending invitation for &ldquo;{pendingDeleteInvitation.email}&rdquo; will be permanently removed.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="button-secondary"
                disabled={busyUserId !== null}
                onClick={() => setPendingDeleteInvitation(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-danger"
                disabled={busyUserId !== null}
                onClick={() => void handleDeleteInvitation()}
              >
                {busyUserId !== null ? "Deleting..." : "Delete invitation"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone: "indigo" | "emerald" | "amber" | "violet";
}) {
  return (
    <div className="admin-metric-card">
      <span className={`admin-metric-icon admin-metric-icon-${tone}`} aria-hidden="true">
        {tone === "emerald" ? "✓" : tone === "amber" ? "◷" : tone === "violet" ? "◌" : "◎"}
      </span>
      <div>
        <span className="admin-metric-label">{label}</span>
        <strong className="admin-metric-value">{value ?? "—"}</strong>
      </div>
    </div>
  );
}

function UserRow({
  user,
  isBusy,
  onToggle,
  onDelete,
  canDelete,
  timezone,
}: {
  user: AdminUser;
  isBusy: boolean;
  onToggle: () => void;
  onDelete: () => void;
  canDelete: boolean;
  timezone: string | null;
}) {
  return (
    <tr>
      <td>
        <div className="admin-user-identity">
          <span className="admin-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
          <span>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </span>
        </div>
      </td>
      <td>
        <span className={`admin-status-badge ${user.is_active ? "admin-status-active" : "admin-status-inactive"}`}>
          {user.is_active ? "Active" : "Inactive"}
        </span>
        {user.is_admin && <span className="admin-role-badge">Admin</span>}
      </td>
      <td>
        <div className="admin-task-counts">
          <strong>{user.total_tasks}</strong>
          <small>{user.completed_tasks} done · {user.pending_tasks} pending</small>
        </div>
      </td>
      <td>{formatDate(user.created_at, timezone)}</td>
      <td className="admin-action-cell">
        <button
          type="button"
          className={user.is_active ? "button-danger-quiet" : "button-secondary"}
          disabled={isBusy}
          onClick={onToggle}
        >
          {isBusy ? "Updating..." : user.is_active ? "Deactivate" : "Activate"}
        </button>
        {canDelete && (
          <button
            type="button"
            className="button-danger-quiet"
            disabled={isBusy}
            onClick={onDelete}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function UserCard({
  user,
  isBusy,
  onToggle,
  onDelete,
  canDelete,
  timezone,
}: {
  user: AdminUser;
  isBusy: boolean;
  onToggle: () => void;
  onDelete: () => void;
  canDelete: boolean;
  timezone: string | null;
}) {
  return (
    <article className="admin-user-card">
      <div className="admin-user-card-header">
        <div className="admin-user-identity">
          <span className="admin-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
          <span>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </span>
        </div>
        <span className={`admin-status-badge ${user.is_active ? "admin-status-active" : "admin-status-inactive"}`}>
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="admin-user-card-meta">
        <span><small>Total</small><strong>{user.total_tasks}</strong></span>
        <span><small>Completed</small><strong>{user.completed_tasks}</strong></span>
        <span><small>Pending</small><strong>{user.pending_tasks}</strong></span>
      </div>
      <div className="admin-user-card-footer">
        <span>{user.is_admin ? "Administrator" : "Member"} · Joined {formatDate(user.created_at, timezone)}</span>
        <div className="admin-user-actions">
          <button
            type="button"
            className={user.is_active ? "button-danger-quiet" : "button-secondary"}
            disabled={isBusy}
            onClick={onToggle}
          >
            {isBusy ? "Updating..." : user.is_active ? "Deactivate" : "Activate"}
          </button>
          {canDelete && (
            <button
              type="button"
              className="button-danger-quiet"
              disabled={isBusy}
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function InvitationRow({
  invitation,
  isBusy,
  onResend,
  onDelete,
}: {
  invitation: AdminInvitation;
  isBusy: boolean;
  onResend: () => void;
  onDelete: () => void;
}) {
  return (
    <tr>
      <td>
        <div className="admin-user-identity">
          <span className="admin-avatar admin-invitation-avatar" aria-hidden="true">✉</span>
          <span>
            <strong>Pending invitation</strong>
            <small>{invitation.email}</small>
          </span>
        </div>
      </td>
      <td><span className="admin-status-badge admin-status-invited">Invited</span></td>
      <td>
        <div className="admin-task-counts">
          <strong>—</strong>
          <small>Awaiting signup</small>
        </div>
      </td>
      <td>
        <div className="admin-task-counts">
          <strong>{formatDate(invitation.created_at, "Asia/Dhaka")}</strong>
          <small>Expires {formatDate(invitation.expires_at, "Asia/Dhaka")}</small>
        </div>
      </td>
      <td className="admin-action-cell">
        <button type="button" className="button-secondary" disabled={isBusy} onClick={onResend}>
          {isBusy ? "Sending..." : "Reinvite"}
        </button>
        <button type="button" className="button-danger-quiet" disabled={isBusy} onClick={onDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
}

function InvitationCard({
  invitation,
  isBusy,
  onResend,
  onDelete,
}: {
  invitation: AdminInvitation;
  isBusy: boolean;
  onResend: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="admin-user-card">
      <div className="admin-user-card-header">
        <div className="admin-user-identity">
          <span className="admin-avatar admin-invitation-avatar" aria-hidden="true">✉</span>
          <span>
            <strong>Pending invitation</strong>
            <small>{invitation.email}</small>
          </span>
        </div>
        <span className="admin-status-badge admin-status-invited">Invited</span>
      </div>
      <div className="admin-invitation-details">
        <span>Sent {formatDate(invitation.created_at, "Asia/Dhaka")}</span>
        <span>Expires {formatDate(invitation.expires_at, "Asia/Dhaka")}</span>
      </div>
      <div className="admin-user-actions admin-invitation-actions">
        <button type="button" className="button-secondary" disabled={isBusy} onClick={onResend}>
          {isBusy ? "Sending..." : "Reinvite"}
        </button>
        <button type="button" className="button-danger-quiet" disabled={isBusy} onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}
