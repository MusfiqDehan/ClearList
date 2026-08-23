<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminService
{
    /**
     * @return array{total_users:int,active_users:int,inactive_users:int,total_tasks:int,completed_tasks:int,pending_tasks:int}
     */
    public function metrics(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'total_tasks' => Todo::count(),
            'completed_tasks' => Todo::where('completed', true)->count(),
            'pending_tasks' => Todo::where('completed', false)->count(),
        ];
    }

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function paginateUsers(
        string $search = '',
        string $status = 'all',
        int $perPage = 10,
    ): LengthAwarePaginator {
        return User::query()
            ->withCount([
                'todos as total_tasks',
                'todos as completed_tasks' => fn (Builder $query) => $query->where('completed', true),
                'todos as pending_tasks' => fn (Builder $query) => $query->where('completed', false),
            ])
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($status === 'active', fn (Builder $query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->orderByDesc('created_at')
            ->paginate(min(max($perPage, 1), 10))
            ->withQueryString();
    }

    /**
     * @return LengthAwarePaginator<int, Invitation>
     */
    public function paginateInvitations(
        string $search = '',
        int $perPage = 10,
    ): LengthAwarePaginator {
        return Invitation::query()
            ->whereNull('accepted_at')
            ->when($search !== '', fn (Builder $query) => $query->where('email', 'like', "%{$search}%"))
            ->orderByDesc('created_at')
            ->paginate(min(max($perPage, 1), 10))
            ->withQueryString();
    }

    public function updateStatus(User $actor, User $user, bool $isActive): User
    {
        if ($isActive === $user->isActive()) {
            return $user;
        }

        if (! $isActive && $actor->is($user)) {
            throw ValidationException::withMessages([
                'is_active' => ['You cannot deactivate your own account.'],
            ]);
        }

        if (! $isActive && $user->isAdmin() && User::query()
            ->where('is_admin', true)
            ->where('is_active', true)
            ->count() <= 1
        ) {
            throw ValidationException::withMessages([
                'is_active' => ['The last active administrator cannot be deactivated.'],
            ]);
        }

        $user->update([
            'is_active' => $isActive,
            'deactivated_at' => $isActive ? null : now(),
        ]);

        if (! $isActive) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        return $user->refresh();
    }

    public function deleteUser(User $actor, User $user): void
    {
        if ($actor->is($user)) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own account.'],
            ]);
        }

        if ($user->isAdmin() && $user->isActive() && User::query()
            ->where('is_admin', true)
            ->where('is_active', true)
            ->count() <= 1
        ) {
            throw ValidationException::withMessages([
                'user' => ['The last active administrator cannot be deleted.'],
            ]);
        }

        DB::transaction(function () use ($user): void {
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $user->delete();
        });
    }
}
