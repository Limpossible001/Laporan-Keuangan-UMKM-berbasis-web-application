<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel yang SEBELUMNYA tidak punya user_id sama sekali — inilah akar
     * bug "data overlap antar akun". activity_logs sengaja TIDAK disentuh
     * di sini karena sudah punya user_id dari awal.
     */
    private array $tables = ['suppliers', 'inventories', 'purchases', 'sales', 'cash_flows'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (!Schema::hasColumn($table, 'user_id')) {
                    // Nullable dulu (bukan langsung NOT NULL) karena tabel-tabel ini
                    // sudah punya data lama tanpa pemilik. Baris lama otomatis
                    // menjadi "orphan" (user_id = NULL) dan tidak akan muncul di
                    // akun manapun lagi setelah fix ini — lihat README untuk opsi
                    // membersihkan / mengklaim data lama tersebut secara manual.
                    $blueprint->foreignId('user_id')
                        ->nullable()
                        ->after('id')
                        ->constrained('users')
                        ->cascadeOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (Schema::hasColumn($table, 'user_id')) {
                    $blueprint->dropForeign([$table . '_user_id_foreign']);
                    $blueprint->dropColumn('user_id');
                }
            });
        }
    }
};
