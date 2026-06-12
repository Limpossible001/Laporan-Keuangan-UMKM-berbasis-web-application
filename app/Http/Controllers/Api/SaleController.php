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
        return response()->json(Sale::orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'           => 'required|date',
            'product_name'   => 'required|string',
            'quantity'       => 'required|numeric|min:0.01',
            'unit_price'     => 'required|numeric|min:1',
            'total_revenue'  => 'required|numeric|min:0.01',
            'customer_notes' => 'nullable|string',
        ]);

        $inventoryItem = Inventory::where('product_name', $validated['product_name'])->first();

        if (!$inventoryItem) {
            return response()->json([
                'message' => 'Produk tidak ditemukan di inventory.'
            ], 422);
        }

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

        return response()->json($sale, 201);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'date'           => 'required|date',
            'product_name'   => 'required|string',
            'quantity'       => 'required|numeric|min:0.01',
            'unit_price'     => 'required|numeric|min:1',
            'total_revenue'  => 'required|numeric|min:0.01',
            'customer_notes' => 'nullable|string',
        ]);

        $sale->update($validated);
        return response()->json($sale);
    }

    public function destroy($id)
    {
        Sale::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
