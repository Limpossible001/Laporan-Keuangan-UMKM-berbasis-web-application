<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(Supplier::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'contact_person'  => 'nullable|string|max:255',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string',
            'notes'           => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);
        return response()->json($supplier, 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'contact_person'  => 'nullable|string|max:255',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string',
            'notes'           => 'nullable|string',
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