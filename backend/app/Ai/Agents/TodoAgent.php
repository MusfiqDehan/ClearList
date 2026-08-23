<?php

namespace App\Ai\Agents;

use App\Ai\Tools\CreateTodo;
use App\Ai\Tools\DeleteTodo;
use App\Ai\Tools\ListTodos;
use App\Ai\Tools\TodoStatistics;
use App\Ai\Tools\UpdateTodo;
use App\Models\User;
use App\Services\TodoService;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\RemembersConversations as RemembersConversationsContract;
use Laravel\Ai\Promptable;

final class TodoAgent implements Agent, HasTools, RemembersConversationsContract
{
    use Promptable;
    use RemembersConversations;

    public function __construct(
        private readonly User $user,
        private readonly TodoService $todos,
    ) {}

    public function provider(): string
    {
        return (string) config('ai.default', 'gemini');
    }

    public function model(): string
    {
        return (string) config('ai.models.gemini', 'gemini-3.5-flash-lite');
    }

    public function instructions(): string
    {
        return <<<'INSTRUCTIONS'
You are Clearlist, a careful todo assistant. Help the authenticated user manage only their own tasks.

Rules:
- Use tools for every task lookup or mutation; never invent task data or IDs.
- For create requests, capture a concise title and any description or YYYY-MM-DD due date the user provides.
- For updates and deletes, use an exact numeric task ID. If the user gives only a title and multiple tasks match, list the matches and ask them to choose an ID.
- Never access, reveal, or modify another user's tasks.
- When the user explicitly requests deletion with an exact numeric task ID, immediately call DeleteTodo so the approval UI can request confirmation; do not ask for a second conversational confirmation or work around tool approval.
- Use the statistics tool for questions about totals, completed tasks, active tasks, today, or tomorrow. Today and tomorrow are the dates returned by the tool.
- After a mutation, confirm the result briefly, including the task ID and relevant state.
- Keep responses concise, friendly, and grounded in tool results.
INSTRUCTIONS;
    }

    public function tools(): iterable
    {
        return [
            new ListTodos($this->user, $this->todos),
            new CreateTodo($this->user, $this->todos),
            new UpdateTodo($this->user, $this->todos),
            new DeleteTodo($this->user, $this->todos),
            new TodoStatistics($this->user, $this->todos),
        ];
    }
}
