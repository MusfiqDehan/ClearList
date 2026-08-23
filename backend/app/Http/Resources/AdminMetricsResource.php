<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminMetricsResource extends JsonResource
{
    /**
     * @return array<string, int>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_users' => $this->resource['total_users'],
            'active_users' => $this->resource['active_users'],
            'inactive_users' => $this->resource['inactive_users'],
            'total_tasks' => $this->resource['total_tasks'],
            'completed_tasks' => $this->resource['completed_tasks'],
            'pending_tasks' => $this->resource['pending_tasks'],
        ];
    }
}
