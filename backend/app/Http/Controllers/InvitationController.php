<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptInvitationRequest;
use App\Http\Requests\StoreInvitationRequest;
use App\Http\Resources\UserResource;
use App\Models\Invitation;
use App\Services\InvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvitationController extends Controller
{
    public function __construct(
        private readonly InvitationService $invitationService,
    ) {}

    public function store(StoreInvitationRequest $request): JsonResponse
    {
        $this->invitationService->invite(
            inviter: $request->user(),
            email: $request->string('email')->lower()->trim()->toString(),
        );

        return response()->json([
            'message' => 'Invitation sent successfully.',
        ], 201);
    }

    public function show(string $token): JsonResponse
    {
        $invitation = $this->invitationService->findValid($token);

        return response()->json([
            'email' => $invitation->email,
            'expires_at' => $invitation->expires_at?->toISOString(),
        ]);
    }

    public function resend(Request $request, Invitation $invitation): JsonResponse
    {
        $this->invitationService->resend(
            inviter: $request->user(),
            invitation: $invitation,
        );

        return response()->json([
            'message' => 'Invitation resent successfully.',
        ]);
    }

    public function destroy(Invitation $invitation): JsonResponse
    {
        $this->invitationService->delete($invitation);

        return response()->json([
            'message' => 'Invitation deleted.',
        ]);
    }

    public function accept(AcceptInvitationRequest $request, string $token): JsonResponse
    {
        $invitation = $this->invitationService->findValid($token);
        $user = $this->invitationService->accept(
            token: $token,
            name: $request->string('name')->trim()->toString(),
            password: $request->string('password')->toString(),
        );

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource($user),
            'invitation_email' => $invitation->email,
        ], 201);
    }
}
