<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Inventory;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index()
    {
        return response()->json(
            Purchase::with(['supplier', 'inventory'])->orderBy('date', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'          => 'required|date',
            'supplier_id'   => 'required|exists:suppliers,id',
            'inventory_id'  => 'required|exists:inventories,id',
            'quantity'      => 'required|numeric|min:0.01',
            'unit_price'    => 'required|numeric|min:1',
            'total_amount'  => 'required|numeric|min:0.01',
            'description'   => 'nullable|string',
        ]);

        $purchase = Purchase::create($validated);

        // Pembelian = stok bertambah (kebalikan dari Sale yang mengurangi stok)
        $inventoryItem = Inventory::findOrFail($validated['inventory_id']);
        $inventoryItem->increment('quantity', $validated['quantity']);
        $inventoryItem->update(['last_updated' => now()]);

        return response()->json($purchase->load(['supplier', 'inventory']), 201);
    }

    public function update(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);

        $validated = $request->validate([
            'date'          => 'required|date',
            'supplier_id'   => 'required|exists:suppliers,id',
            'inventory_id'  => 'required|exists:inventories,id',
            'quantity'      => 'required|numeric|min:0.01',
            'unit_price'    => 'required|numeric|min:1',
            'total_amount'  => 'required|numeric|min:0.01',
            'description'   => 'nullable|string',
        ]);

        // Catatan: penyesuaian stok akibat edit quantity TIDAK ditangani di sini.
        // Ini sengaja disederhanakan untuk v4.0 — direkomendasikan dibahas
        // terpisah di Tahap berikutnya (edit Purchase yang sudah mengubah stok
        // butuh logic reverse-then-reapply yang lebih kompleks).
        $purchase->update($validated);
        return response()->json($purchase->load(['supplier', 'inventory']));
    }

    public function destroy($id)
    {
        // Catatan: sama seperti update, hapus Purchase TIDAK otomatis
        // mengembalikan/mengurangi stok inventory di v4.0 ini.
        Purchase::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}