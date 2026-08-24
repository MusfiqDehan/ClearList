"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ClearlistLogo } from "@/components/brand/ClearlistLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { todosApi } from "@/lib/api";
import type { Todo, TodoInput, TodoStatus } from "@/lib/types";
import { TodoForm } from "@/components/todos/TodoForm";
import { TodoItem } from "@/components/todos/TodoItem";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

export function TodoDashboard() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [statusFilter, setStatusFilter] = useState<TodoStatus>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTodo, setDeleteTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const hasFilters = statusFilter !== "all" || search !== "";

  const refreshTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTodos(await todosApi.list(statusFilter, search));
    } catch {
      setError("We could not load your tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    } else if (status === "authenticated") {
      void Promise.resolve().then(() => refreshTodos());
    }
  }, [refreshTodos, router, status]);

  async function handleSave(input: TodoInput) {
    setIsSaving(true);
    setError(null);
    try {
      if (editingTodo) {
        await todosApi.update(editingTodo.id, input);
      } else {
        await todosApi.create(input);
      }
      setEditingTodo(null);
      setIsTaskFormOpen(false);
      await refreshTodos();
    } catch (saveError) {
      if (axios.isAxiosError(saveError) && saveError.response?.status === 422) {
        const errors = saveError.response.data?.errors as Record<string, string[]> | undefined;
        setError(Object.values(errors ?? {})[0]?.[0] ?? "Please check your input.");
      } else {
        setError("We could not save that task. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(todo: Todo) {
    setBusyId(todo.id);
    try {
      await todosApi.update(todo.id, { completed: !todo.completed });
      await refreshTodos();
    } catch {
      setError("We could not update that task.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(todo: Todo) {
    setDeleteTodo(todo);
  }

  function openAddForm() {
    setEditingTodo(null);
    setIsTaskFormOpen(true);
  }

  function openEditForm(todo: Todo) {
    setEditingTodo(todo);
    setIsTaskFormOpen(true);
  }

  function closeTaskForm() {
    if (isSaving) return;
    setEditingTodo(null);
    setIsTaskFormOpen(false);
  }

  async function confirmDelete() {
    if (!deleteTodo) return;
    const todo = deleteTodo;
    setBusyId(todo.id);
    try {
      await todosApi.remove(todo.id);
      if (editingTodo?.id === todo.id) setEditingTodo(null);
      setDeleteTodo(null);
      await refreshTodos();
    } catch {
      setError("We could not delete that task.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (status !== "authenticated" || !user) {
    return (
      <main className="dashboard-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading your clearlist...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-shell min-h-screen">
      <header className="dashboard-header border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="dashboard-brand">
            <ClearlistLogo priority />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Clearlist</p>
              <p className="mt-1 text-sm text-slate-500">A calmer way to get things done.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button type="button" onClick={() => router.push("/account")} className="button-secondary">
              Account
            </button>
            {user.is_admin && (
              <button type="button" onClick={() => router.push("/admin")} className="button-secondary">
                Admin
              </button>
            )}
            <ThemeToggle />
            <span className="hidden text-sm text-slate-500 sm:block">Hi, {user.name}</span>
            <button type="button" onClick={() => void handleLogout()} className="button-secondary">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="dashboard-intro mb-8">
          <div>
            <p className="dashboard-eyebrow">Your personal workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Make room for what matters.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              A focused space for the things you want to move forward today.
            </p>
          </div>
          <div className="dashboard-intro-note">
            <span className="dashboard-intro-dot" aria-hidden="true" />
            <div>
              <strong>Small steps count</strong>
              <span>Keep your next move visible.</span>
            </div>
          </div>
        </div>

        <AssistantPanel onMutated={refreshTodos} />

        <section className="task-workspace mt-10" aria-labelledby="tasks-heading">
          <div className="task-workspace-header">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="tasks-heading" className="text-xl font-semibold text-slate-900">Your tasks</h2>
                <span className="task-view-count">
                  {todos.length} {todos.length === 1 ? "task" : "tasks"} in view
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Prioritize the next meaningful thing.</p>
            </div>
            <button type="button" className="button-primary" onClick={openAddForm}>
              <span aria-hidden="true">＋</span> Add task
            </button>
          </div>

          <div className="task-metrics" aria-label="Task summary">
            <div className="task-metric">
              <span className="task-metric-icon task-metric-icon-indigo" aria-hidden="true">◌</span>
              <span><small>In view</small><strong>{todos.length}</strong></span>
            </div>
            <div className="task-metric">
              <span className="task-metric-icon task-metric-icon-amber" aria-hidden="true">◷</span>
              <span><small>Open</small><strong>{activeCount}</strong></span>
            </div>
            <div className="task-metric">
              <span className="task-metric-icon task-metric-icon-emerald" aria-hidden="true">✓</span>
              <span><small>Completed</small><strong>{completedCount}</strong></span>
            </div>
          </div>

          <div className="task-toolbar">
            <div className="task-filter-wrap">
              <span className="task-toolbar-label">Show</span>
              <div className="task-filters" role="group" aria-label="Filter tasks">
                {(["all", "active", "completed"] as TodoStatus[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={statusFilter === filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`filter-button ${statusFilter === filter ? "filter-button-active" : ""}`}
                  >
                    {filter[0].toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <form
              className="task-search"
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(searchInput.trim());
              }}
            >
              <label htmlFor="task-search" className="sr-only">Search tasks</label>
              <span className="task-search-icon" aria-hidden="true">⌕</span>
              <input
                id="task-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="field"
                placeholder="Search your tasks..."
              />
              <button type="submit" className="button-secondary">Search</button>
            </form>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span>{error}</span>
              <button type="button" onClick={() => void refreshTodos()} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Loading tasks...
            </div>
          ) : todos.length === 0 ? (
            <div className="task-empty-state">
              <div className="task-empty-icon" aria-hidden="true">{hasFilters ? "⌕" : "＋"}</div>
              <p className="text-lg font-medium text-slate-800">
                {hasFilters ? "No tasks match this view." : "Your list is ready for its first step."}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {hasFilters
                  ? "Try another search or clear the filters to see more tasks."
                  : "Add a task and make your next move clear."}
              </p>
              <button
                type="button"
                className="button-secondary mt-5"
                onClick={() => {
                  if (hasFilters) {
                    setStatusFilter("all");
                    setSearch("");
                    setSearchInput("");
                  } else {
                    openAddForm();
                  }
                }}
              >
                {hasFilters ? "Clear filters" : "Create your first task"}
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isBusy={busyId === todo.id}
                  onToggle={handleToggle}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {isTaskFormOpen && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTaskForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="dialog-card task-dialog"
          >
            <TodoForm
              key={editingTodo?.id ?? "new"}
              todo={editingTodo}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={closeTaskForm}
            />
          </section>
        </div>
      )}

      {deleteTodo && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && busyId === null) {
              setDeleteTodo(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="dialog-card"
          >
            <div className="dialog-icon">!</div>
            <h2 id="delete-dialog-title" className="mt-5 text-xl font-semibold text-slate-950">
              Delete this task?
            </h2>
            <p id="delete-dialog-description" className="mt-2 text-sm leading-6 text-slate-500">
              &ldquo;{deleteTodo.title}&rdquo; will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                autoFocus
                disabled={busyId !== null}
                onClick={() => setDeleteTodo(null)}
                className="button-secondary"
              >
                Keep task
              </button>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => void confirmDelete()}
                className="button-danger"
              >
                {busyId !== null ? "Deleting..." : "Delete task"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
