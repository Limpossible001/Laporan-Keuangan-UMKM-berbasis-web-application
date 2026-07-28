<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Inventory;
use Illuminate\Http\Request;
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

        $inventoryItem->decrement('quantity', $validated['quantity']);
        $inventoryItem->update(['last_updated' => now()]);

        $validated['user_id'] = $userId;
        $sale = Sale::create($validated);

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
        $sale->update($validated);
        return response()->json($sale->load('inventory'));
    }

    public function destroy(Request $request, $id)
    {
        Sale::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}