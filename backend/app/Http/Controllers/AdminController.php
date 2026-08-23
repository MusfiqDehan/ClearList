<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminUserIndexRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Http\Resources\AdminInvitationResource;
use App\Http\Resources\AdminMetricsResource;
use App\Http\Resources\AdminUserResource;
use App\Models\User;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private readonly AdminService $adminService,
    ) {}

    public function metrics(): AdminMetricsResource
    {
        return new AdminMetricsResource($this->adminService->metrics());
    }

    public function users(AdminUserIndexRequest $request)
    {
        $search = $request->string('search')->trim()->toString();
        $perPage = $request->integer('per_page', 10);

        if ($request->string('status', 'all')->toString() === 'invited') {
            return AdminInvitationResource::collection(
                $this->adminService->paginateInvitations(
                    search: $search,
                    perPage: $perPage,
                ),
            );
        }

        $users = $this->adminService->paginateUsers(
            search: $search,
            status: $request->string('status', 'all')->toString(),
            perPage: $perPage,
        );

        return AdminUserResource::collection($users);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->adminService->updateStatus(
            actor: $request->user(),
            user: $user,
            isActive: $request->boolean('is_active'),
        );

        return response()->json([
            'user' => new AdminUserResource($updatedUser),
            'message' => $updatedUser->isActive()
                ? 'User account activated.'
                : 'User account deactivated.',
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->adminService->deleteUser(
            actor: $request->user(),
            user: $user,
        );

        return response()->json([
            'message' => 'User account permanently deleted.',
        ]);
    }
}
