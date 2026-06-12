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
            'product_name' => 'required|string',
            'category'     => 'nullable|string',
            'unit_price'   => 'required|numeric|min:1',
            'quantity'     => 'required|numeric|min:0.01',
            'notes'        => 'nullable|string',
        ]);

        $validated['last_updated'] = now();

        $item = Inventory::create($validated);
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);

        $validated = $request->validate([
            'product_name' => 'required|string',
            'category'     => 'nullable|string',
            'unit_price'   => 'required|numeric|min:1',
            'quantity'     => 'required|numeric|min:0.01',
            'notes'        => 'nullable|string',
        ]);

        $validated['last_updated'] = now();

        $item->update($validated);
        return response()->json($item);
    }

    /**
     * Adjust stok — positif untuk tambah, negatif untuk kurangi.
     * Hasil akhir tidak boleh < 0.
     */
    public function adjustStock(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);

        $request->validate([
            'adjustment' => 'required|numeric',   // boleh negatif (pengurangan stok)
            'notes'      => 'nullable|string',
        ]);

        // Tidak boleh adjustment = 0
        if ($request->adjustment == 0) {
            return response()->json([
                'message' => 'Nilai adjustment tidak boleh 0.'
            ], 422);
        }

        $newQuantity = $item->quantity + $request->adjustment;

        if ($newQuantity < 0) {
            return response()->json([
                'message' => 'Stok tidak bisa kurang dari 0. Stok saat ini: ' . $item->quantity
            ], 422);
        }

        $item->update([
            'quantity'     => $newQuantity,
            'last_updated' => now(),
            'notes'        => $request->notes ?? $item->notes,
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        Inventory::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
