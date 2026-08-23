<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class TodoStatistics extends TodoTool
{
    public function description(): Stringable|string
    {
        return 'Get todo counts for the authenticated user, including total, completed, active, due today, and due tomorrow.';
    }

    public function handle(Request $request): Stringable|string
    {
        return $this->json($this->todos->statistics($this->user));
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
