<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /** 
     * NOTES NIXON DARRELL, NOTES 2
     * Aturan validasi phone:
     * - WAJIB diawali "+" lalu kode negara (1-3 digit) lalu nomor lokal.
     * - Total panjang setelah "+" antara 8-15 digit (standar E.164).
     * - Tidak terbatas ke +62 saja — semua kode negara valid diterima.
     * - FE bertugas menggabungkan dropdown kode negara + input nomor
     *   menjadi satu string sebelum dikirim ke endpoint ini.
     */
    private const PHONE_REGEX = '/^\+[1-9]\d{7,14}$/';

    public function index()
    {
        return response()->json(Supplier::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'contact_person'  => 'required|string|max:255',
            'phone'           => ['required', 'string', 'regex:' . self::PHONE_REGEX],
            'address'         => 'required|string',
            'notes'           => 'required|string',
        ], [
            'phone.regex' => 'Format nomor telpon tidak valid. Harus diawali kode negara, contoh: +6281234567890.',
        ]);

        $supplier = Supplier::create($validated);
        return response()->json($supplier, 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'contact_person'  => 'required|string|max:255',
            'phone'           => ['required', 'string', 'regex:' . self::PHONE_REGEX],
            'address'         => 'required|string',
            'notes'           => 'required|string',
        ], [
            'phone.regex' => 'Format nomor telpon tidak valid. Harus diawali kode negara, contoh: +6281234567890.',
        ]);

        $supplier->update($validated);
        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        // Cegah hapus supplier yang masih punya riwayat pembelian
        if ($supplier->purchases()->exists()) {
            return response()->json([
                'message' => 'Supplier tidak bisa dihapus karena masih memiliki riwayat pembelian.'
            ], 422);
        }

        $supplier->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}