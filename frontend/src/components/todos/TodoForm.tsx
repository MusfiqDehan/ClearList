"use client";

import { useState } from "react";
import type { Todo, TodoInput } from "@/lib/types";

type TodoFormProps = {
  todo: Todo | null;
  isSaving: boolean;
  onSave: (input: TodoInput) => Promise<void>;
  onCancel: () => void;
};

export function TodoForm({ todo, isSaving, onSave, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  const [dueDate, setDueDate] = useState(todo?.due_date ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || null,
    });
    if (!todo) {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="todo-form-header">
        <h2 id="task-form-title" className="font-semibold text-slate-900">{todo ? "Edit task" : "Add a task"}</h2>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Cancel
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Task title</span>
          <input
            required
            maxLength={255}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="field"
            placeholder="What needs to get done?"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Details <span className="font-normal text-slate-400">(optional)</span></span>
          <textarea
            maxLength={5000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="field min-h-24 resize-y"
            placeholder="Add useful context..."
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Due date <span className="font-normal text-slate-400">(optional)</span></span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="field"
          />
        </label>
      </div>
      <button disabled={isSaving} type="submit" className="button-primary mt-4">
        {isSaving ? "Saving..." : todo ? "Save changes" : "Add task"}
      </button>
    </form>
  );
}
