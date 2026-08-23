<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class ListTodos extends TodoTool
{
    public function description(): Stringable|string
    {
        return 'List the authenticated user’s todo tasks, optionally filtered by status or a search phrase.';
    }

    public function handle(Request $request): Stringable|string
    {
        $status = (string) ($request['status'] ?? 'all');
        $search = trim((string) ($request['search'] ?? ''));
        $todos = $this->todos->paginate($this->user, $status, $search, 100);

        return $this->json([
            'tasks' => collect($todos->items())->map(fn ($todo) => $this->todoPayload($todo))->values()->all(),
            'count' => $todos->total(),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()
                ->description('Filter: all, active, or completed.')
                ->enum(['all', 'active', 'completed']),
            'search' => $schema->string()
                ->description('Optional text to find in task titles or descriptions.'),
        ];
    }
}
