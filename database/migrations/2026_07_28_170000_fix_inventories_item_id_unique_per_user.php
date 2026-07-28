<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix bug: item_id di tabel inventories masih unique secara GLOBAL
     * (peninggalan sebelum user_id ditambahkan), padahal seharusnya
     * unik hanya PER USER. Ini menyebabkan error 1062 Duplicate entry
     * saat 2 akun berbeda sama-sama memakai item_id yang sama
     * (mis. item_id = 1), karena Add Inventory di akun kedua ditolak
     * oleh database walau logic controller sudah benar (sudah
     * memfilter berdasarkan user_id).
     */
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropUnique('inventories_item_id_unique');
            $table->unique(['user_id', 'item_id'], 'inventories_user_id_item_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropUnique('inventories_user_id_item_id_unique');
            $table->unique('item_id', 'inventories_item_id_unique');
        });
    }
};
