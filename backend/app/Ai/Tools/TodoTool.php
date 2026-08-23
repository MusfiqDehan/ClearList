<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Services\TodoService;
use DateTimeInterface;
use Laravel\Ai\Contracts\Tool;
use Stringable;

abstract class TodoTool implements Tool
{
    public function __construct(
        protected readonly User $user,
        protected readonly TodoService $todos,
    ) {}

    protected function todoPayload(object $todo): array
    {
        return [
            'id' => $todo->id,
            'title' => $todo->title,
            'description' => $todo->description,
            'completed' => (bool) $todo->completed,
            'due_date' => $todo->due_date instanceof DateTimeInterface
                ? $todo->due_date->toDateString()
                : $todo->due_date,
        ];
    }

    protected function json(mixed $value): Stringable|string
    {
        return json_encode($value, JSON_THROW_ON_ERROR);
    }
}
