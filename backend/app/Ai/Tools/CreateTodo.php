<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class CreateTodo extends TodoTool
{
    public function description(): Stringable|string
    {
        return 'Create one todo task for the authenticated user.';
    }

    public function handle(Request $request): Stringable|string
    {
        $todo = $this->todos->create($this->user, [
            'title' => trim((string) $request['title']),
            'description' => isset($request['description']) ? trim((string) $request['description']) : null,
            'completed' => (bool) ($request['completed'] ?? false),
            'due_date' => $request['due_date'] ?? null,
        ]);

        return $this->json([
            'message' => 'Task created.',
            'task' => $this->todoPayload($todo),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The task title.')->required(),
            'description' => $schema->string()->description('Optional task details.')->nullable(),
            'completed' => $schema->boolean()->description('Whether the task starts completed.'),
            'due_date' => $schema->string()
                ->description('Optional due date in YYYY-MM-DD format.')
                ->nullable(),
        ];
    }
}
