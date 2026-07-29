<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tahap 3: tambah kolom penanda asal (source) pada cash_flows agar
     * setiap entry Input Pembelian / Input Penjualan bisa dikaitkan 1:1
     * ke satu baris Cash Flow Records secara otomatis (bukan input manual).
     *
     * - source_type: 'purchase' | 'sale' | null (null = entry manual, seperti sebelumnya)
     * - source_id  : id baris di tabel purchases / sales yang menjadi asal entry ini
     */
    public function up(): void
    {
        Schema::table('cash_flows', function (Blueprint $table) {
            $table->string('source_type')->nullable()->after('category');
            $table->unsignedBigInteger('source_id')->nullable()->after('source_type');
            $table->index(['source_type', 'source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_flows', function (Blueprint $table) {
            $table->dropIndex(['cash_flows_source_type_source_id_index']);
            $table->dropColumn(['source_type', 'source_id']);
        });
    }
};