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
            'date'          => 'date',
            'product_name'  => 'string',
            'quantity'      => 'numeric|min:0.1',
            'unit_price'    => 'numeric|min:100',
            'total_revenue' => 'numeric|min:0',
            'customer_notes'=> 'nullable|string',
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

        // Mengurang stok inventory
        $inventoryItem->decrement('quantity', $validated['quantity']);
        $inventoryItem->update(['last_updated' => now()]);

        // Save data penjualan
        $sale = Sale::create($validated);

        return response()->json($sale, 201);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'date'          => 'date',
            'product_name'  => 'string',
            'quantity'      => 'numeric|min:0.1',
            'unit_price'    => 'numeric|min:100',
            'total_revenue' => 'numeric|min:0',
            'customer_notes'=> 'nullable|string',
        ]);

        $sale->update($validated);
        return response()->json($sale);
    }

    public function destroy($id)
    {
        Sale::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted succesfully']);
    }
}
