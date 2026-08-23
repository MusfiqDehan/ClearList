<?php

namespace App\Services;

use App\Mail\UserInvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InvitationService
{
    public function invite(User $inviter, string $email): void
    {
        $email = strtolower(trim($email));

        if (User::query()->where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['This email already has a Clearlist account.'],
            ]);
        }

        Invitation::query()
            ->where('email', $email)
            ->whereNull('accepted_at')
            ->delete();

        $token = Str::random(64);
        Invitation::create([
            'invited_by' => $inviter->id,
            'email' => $email,
            'token' => hash('sha256', $token),
            'expires_at' => now()->addDays(7),
        ]);

        $registrationUrl = rtrim(config('app.frontend_url'), '/').'/invite/'.$token;

        Mail::to($email)->send(new UserInvitationMail(
            registrationUrl: $registrationUrl,
            inviterName: $inviter->name,
        ));
    }

    public function findValid(string $token): Invitation
    {
        $invitation = Invitation::query()
            ->where('token', hash('sha256', $token))
            ->first();

        abort_unless($invitation, 404, 'This invitation could not be found.');
        abort_if(! $invitation->isValid(), 410, 'This invitation has expired or has already been used.');

        return $invitation;
    }

    public function resend(User $inviter, Invitation $invitation): void
    {
        if ($invitation->accepted_at !== null) {
            throw ValidationException::withMessages([
                'invitation' => ['This invitation has already been accepted.'],
            ]);
        }

        $token = Str::random(64);
        $invitation->update([
            'invited_by' => $inviter->id,
            'token' => hash('sha256', $token),
            'expires_at' => now()->addDays(7),
        ]);

        $registrationUrl = rtrim(config('app.frontend_url'), '/').'/invite/'.$token;

        Mail::to($invitation->email)->send(new UserInvitationMail(
            registrationUrl: $registrationUrl,
            inviterName: $inviter->name,
        ));
    }

    public function delete(Invitation $invitation): void
    {
        if ($invitation->accepted_at !== null) {
            throw ValidationException::withMessages([
                'invitation' => ['This invitation has already been accepted.'],
            ]);
        }

        $invitation->delete();
    }

    public function accept(string $token, string $name, string $password): User
    {
        return DB::transaction(function () use ($token, $name, $password): User {
            $invitation = Invitation::query()
                ->where('token', hash('sha256', $token))
                ->lockForUpdate()
                ->first();

            abort_unless($invitation, 404, 'This invitation could not be found.');
            abort_if(! $invitation->isValid(), 410, 'This invitation has expired or has already been used.');

            if (User::query()->where('email', $invitation->email)->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['This email already has a Clearlist account.'],
                ]);
            }

            $user = User::create([
                'name' => trim($name),
                'email' => $invitation->email,
                'password' => $password,
                'is_admin' => false,
                'is_active' => true,
            ]);

            $invitation->update(['accepted_at' => now()]);

            return $user;
        });
    }
}
