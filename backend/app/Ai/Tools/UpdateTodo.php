<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class UpdateTodo extends TodoTool
{
    public function description(): Stringable|string
    {
        return 'Update an existing todo task belonging to the authenticated user. Always use the exact numeric task ID.';
    }

    public function handle(Request $request): Stringable|string
    {
        $todo = $this->todos->findOwned($this->user, (int) $request['id']);
        $arguments = $request->all();
        $attributes = [];

        foreach (['title', 'description', 'completed', 'due_date'] as $field) {
            if (array_key_exists($field, $arguments)) {
                $attributes[$field] = is_string($arguments[$field])
                    ? trim($arguments[$field])
                    : $arguments[$field];
            }
        }

        $todo = $this->todos->update($this->user, $todo, $attributes);

        return $this->json([
            'message' => 'Task updated.',
            'task' => $this->todoPayload($todo),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('The exact numeric task ID.')->required(),
            'title' => $schema->string()->description('Optional replacement title.'),
            'description' => $schema->string()->description('Optional replacement details.')->nullable(),
            'completed' => $schema->boolean()->description('Optional completion state.'),
            'due_date' => $schema->string()->description('Optional YYYY-MM-DD due date.')->nullable(),
        ];
    }
}
