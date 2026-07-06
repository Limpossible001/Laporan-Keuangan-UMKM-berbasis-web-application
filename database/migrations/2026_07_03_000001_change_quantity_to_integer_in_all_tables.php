<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Input 1: Ubah tipe kolom quantity dari decimal/float → unsignedInteger
     * di tabel inventories, purchases, dan sales.
     *
     * CATATAN: MySQL/MariaDB tidak mendukung ALTER COLUMN langsung dari decimal
     * ke integer dalam satu langkah — kita pakai raw statement untuk safety.
     */
    public function up(): void
    {
        // Bulatkan nilai desimal yang mungkin ada sebelum convert tipe
        DB::statement('UPDATE inventories SET quantity = ROUND(quantity)');
        DB::statement('UPDATE purchases  SET quantity = ROUND(quantity)');
        DB::statement('UPDATE sales      SET quantity = ROUND(quantity)');

        Schema::table('inventories', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(0)->change();
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(0)->change();
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->default(0)->change();
        });
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->default(0)->change();
        });
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->default(0)->change();
        });
    }
};