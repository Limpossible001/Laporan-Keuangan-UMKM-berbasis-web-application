<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(Inventory::orderBy('product_name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name'  => 'string',
            'category'      => 'string',
            'unit_price'    => 'numeric|min:0',
            'quantity'      => 'numeric|min:0',
            'notes'         => 'string',
        ]);

        $validated['last_updated'] = now();

        $item = Inventory::create($validated);
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);

        $validated = $request->validate([
            'product_name'  => 'string',
            'category'      => 'string',
            'unit_price'    => 'numeric|min:0',
            'quantity'      => 'numeric|min:0',
            'notes'         => 'string',
        ]);
        
        $validated['last_updated'] = now();

        $item->update($validated);
        return response()->json($item);
    }

    // STrictly untuk adjust stok; baik menambahkan atau mengurangkan
    public function adjustStock(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);

        $request->validate([
            'adjustment'    => 'numeric', // positif, negatif
            'notes'         => 'nullable|string',
        ]);

        $newQuantity = $item->quantity + $request->adjustment;

        if ($newQuantity < 0) {
            return response()->json([
                'message' => 'Stok tidak bisa kurang dari 0. Stok saat ini: ' . $item->quantity
            ], 422);
        }

        $item->update([
            'quantity'      => $newQuantity,
            'last_updated'  => now(),
            'notes'         => $request->notes ?? $item->notes,
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        Inventory::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted succesfully']);
    }
}
