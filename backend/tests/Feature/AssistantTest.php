<?php

namespace Tests\Feature;

use App\Ai\Agents\TodoAgent;
use App\Ai\Tools\DeleteTodo;
use App\Models\Todo;
use App\Models\User;
use App\Services\TodoService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Ai\Approvals\PendingApproval;
use Laravel\Ai\Responses\AgentResponse;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class AssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_todo_statistics_are_scoped_to_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        Todo::factory()->for($user)->create(['completed' => true, 'due_date' => $today]);
        Todo::factory()->for($user)->create(['completed' => false, 'due_date' => $tomorrow]);
        Todo::factory()->for($otherUser)->create(['completed' => true, 'due_date' => $today]);

        $statistics = app(TodoService::class)->statistics($user);

        $this->assertSame(2, $statistics['total']);
        $this->assertSame(1, $statistics['completed']);
        $this->assertSame(1, $statistics['active']);
        $this->assertSame(1, $statistics['due_today']);
        $this->assertSame(1, $statistics['due_tomorrow']);
    }

    public function test_delete_tool_requires_approval_and_cannot_find_another_users_task(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();
        $otherTodo = Todo::factory()->for($otherUser)->create();
        $tool = app(DeleteTodo::class, ['user' => $user]);

        $this->assertNotNull($tool->shouldRequestApproval(new Request(['id' => $todo->id])));
        $this->assertModelExists($todo);

        $this->expectException(ModelNotFoundException::class);
        app(TodoService::class)->findOwned($user, $otherTodo->id);
    }

    public function test_assistant_creates_a_persisted_user_scoped_conversation(): void
    {
        TodoAgent::fake(['Your task list is ready.'])->preventStrayPrompts();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/assistant', [
            'prompt' => 'Show my tasks',
        ]);

        $response->assertOk()
            ->assertJsonPath('text', 'Your task list is ready.')
            ->assertJsonStructure(['conversation_id', 'pending_approvals', 'should_refresh']);

        $this->assertDatabaseHas('agent_conversations', [
            'id' => $response->json('conversation_id'),
            'participant_id' => $user->id,
        ]);
    }

    public function test_assistant_reset_deletes_all_conversations_for_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $conversation = $user->conversations()->create([
            'id' => (string) Str::uuid(),
            'title' => 'Old conversation',
        ]);
        $anotherConversation = $user->conversations()->create([
            'id' => (string) Str::uuid(),
            'title' => 'Another old conversation',
        ]);
        $otherConversation = $otherUser->conversations()->create([
            'id' => (string) Str::uuid(),
            'title' => 'Other user conversation',
        ]);
        $message = $conversation->messages()->create([
            'id' => (string) Str::uuid(),
            'agent' => TodoAgent::class,
            'role' => 'user',
            'content' => 'Old message',
            'attachments' => '[]',
            'tool_calls' => '[]',
            'tool_results' => '[]',
            'usage' => '[]',
            'meta' => '[]',
        ]);
        $otherMessage = $otherConversation->messages()->create([
            'id' => (string) Str::uuid(),
            'agent' => TodoAgent::class,
            'role' => 'user',
            'content' => 'Other user message',
            'attachments' => '[]',
            'tool_calls' => '[]',
            'tool_results' => '[]',
            'usage' => '[]',
            'meta' => '[]',
        ]);

        $this->actingAs($user)
            ->deleteJson('/api/assistant/conversations')
            ->assertNoContent();

        $this->assertDatabaseMissing('agent_conversations', ['id' => $conversation->id]);
        $this->assertDatabaseMissing('agent_conversations', ['id' => $anotherConversation->id]);
        $this->assertDatabaseMissing('agent_conversation_messages', ['id' => $message->id]);
        $this->assertDatabaseHas('agent_conversations', ['id' => $otherConversation->id]);
        $this->assertDatabaseHas('agent_conversation_messages', ['id' => $otherMessage->id]);
    }

    public function test_assistant_rejects_a_conversation_owned_by_another_user(): void
    {
        TodoAgent::fake(['Conversation created.'])->preventStrayPrompts();
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $conversationId = $this->actingAs($owner)->postJson('/api/assistant', [
            'prompt' => 'Hello',
        ])->json('conversation_id');

        $this->actingAs($attacker)
            ->postJson('/api/assistant', [
                'prompt' => 'Read this conversation',
                'conversation_id' => $conversationId,
            ])
            ->assertNotFound();
    }

    public function test_assistant_returns_pending_delete_approval(): void
    {
        TodoAgent::fake([
            AgentResponse::fakeWithPendingApprovals([
                new PendingApproval('delete-approval', 'DeleteTodo', ['id' => 42], 'Deletion is permanent.'),
            ]),
        ])->preventStrayPrompts();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/assistant', [
            'prompt' => 'Delete task ID 42',
        ]);

        $response->assertOk()
            ->assertJsonPath('pending_approvals.0.id', 'delete-approval')
            ->assertJsonPath('pending_approvals.0.arguments.id', 42)
            ->assertJsonPath('should_refresh', false);
    }
}
