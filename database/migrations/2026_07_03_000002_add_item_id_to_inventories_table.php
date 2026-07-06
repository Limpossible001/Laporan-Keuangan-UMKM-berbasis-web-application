<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Input 4: Tambah kolom item_id ke tabel inventories.
     * item_id adalah ID yang DITENTUKAN USER (bukan auto-increment PK).
     * Unique per row, nullable saat migration agar data lama tidak error,
     * lalu diisi dengan nilai id yang sudah ada (backfill) sebelum ditambah unique.
     */
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->unsignedInteger('item_id')->nullable()->after('id');
        });

        // Backfill: isi item_id dengan nilai id yang sudah ada
        DB::statement('UPDATE inventories SET item_id = id');

        Schema::table('inventories', function (Blueprint $table) {
            $table->unsignedInteger('item_id')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropUnique(['item_id']);
            $table->dropColumn('item_id');
        });
    }
};