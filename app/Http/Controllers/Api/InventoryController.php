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
     * Add Inventory = PENDATAAN saja (master data item), BUKAN transaksi stok/nilai.
     *
     * Perubahan (pemisahan tanggung jawab dgn Add Purchase):
     * - Tidak lagi menerima/menyimpan unit_price & quantity dari form ini.
     *   Item baru selalu mulai dari quantity=0, unit_price=0.
     * - Tidak ada lagi logic upsert/restock di sini. Jika item_id sudah
     *   terdaftar milik user ini, request DITOLAK (422) — restock/penambahan
     *   stok & nilai HARUS lewat halaman Input Pembelian (PurchaseController).
     *
     * item_id tetap unik PER USER (bukan global) — lihat migration
     * fix_inventories_item_id_unique_per_user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_id'      => 'required|integer|min:1',
            'product_name' => 'required|string|max:255',
            'category'     => 'nullable|string|max:100',
            'notes'        => 'nullable|string',
        ]);

        $userId = $request->user()->id;

        $existing = Inventory::where('item_id', $request->item_id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => "ID Item {$request->item_id} sudah dipakai untuk \"{$existing->product_name}\". "
                    . 'Gunakan ID lain, atau tambah stok item ini lewat menu Input Pembelian.',
            ], 422);
        }

        $item = Inventory::create([
            'user_id'      => $userId,
            'item_id'      => (int) $request->item_id,
            'product_name' => $request->product_name,
            'category'     => $request->category,
            'unit_price'   => 0,
            'quantity'     => 0,
            'notes'        => $request->notes,
            'last_updated' => now(),
        ]);

        return response()->json([
            'item'    => $item,
            'action'  => 'created',
            'message' => "Item baru {$item->product_name} berhasil didata. Tambahkan stok & nilai lewat Input Pembelian.",
        ], 201);
    }

    /**
     * Edit HANYA field pendataan (product_name, category, notes).
     * quantity & unit_price sengaja tidak bisa diedit dari sini —
     * keduanya hanya berubah lewat Add Purchase (nilai) atau
     * adjustStock (koreksi stok manual, mis. barang rusak/hilang).
     */
    public function update(Request $request, $id)
    {
        $item = Inventory::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'product_name' => 'required|string|max:255',
            'category'     => 'nullable|string|max:100',
            'notes'        => 'nullable|string',
        ]);

        $item->update([
            'product_name' => $request->product_name,
            'category'     => $request->category,
            'notes'        => $request->notes,
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