<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_view_platform_metrics_and_user_task_counts(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        Todo::factory()->for($member)->create(['completed' => true]);
        Todo::factory()->for($member)->create(['completed' => false]);

        $this->actingAs($admin)
            ->getJson('/api/admin/metrics')
            ->assertOk()
            ->assertJsonPath('data.total_users', 2)
            ->assertJsonPath('data.active_users', 2)
            ->assertJsonPath('data.total_tasks', 2)
            ->assertJsonPath('data.completed_tasks', 1)
            ->assertJsonPath('data.pending_tasks', 1);

        $this->actingAs($admin)
            ->getJson('/api/admin/users?search='.$member->email)
            ->assertOk()
            ->assertJsonPath('data.0.email', $member->email)
            ->assertJsonPath('data.0.total_tasks', 2)
            ->assertJsonPath('data.0.completed_tasks', 1)
            ->assertJsonPath('data.0.pending_tasks', 1);
    }

    public function test_regular_users_cannot_access_admin_endpoints(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)
            ->getJson('/api/admin/metrics')
            ->assertForbidden();
    }

    public function test_admin_user_directory_is_limited_to_ten_users_per_page(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(12)->create();

        $this->actingAs($admin)
            ->getJson('/api/admin/users?per_page=10')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 13);

        $this->actingAs($admin)
            ->getJson('/api/admin/users?per_page=11')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }

    public function test_an_admin_can_deactivate_and_reactivate_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$member->id}/status", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('user.is_active', false);

        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'is_active' => false,
        ]);

        $member->refresh();
        $this->actingAs($member)
            ->getJson('/api/user')
            ->assertUnauthorized();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$member->id}/status", ['is_active' => true])
            ->assertOk()
            ->assertJsonPath('user.is_active', true);
    }

    public function test_an_admin_can_permanently_delete_a_user_and_their_todos(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        $todo = Todo::factory()->for($member)->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$member->id}")
            ->assertOk()
            ->assertJsonPath('message', 'User account permanently deleted.');

        $this->assertDatabaseMissing('users', ['id' => $member->id]);
        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    }

    public function test_an_admin_cannot_permanently_delete_themselves(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$admin->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('user');
    }

    public function test_an_admin_cannot_deactivate_themselves(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}/status", ['is_active' => false])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('is_active');
    }

    public function test_the_last_active_admin_cannot_be_deactivated(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        $thirdAdmin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$otherAdmin->id}/status", ['is_active' => false])
            ->assertOk();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$thirdAdmin->id}/status", ['is_active' => false])
            ->assertOk();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}/status", ['is_active' => false])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('is_active');
    }

    public function test_inactive_users_cannot_log_in(): void
    {
        $member = User::factory()->deactivated()->create([
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => $member->email,
            'password' => 'password123',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }
}
