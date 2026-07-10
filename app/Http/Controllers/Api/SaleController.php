<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Inventory;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index()
    {
        return response()->json(
            Sale::with('inventory')->orderBy('date', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'           => 'required|date',
            'inventory_id'   => 'required|exists:inventories,id',
            'quantity'       => 'required|integer|min:1',
            'unit_price'     => 'required|numeric|min:1',
            'total_revenue'  => 'required|numeric|min:0',
            'customer_notes' => 'nullable|string',
        ]);

        $inventoryItem = Inventory::findOrFail($validated['inventory_id']);

        if ($inventoryItem->quantity < $validated['quantity']) {
            return response()->json([
                'message' => 'Stok tidak mencukupi. Stok tersedia: ' . $inventoryItem->quantity
            ], 422);
        }

        // Kurangi stok inventory
        $inventoryItem->decrement('quantity', $validated['quantity']);
        $inventoryItem->update(['last_updated' => now()]);

        // Simpan data penjualan
        $sale = Sale::create($validated);

        return response()->json($sale->load('inventory'), 201);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'date'           => 'required|date',
            'inventory_id'   => 'required|exists:inventories,id',
            'quantity'       => 'required|integer|min:1',
            'unit_price'     => 'required|numeric|min:1',
            'total_revenue'  => 'required|numeric|min:1',
            'customer_notes' => 'nullable|string',
        ]);

        // Catatan: sama seperti Purchase, penyesuaian stok akibat edit
        // TIDAK ditangani di v4.0 ini — direkomendasikan dibahas di Tahap berikutnya.
        $sale->update($validated);
        return response()->json($sale->load('inventory'));
    }

    public function destroy($id)
    {
        Sale::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}