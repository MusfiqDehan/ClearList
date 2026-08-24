<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndTodoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register_and_fetch_their_profile(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'ada@example.com');

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.name', 'Ada Lovelace');
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        User::factory()->create([
            'email' => 'ada@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'ada@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_a_user_can_manage_and_filter_their_todos(): void
    {
        $user = User::factory()->create();
        $activeTodo = Todo::factory()->for($user)->create([
            'title' => 'Ship the feature',
            'completed' => false,
        ]);
        Todo::factory()->for($user)->create([
            'title' => 'Read the notes',
            'completed' => true,
        ]);

        $this->actingAs($user)
            ->getJson('/api/todos?status=active&search=Ship')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $activeTodo->id);

        $createResponse = $this->actingAs($user)->postJson('/api/todos', [
            'title' => 'Write tests',
            'description' => 'Cover the happy path.',
            'due_date' => '2026-09-01',
        ]);

        $createResponse->assertCreated()
            ->assertJsonPath('data.title', 'Write tests')
            ->assertJsonPath('data.completed', false);

        $this->patchJson("/api/todos/{$activeTodo->id}", ['completed' => true])
            ->assertOk()
            ->assertJsonPath('data.completed', true);

        $this->deleteJson("/api/todos/{$activeTodo->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('todos', ['id' => $activeTodo->id]);
    }

    public function test_a_user_cannot_access_another_users_todo(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $todo = Todo::factory()->for($owner)->create();

        $this->actingAs($otherUser)
            ->getJson("/api/todos/{$todo->id}")
            ->assertForbidden();
    }

    public function test_todos_require_authentication(): void
    {
        $this->getJson('/api/todos')->assertUnauthorized();
    }
}
