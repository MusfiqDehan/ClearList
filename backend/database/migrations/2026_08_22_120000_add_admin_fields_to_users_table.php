<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_admin')->default(false)->after('password');
            $table->boolean('is_active')->default(true)->after('is_admin');
            $table->timestamp('deactivated_at')->nullable()->after('is_active');
            $table->index(['is_admin', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['users_is_admin_is_active_index']);
            $table->dropColumn(['is_admin', 'is_active', 'deactivated_at']);
        });
    }
};
