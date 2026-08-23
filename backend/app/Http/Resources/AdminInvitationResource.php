<?php

namespace App\Http\Resources;

use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Invitation */
class AdminInvitationResource extends JsonResource
{
    /**
     * @return array<string, int|string|bool|null>
     */
    public function toArray(Request $request): array
    {
        return [
            'type' => 'invitation',
            'id' => $this->id,
            'name' => null,
            'email' => $this->email,
            'is_admin' => false,
            'is_active' => false,
            'total_tasks' => 0,
            'completed_tasks' => 0,
            'pending_tasks' => 0,
            'created_at' => $this->created_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
        ];
    }
}
