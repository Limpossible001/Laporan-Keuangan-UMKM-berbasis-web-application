<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Inventory;
use Illuminate\Http\Request;
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
        $purchase = Purchase::create($validated);

        // Pembelian = SATU-SATUNYA sumber perubahan stok & nilai inventori:
        // - stok bertambah (kebalikan dari Sale yang mengurangi stok)
        // - unit_price inventori di-update ke harga pembelian terbaru, karena
        //   Add Inventory tidak lagi mengisi unit_price (defaultnya 0 saat
        //   item baru pertama kali didata)
        $inventoryItem = Inventory::where('id', $validated['inventory_id'])
            ->where('user_id', $userId)
            ->firstOrFail();
        $inventoryItem->increment('quantity', $validated['quantity']);
        $inventoryItem->update([
            'unit_price'   => $validated['unit_price'],
            'last_updated' => now(),
        ]);

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
        $purchase->update($validated);
        return response()->json($purchase->load(['supplier', 'inventory']));
    }

    public function destroy(Request $request, $id)
    {
        // Catatan: sama seperti update, hapus Purchase TIDAK otomatis
        // mengembalikan/mengurangi stok inventory di v4.0 ini.
        Purchase::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}