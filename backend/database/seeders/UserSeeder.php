<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@eco.id'],
            [
                'name' => 'Admin GreenTour',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

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
