<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pemisahan fungsi Add Inventory (pendataan) vs Add Purchase (nilai inventori):
     * Add Inventory sekarang HANYA mengisi item_id, product_name, category, notes.
     * unit_price & quantity tidak lagi diisi saat item pertama kali didata — nilainya
     * baru terisi lewat transaksi Purchase pertama. Karena itu unit_price butuh
     * default 0.00 agar insert dari Add Inventory tidak melanggar NOT NULL.
     *
     * quantity tidak perlu diubah, sudah default(0) sejak migration
     * 2026_07_03_000001_change_quantity_to_integer_in_all_tables.
     */
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->decimal('unit_price', 15, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->decimal('unit_price', 15, 2)->default(null)->change();
        });
    }
};
