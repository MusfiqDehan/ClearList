<?php

namespace App\Services;

use App\Models\Todo;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class TodoService
{
    /**
     * @return LengthAwarePaginator<int, Todo>
     */
    public function paginate(User $user, string $status = 'all', string $search = '', int $perPage = 50): LengthAwarePaginator
    {
        return $user->todos()
            ->when($status === 'active', fn ($query) => $query->where('completed', false))
            ->when($status === 'completed', fn ($query) => $query->where('completed', true))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }))
            ->orderBy('completed')
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->latest('created_at')
            ->paginate(min(max($perPage, 1), 100))
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(User $user, array $attributes): Todo
    {
        return $user->todos()->create($this->validated($attributes, titleRequired: true))->refresh();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(User $user, Todo $todo, array $attributes): Todo
    {
        Gate::forUser($user)->authorize('update', $todo);

        $todo->update($this->validated($attributes));

        return $todo->refresh();
    }

    public function delete(User $user, Todo $todo): void
    {
        Gate::forUser($user)->authorize('delete', $todo);

        $todo->delete();
    }

    public function findOwned(User $user, int $id): Todo
    {
        return $user->todos()->findOrFail($id);
    }

    /**
     * @return array{total:int,completed:int,active:int,due_today:int,due_tomorrow:int,today:string,tomorrow:string}
     */
    public function statistics(User $user): array
    {
        $today = CarbonImmutable::today();
        $tomorrow = $today->addDay();
        $query = $user->todos();

        return [
            'total' => (clone $query)->count(),
            'completed' => (clone $query)->where('completed', true)->count(),
            'active' => (clone $query)->where('completed', false)->count(),
            'due_today' => (clone $query)->whereDate('due_date', $today)->count(),
            'due_tomorrow' => (clone $query)->whereDate('due_date', $tomorrow)->count(),
            'today' => $today->toDateString(),
            'tomorrow' => $tomorrow->toDateString(),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function validated(array $attributes, bool $titleRequired = false): array
    {
        return Validator::make($attributes, [
            'title' => [$titleRequired ? 'required' : 'sometimes', 'string', 'min:1', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'completed' => ['sometimes', 'boolean'],
            'due_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ])->validate();
    }
}
