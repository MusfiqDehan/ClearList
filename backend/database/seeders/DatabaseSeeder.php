<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Demo Admin',
            'password' => 'password123',
            'is_admin' => true,
            'is_active' => true,
            'deactivated_at' => null,
        ]);

        $user = User::updateOrCreate([
            'email' => 'user@example.com',
        ], [
            'name' => 'Demo User',
            'password' => 'password123',
            'is_admin' => false,
            'is_active' => true,
            'deactivated_at' => null,
        ]);

        $admin->todos()->updateOrCreate([
            'title' => 'Review the Clearlist dashboard',
        ], [
            'description' => 'Explore the admin overview and account controls.',
            'completed' => false,
            'due_date' => now()->addDay()->toDateString(),
        ]);
        $admin->todos()->updateOrCreate([
            'title' => 'Verify the weekly metrics',
        ], [
            'description' => 'Check completed and pending task totals.',
            'completed' => true,
            'due_date' => now()->subDay()->toDateString(),
        ]);

        $user->todos()->updateOrCreate([
            'title' => 'Explore the Laravel API',
        ], [
            'description' => 'Read the API routes and follow a request through the application.',
            'completed' => false,
            'due_date' => now()->addDays(2)->toDateString(),
        ]);
        $user->todos()->updateOrCreate([
            'title' => 'Build the Next.js dashboard',
        ], [
            'description' => 'Connect the typed frontend client to the todo endpoints.',
            'completed' => true,
            'due_date' => now()->subDay()->toDateString(),
        ]);
        $user->todos()->updateOrCreate([
            'title' => 'Plan tomorrow’s priorities',
        ], [
            'description' => 'Choose the next meaningful step for tomorrow.',
            'completed' => false,
            'due_date' => now()->addDay()->toDateString(),
        ]);
    }
}
