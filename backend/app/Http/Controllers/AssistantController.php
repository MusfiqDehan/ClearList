<?php

namespace App\Http\Controllers;

use App\Ai\Agents\TodoAgent;
use App\Http\Requests\AssistantApprovalRequest;
use App\Http\Requests\AssistantPromptRequest;
use App\Models\User;
use App\Services\TodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Responses\AgentResponse;

class AssistantController extends Controller
{
    public function __construct(private readonly TodoService $todos) {}

    public function prompt(AssistantPromptRequest $request): JsonResponse
    {
        $user = $request->user();
        $conversationId = $request->validated('conversation_id');
        $agent = $this->agent($user);

        if ($conversationId !== null) {
            $this->conversation($user, $conversationId);
            $agent->continue($conversationId, $user);
        } else {
            $agent->forUser($user);
        }

        return $this->response($agent->prompt($request->validated('prompt')));
    }

    public function approve(AssistantApprovalRequest $request, string $conversation): JsonResponse
    {
        $user = $request->user();
        $this->conversation($user, $conversation);
        $agent = $this->agent($user)->continue($conversation, $user);

        return $this->response($agent->prompt(
            Decisions::from($request->validated('decisions'))
        ));
    }

    public function reset(Request $request): Response
    {
        $user = $request->user();
        $conversationRelation = $user->conversations();

        DB::connection($conversationRelation->getModel()->getConnectionName())->transaction(
            function () use ($conversationRelation): void {
                $conversationRelation->get()->each(function ($conversation): void {
                    $conversation->messages()->delete();
                    $conversation->delete();
                });
            }
        );

        return response()->noContent();
    }

    private function agent(User $user): TodoAgent
    {
        return TodoAgent::make($user, $this->todos);
    }

    private function conversation(User $user, string $id): void
    {
        abort_unless(
            $user->conversations()->whereKey($id)->exists(),
            404,
            'Conversation not found.',
        );
    }

    private function response(AgentResponse $response): JsonResponse
    {
        $mutationNames = ['create', 'update', 'delete'];
        $shouldRefresh = $response->toolResults->contains(
            fn ($result): bool => Str::contains(strtolower($result->name), $mutationNames)
        );

        return response()->json([
            'text' => $response->text,
            'conversation_id' => $response->conversationId,
            'should_refresh' => $shouldRefresh,
            'pending_approvals' => $response->pendingApprovals
                ->map(static fn ($approval): array => $approval->toArray())
                ->values()
                ->all(),
        ]);
    }
}
