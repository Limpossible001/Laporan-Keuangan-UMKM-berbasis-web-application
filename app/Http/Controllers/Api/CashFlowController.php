<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use Illuminate\Http\Request;

class CashFlowController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            CashFlow::where('user_id', $request->user()->id)->orderBy('date', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'        => 'required|date',
            'type'        => 'required|in:in,out',
            'description' => 'required|string',
            'amount'      => 'required|numeric|min:1',
            'category'    => 'required|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $cashFlow = CashFlow::create($validated);
        return response()->json($cashFlow, 201);
    }

    public function update(Request $request, $id)
    {
        $cashFlow = CashFlow::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'date'        => 'required|date',
            'type'        => 'required|in:in,out',
            'description' => 'required|string',
            'amount'      => 'required|numeric|min:1',
            'category'    => 'required|string',
        ]);

        $cashFlow->update($validated);
        return response()->json($cashFlow);
    }

    public function destroy(Request $request, $id)
    {
        CashFlow::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail()
            ->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    public function summary(Request $request)
    {
        $userId = $request->user()->id;

        $cashIn  = CashFlow::where('user_id', $userId)->where('type', 'in')->sum('amount');
        $cashOut = CashFlow::where('user_id', $userId)->where('type', 'out')->sum('amount');

        return response()->json([
            'cash_in'       => $cashIn,
            'cash_out'      => $cashOut,
            'net_cash_flow' => $cashIn - $cashOut,
        ]);
    }
}