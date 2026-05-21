<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use Illuminate\Http\Request;

class CashFlowController extends Controller
{
    public function index()
    {
        return response()->json(CashFlow::orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'          =>'date',
            'type'          =>'in:in,out',
            'description'   =>'string',
            'amount'        =>'numeric|min:0',
            'category'      =>'string',
        ]);
        
        $cashflow = CashFlow::create($validated);
        return response()->json($cashFlow, 201);
    }

    public function update(Request $request, $id)
    {
        $cashFlow = CashFlow::findOrFail($id);

        $validated = $request->validate([
            'date'          =>'date',
            'type'          =>'in:in,out',
            'description'   =>'string',
            'amount'        =>'numeric|min:0',
            'category'      =>'string',
        ]);

        $cashFlow = CashFlow::update($validated);
        return response()->json($cashFlow);
    }

    public function destroy ($id)
    {
        CashFlow::findOrFail($id)->delete();
        return response()->json(['message'=>'Deleted succesfully']);
    }

    public function summary()
    {
        $cashIn = CashFlow::where('type', 'in')->sum('amount');
        $cashOut= CashFlow::where('type', 'out')->sum('amount');

        return response()->json([
            'cash_in'       => $cashIn,
            'cash_out'      => $cashOut,
            'net_cash_flow' => $cashIn - $cashOut,
        ]);
    }
}

