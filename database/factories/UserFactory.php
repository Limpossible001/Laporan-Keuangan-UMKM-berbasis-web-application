<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Note 3: Faker bahasa Indonesia untuk data seeder yang lebih realistis
        $fakerID = \Faker\Factory::create('id_ID');

        return [
            'name'             => $fakerID->name(),
            'business_name'    => $fakerID->company(),          // kolom baru dari migration sesi lalu
            'email'            => fake()->unique()->safeEmail(), // email tetap en_US biar format valid
            'email_verified_at'=> now(),
            'password'         => static::$password ??= Hash::make('password'),
            'remember_token'   => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}