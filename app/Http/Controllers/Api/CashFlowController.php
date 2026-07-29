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

        // Tahap 3: entry yang otomatis tersinkron dari Input Pembelian /
        // Input Penjualan tidak boleh diedit langsung dari sini, supaya
        // Cash Flow Records & Ringkasan Arus Kas tidak "menyimpang" dari
        // data transaksi aslinya. Edit harus lewat halaman Pembelian/Penjualan.
        if ($cashFlow->source_type) {
            return response()->json([
                'message' => 'Entry ini dibuat otomatis dari ' . $this->sourceLabel($cashFlow->source_type)
                    . '. Silakan ubah datanya melalui halaman tersebut.',
            ], 422);
        }

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
        $cashFlow = CashFlow::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Tahap 3: sama seperti update — mencegah entry otomatis dihapus
        // sepihak dari Cash Flow Records tanpa menghapus transaksi aslinya,
        // agar rekap kas & laporan tetap konsisten.
        if ($cashFlow->source_type) {
            return response()->json([
                'message' => 'Entry ini dibuat otomatis dari ' . $this->sourceLabel($cashFlow->source_type)
                    . '. Hapus datanya melalui halaman tersebut agar rekap kas tetap konsisten.',
            ], 422);
        }

        $cashFlow->delete();

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

    private function sourceLabel(string $sourceType): string
    {
        return match ($sourceType) {
            'purchase' => 'Input Pembelian',
            'sale'     => 'Input Penjualan',
            default    => 'modul lain',
        };
    }
}