<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Inventory::where('user_id', $request->user()->id)->orderBy('item_id')->get()
        );
    }

    /**
     * Input 4: Upsert logic.
     * - Jika item_id sudah ada MILIK USER INI → tambahkan quantity (restock).
     * - Jika item_id baru (untuk user ini) → buat record baru.
     *
     * FIX multi-user: item_id sekarang unik PER USER, bukan global.
     * Sebelumnya Inventory::where('item_id', ...) tanpa filter user_id
     * membuat item_id user manapun bisa "restock" ke item_id milik user lain.
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_id'      => 'required|integer|min:1',
            'product_name' => 'required|string|max:255',
            'category'     => 'nullable|string|max:100',
            'unit_price'   => 'required|numeric|min:1',
            'quantity'     => 'required|integer|min:1',
            'notes'        => 'nullable|string',
        ]);

        $userId = $request->user()->id;

        $existing = Inventory::where('item_id', $request->item_id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->update([
                'quantity'     => $existing->quantity + (int) $request->quantity,
                'last_updated' => now(),
            ]);
            return response()->json([
                'item'    => $existing->fresh(),
                'action'  => 'updated',
                'message' => "Stok {$existing->product_name} berhasil ditambahkan.",
            ], 200);
        }

        $item = Inventory::create([
            'user_id'      => $userId,
            'item_id'      => (int) $request->item_id,
            'product_name' => $request->product_name,
            'category'     => $request->category,
            'unit_price'   => $request->unit_price,
            'quantity'     => (int) $request->quantity,
            'notes'        => $request->notes,
            'last_updated' => now(),
        ]);

        return response()->json([
            'item'    => $item,
            'action'  => 'created',
            'message' => "Item baru {$item->product_name} berhasil ditambahkan.",
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = Inventory::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'product_name' => 'required|string|max:255',
            'category'     => 'nullable|string|max:100',
            'unit_price'   => 'required|numeric|min:1',
            'quantity'     => 'required|integer|min:0',
            'notes'        => 'nullable|string',
        ]);

        $item->update([
            'product_name' => $request->product_name,
            'category'     => $request->category,
            'unit_price'   => $request->unit_price,
            'quantity'     => (int) $request->quantity,
            'notes'        => $request->notes,
            'last_updated' => now(),
        ]);

        return response()->json($item->fresh());
    }

    public function adjustStock(Request $request, $id)
    {
        $item = Inventory::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'adjustment' => 'required|integer|not_in:0',
            'notes'      => 'nullable|string',
        ]);

        $newQuantity = $item->quantity + (int) $request->adjustment;

        if ($newQuantity < 0) {
            return response()->json([
                'message' => 'Stok tidak bisa kurang dari 0. Stok saat ini: ' . $item->quantity,
            ], 422);
        }

        $item->update([
            'quantity'     => $newQuantity,
            'last_updated' => now(),
            'notes'        => $request->notes ?? $item->notes,
        ]);

        return response()->json($item->fresh());
    }

    public function destroy(Request $request, $id)
    {
        Inventory::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}