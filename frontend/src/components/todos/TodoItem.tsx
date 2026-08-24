"use client";

import type { Todo } from "@/lib/types";

type TodoItemProps = {
  todo: Todo;
  isBusy: boolean;
  onToggle: (todo: Todo) => Promise<void>;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => Promise<void>;
};

export function TodoItem({ todo, isBusy, onToggle, onEdit, onDelete }: TodoItemProps) {
  return (
    <li className={`task-card ${todo.completed ? "task-card-complete" : ""}`}>
      <button
        type="button"
        aria-label={todo.completed ? `Mark ${todo.title} active` : `Complete ${todo.title}`}
        aria-pressed={todo.completed}
        disabled={isBusy}
        onClick={() => void onToggle(todo)}
        className={`task-check ${todo.completed ? "task-check-complete" : ""}`}
      >
        {todo.completed && "✓"}
      </button>
      <div className="task-card-content">
        <div className="task-card-title-row">
          <h3 className={`wrap-break-word font-medium ${todo.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
            {todo.title}
          </h3>
          <span className={`task-status ${todo.completed ? "task-status-complete" : "task-status-active"}`}>
            {todo.completed ? "Done" : "Open"}
          </span>
        </div>
        {todo.description && (
          <p className={`mt-1 wrap-break-word text-sm ${todo.completed ? "text-slate-400" : "text-slate-500"}`}>
            {todo.description}
          </p>
        )}
        {todo.due_date && (
          <p className={`task-due ${todo.completed ? "task-due-complete" : ""}`}>
            <span aria-hidden="true">◷</span>
            Due {new Date(`${todo.due_date}T00:00:00`).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
      <div className="task-card-actions">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onEdit(todo)}
          className="icon-button"
          aria-label={`Edit ${todo.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void onDelete(todo)}
          className="icon-button icon-button-danger"
          aria-label={`Delete ${todo.title}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
