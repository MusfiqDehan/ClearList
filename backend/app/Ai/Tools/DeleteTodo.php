<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Approvals\Approval;
use Laravel\Ai\Concerns\InteractsWithApprovals;
use Laravel\Ai\Contracts\Approvable;
use Laravel\Ai\Tools\Request;
use Stringable;

class DeleteTodo extends TodoTool implements Approvable
{
    use InteractsWithApprovals;

    protected function needsApproval(Request $request): Approval
    {
        return Approval::required('Deleting a task is permanent and requires your confirmation.');
    }

    public function description(): Stringable|string
    {
        return 'Permanently delete an existing todo task. This always requires explicit user approval.';
    }

    public function handle(Request $request): Stringable|string
    {
        $todo = $this->todos->findOwned($this->user, (int) $request['id']);
        $deleted = $this->todoPayload($todo);
        $this->todos->delete($this->user, $todo);

        return $this->json([
            'message' => 'Task deleted.',
            'task' => $deleted,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('The exact numeric task ID to permanently delete.')->required(),
        ];
    }
}
