<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index()
    {
        return response()->json(Purchase::orderBy('date', 'desc')->get());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'          => 'date',
            'supplier_name' => 'string',
            'item_name'     => 'string',
            'quantity'      => 'numeric',
            'unit_price'    => 'numeric',
            'total_amount'  => 'numeric',
            'description'   => 'nullable|string',
        ]);
        $purchase = Purchase::create($validated);
        return response()->json($purchase, 201);
    }
    
    public function update(Request $request, $id)
    {
        $purchase = Purchase::findOrFail($id);

        $validated = $request->validate([
            'date'          => 'date',
            'supplier_name' => 'string',
            'item_name'     => 'string',
            'quantity'      => 'numeric',
            'unit_price'    => 'numeric',
            'total_amount'  => 'numeric',
            'description'   => 'nullable|string',
        ]);

        $purchase->update($validated);
        return response()->json($purchase);
    }

    public function destroy($id)
    {
        Purchase::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted succesfully']);
    }
}