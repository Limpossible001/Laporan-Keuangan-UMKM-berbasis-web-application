<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Inventory;
use App\Models\CashFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Sale::with('inventory')
                ->where('user_id', $request->user()->id)
                ->orderBy('date', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'date'         => 'required|date',
            // FIX: inventory_id harus ada DAN milik user yang sedang login —
            // sebelumnya exists:inventories,id saja, jadi User B bisa kirim
            // inventory_id milik User A dan lolos validasi.
            'inventory_id' => [
                'required',
                Rule::exists('inventories', 'id')->where('user_id', $userId),
            ],
            'quantity'       => 'required|integer|min:1',
            'unit_price'     => 'required|numeric|min:1',
            'total_revenue'  => 'required|numeric|min:0',
            'customer_notes' => 'nullable|string',
        ]);

        $inventoryItem = Inventory::where('id', $validated['inventory_id'])
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($inventoryItem->quantity < $validated['quantity']) {
            return response()->json([
                'message' => 'Stok tidak mencukupi. Stok tersedia: ' . $inventoryItem->quantity
            ], 422);
        }

        $validated['user_id'] = $userId;

        // Tahap 3: bungkus dalam transaksi DB karena sekarang menyentuh 3 tabel
        // sekaligus (sales, inventories, cash_flows).
        $sale = DB::transaction(function () use ($validated, $inventoryItem) {
            $inventoryItem->decrement('quantity', $validated['quantity']);
            $inventoryItem->update(['last_updated' => now()]);

            $sale = Sale::create($validated);

            // Tahap 3: setiap Input Penjualan otomatis tercatat sebagai
            // Kas Masuk, Category "Penjualan" di Cash Flow Records &
            // Ringkasan Arus Kas — tidak perlu input manual lagi di CashFlowPage.
            $this->syncCashFlow($sale);

            return $sale;
        });

        return response()->json($sale->load('inventory'), 201);
    }

    public function update(Request $request, $id)
    {
        $userId = $request->user()->id;

        $sale = Sale::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $validated = $request->validate([
            'date'         => 'required|date',
            'inventory_id' => [
                'required',
                Rule::exists('inventories', 'id')->where('user_id', $userId),
            ],
            'quantity'       => 'required|integer|min:1',
            'unit_price'     => 'required|numeric|min:1',
            'total_revenue'  => 'required|numeric|min:1',
            'customer_notes' => 'nullable|string',
        ]);

        // Catatan: sama seperti Purchase, penyesuaian stok akibat edit
        // TIDAK ditangani di v4.0 ini — direkomendasikan dibahas di Tahap berikutnya.
        DB::transaction(function () use ($sale, $validated) {
            $sale->update($validated);

            // Tahap 3: sinkronkan ulang entry Cash Flow terkait supaya
            // tanggal/jumlah di Ringkasan Arus Kas tetap sama dengan Sale.
            $this->syncCashFlow($sale->fresh());
        });

        return response()->json($sale->load('inventory'));
    }

    public function destroy(Request $request, $id)
    {
        $sale = Sale::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        DB::transaction(function () use ($sale) {
            // Tahap 3: hapus juga entry Cash Flow otomatis yang terkait,
            // supaya tidak ada Kas Masuk "hantu" tanpa transaksi aslinya.
            CashFlow::where('source_type', CashFlow::SOURCE_SALE)
                ->where('source_id', $sale->id)
                ->delete();

            $sale->delete();
        });

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Tahap 3: buat / perbarui satu entry Cash Flow (Kas Masuk,
     * Category = Penjualan) yang terhubung 1:1 dengan record Sale ini,
     * memakai updateOrCreate berdasar (source_type, source_id) supaya
     * idempotent — dipanggil ulang saat update tidak membuat duplikat.
     */
    private function syncCashFlow(Sale $sale): void
    {
        $sale->loadMissing('inventory');

        $itemName    = $sale->inventory->product_name ?? 'barang';
        $description = "Penjualan {$itemName}";
        if ($sale->customer_notes) {
            $description .= " ({$sale->customer_notes})";
        }

        CashFlow::updateOrCreate(
            [
                'source_type' => CashFlow::SOURCE_SALE,
                'source_id'   => $sale->id,
            ],
            [
                'user_id'     => $sale->user_id,
                'date'        => $sale->date,
                'type'        => 'in', // Setiap Input Penjualan = Kas Masuk
                'description' => $description,
                'category'    => 'penjualan',
                'amount'      => $sale->total_revenue,
            ]
        );
    }
}