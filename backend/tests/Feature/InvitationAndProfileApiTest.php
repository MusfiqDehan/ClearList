<?php

namespace Tests\Feature;

use App\Mail\UserInvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class InvitationAndProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_send_an_invitation_and_the_recipient_can_accept_it(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create(['name' => 'Inviting Admin']);

        $this->actingAs($admin)
            ->postJson('/api/admin/invitations', ['email' => 'new.person@example.com'])
            ->assertCreated()
            ->assertJsonPath('message', 'Invitation sent successfully.');

        $invitation = Invitation::query()->firstOrFail();
        $rawToken = null;

        Mail::assertSent(UserInvitationMail::class, function (UserInvitationMail $mail) use (&$rawToken): bool {
            $rawToken = Str::afterLast($mail->registrationUrl, '/');

            return $mail->inviterName === 'Inviting Admin';
        });

        $this->getJson("/api/invitations/{$rawToken}")
            ->assertOk()
            ->assertJsonPath('email', 'new.person@example.com');

        $this->postJson("/api/invitations/{$rawToken}/accept", [
            'name' => 'New Person',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()
            ->assertJsonPath('user.email', 'new.person@example.com');

        $this->assertDatabaseHas('invitations', [
            'id' => $invitation->id,
        ]);
        $this->assertNotNull($invitation->fresh()->accepted_at);
        $this->assertDatabaseHas('users', [
            'email' => 'new.person@example.com',
            'is_admin' => false,
            'is_active' => true,
        ]);
    }

    public function test_an_admin_cannot_invite_an_existing_account(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        User::factory()->create(['email' => 'existing@example.com']);

        $this->actingAs($admin)
            ->postJson('/api/admin/invitations', ['email' => 'existing@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        Mail::assertNothingSent();
    }

    public function test_an_admin_can_list_resend_and_delete_a_pending_invitation(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/admin/invitations', ['email' => 'pending@example.com'])
            ->assertCreated();

        $invitation = Invitation::query()->firstOrFail();

        $this->actingAs($admin)
            ->getJson('/api/admin/users?status=invited')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'invitation')
            ->assertJsonPath('data.0.email', 'pending@example.com')
            ->assertJsonPath('meta.per_page', 10);

        $this->actingAs($admin)
            ->postJson("/api/admin/invitations/{$invitation->id}/resend")
            ->assertOk()
            ->assertJsonPath('message', 'Invitation resent successfully.');

        Mail::assertSent(UserInvitationMail::class, 2);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/invitations/{$invitation->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Invitation deleted.');

        $this->assertDatabaseMissing('invitations', ['id' => $invitation->id]);
    }

    public function test_an_authenticated_user_can_update_their_profile_except_email(): void
    {
        $user = User::factory()->create([
            'email' => 'profile@example.com',
        ]);

        $this->actingAs($user)
            ->patchJson('/api/profile', [
                'name' => 'Updated Profile',
                'phone' => '+880 1700 000000',
                'timezone' => 'Asia/Dhaka',
                'avatar_url' => 'https://example.com/avatar.jpg',
                'bio' => 'A short profile bio.',
                'email' => 'changed@example.com',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Profile')
            ->assertJsonPath('data.phone', '+880 1700 000000')
            ->assertJsonPath('data.timezone', 'Asia/Dhaka')
            ->assertJsonPath('data.avatar_url', 'https://example.com/avatar.jpg')
            ->assertJsonPath('data.bio', 'A short profile bio.')
            ->assertJsonPath('data.email', 'profile@example.com');
    }
}
