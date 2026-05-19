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
            'date'          => 'required|date',
            'supplier_name' => 'required|string',
            'item_name'     => 'required|string',
            'quantity'      => 'required|numeric',
            'unit_price'    => 'required|numeric',
            'total_amount'  => 'required|numeric',
        ]);
        $purchase = Purchase::create($validated);
        return respone()->json($purchase, 201);
    }    

    public function destroy($id)
    {
        Purchase::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted succesfully']);
    }
}