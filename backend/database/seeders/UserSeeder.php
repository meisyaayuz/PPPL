<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin account
        User::updateOrCreate(
            ['email' => 'admin@eco.id'],
            [
                'name' => 'Admin GreenTour',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Create a demo user account
        User::updateOrCreate(
            ['email' => 'user@eco.id'],
            [
                'name' => 'User Demo',
                'password' => Hash::make('user123'),
                'role' => 'user',
            ]
        );
    }
}
