<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, int|string|bool|null>
     */
    public function toArray(Request $request): array
    {
        return [
            'type' => 'user',
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_admin' => $this->isAdmin(),
            'is_active' => $this->isActive(),
            'total_tasks' => (int) $this->total_tasks,
            'completed_tasks' => (int) $this->completed_tasks,
            'pending_tasks' => (int) $this->pending_tasks,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
