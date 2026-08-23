<?php

namespace App\Models;

use Database\Factories\TodoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'description', 'completed', 'due_date'])]
class Todo extends Model
{
    /** @use HasFactory<TodoFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'due_date' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<User, Todo>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
