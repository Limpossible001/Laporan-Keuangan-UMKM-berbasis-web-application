<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Inventory;
use App\Models\CashFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Purchase::with(['supplier', 'inventory'])
                ->where('user_id', $request->user()->id)
                ->orderBy('date', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'date' => 'required|date',
            // FIX: supplier_id & inventory_id harus milik user yang login,
            // bukan sekadar "ada di tabel manapun".
            'supplier_id' => [
                'required',
                Rule::exists('suppliers', 'id')->where('user_id', $userId),
            ],
            'inventory_id' => [
                'required',
                Rule::exists('inventories', 'id')->where('user_id', $userId),
            ],
            'quantity'      => 'required|integer|min:1',
            'unit_price'    => 'required|numeric|min:1',
            'total_amount'  => 'required|numeric|min:0',
            'description'   => 'nullable|string',
        ]);

        $validated['user_id'] = $userId;

        // Tahap 3: bungkus dalam transaksi DB karena sekarang menyentuh 3 tabel
        // sekaligus (purchases, inventories, cash_flows) — kalau salah satu
        // gagal, semuanya di-rollback supaya data tidak "setengah jalan".
        $purchase = DB::transaction(function () use ($validated, $userId) {
            $purchase = Purchase::create($validated);

            // Pembelian = stok bertambah (kebalikan dari Sale yang mengurangi stok)
            $inventoryItem = Inventory::where('id', $validated['inventory_id'])
                ->where('user_id', $userId)
                ->firstOrFail();
            $inventoryItem->increment('quantity', $validated['quantity']);
            $inventoryItem->update(['last_updated' => now()]);

            // Tahap 3: setiap Input Pembelian otomatis tercatat sebagai
            // Kas Keluar, Category "Pembelian" di Cash Flow Records &
            // Ringkasan Arus Kas — tidak perlu input manual lagi di CashFlowPage.
            $this->syncCashFlow($purchase);

            return $purchase;
        });

        return response()->json($purchase->load(['supplier', 'inventory']), 201);
    }

    public function update(Request $request, $id)
    {
        $userId = $request->user()->id;

        $purchase = Purchase::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $validated = $request->validate([
            'date' => 'required|date',
            'supplier_id' => [
                'required',
                Rule::exists('suppliers', 'id')->where('user_id', $userId),
            ],
            'inventory_id' => [
                'required',
                Rule::exists('inventories', 'id')->where('user_id', $userId),
            ],
            'quantity'      => 'required|integer|min:1',
            'unit_price'    => 'required|numeric|min:1',
            'total_amount'  => 'required|numeric|min:0',
            'description'   => 'nullable|string',
        ]);

        // Catatan: penyesuaian stok akibat edit quantity TIDAK ditangani di sini.
        // Ini sengaja disederhanakan untuk v4.0 — direkomendasikan dibahas
        // terpisah di Tahap berikutnya.
        DB::transaction(function () use ($purchase, $validated) {
            $purchase->update($validated);

            // Tahap 3: sinkronkan ulang entry Cash Flow terkait supaya
            // tanggal/jumlah di Ringkasan Arus Kas tetap sama dengan Purchase.
            $this->syncCashFlow($purchase->fresh());
        });

        return response()->json($purchase->load(['supplier', 'inventory']));
    }

    public function destroy(Request $request, $id)
    {
        $purchase = Purchase::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Catatan: sama seperti update, hapus Purchase TIDAK otomatis
        // mengembalikan/mengurangi stok inventory di v4.0 ini.
        DB::transaction(function () use ($purchase) {
            // Tahap 3: hapus juga entry Cash Flow otomatis yang terkait,
            // supaya tidak ada Kas Keluar "hantu" tanpa transaksi aslinya.
            CashFlow::where('source_type', CashFlow::SOURCE_PURCHASE)
                ->where('source_id', $purchase->id)
                ->delete();

            $purchase->delete();
        });

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Tahap 3: buat / perbarui satu entry Cash Flow (Kas Keluar,
     * Category = Pembelian) yang terhubung 1:1 dengan record Purchase ini,
     * memakai updateOrCreate berdasar (source_type, source_id) supaya
     * idempotent — dipanggil ulang saat update tidak membuat duplikat.
     */
    private function syncCashFlow(Purchase $purchase): void
    {
        $purchase->loadMissing(['supplier', 'inventory']);

        $itemName     = $purchase->inventory->product_name ?? 'barang';
        $supplierName = $purchase->supplier->name ?? 'supplier';

        CashFlow::updateOrCreate(
            [
                'source_type' => CashFlow::SOURCE_PURCHASE,
                'source_id'   => $purchase->id,
            ],
            [
                'user_id'     => $purchase->user_id,
                'date'        => $purchase->date,
                'type'        => 'out', // Setiap Input Pembelian = Kas Keluar
                'description' => "Pembelian {$itemName} dari {$supplierName}",
                'category'    => 'pembelian',
                'amount'      => $purchase->total_amount,
            ]
        );
    }
}