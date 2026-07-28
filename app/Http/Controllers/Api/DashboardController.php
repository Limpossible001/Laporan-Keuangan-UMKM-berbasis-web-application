<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /*
    * GET /api/dashboard
    * Mengembalikan semua data yang dibutuhkan Dashboard, khusus untuk
    * user yang sedang login (FIX: sebelumnya semua Sale/Purchase/CashFlow
    * di-sum tanpa filter user_id, jadi semua akun melihat angka yang sama).
    */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $now    = Carbon::now();

        // ── 4 StatCards ───────────────────────────────────────────
        $totalIncome   = (float) Sale::where('user_id', $userId)->sum('total_revenue');
        $totalExpenses = (float) Purchase::where('user_id', $userId)->sum('total_amount')
                       + (float) CashFlow::where('user_id', $userId)->where('type', 'out')->sum('amount');
        $netProfit     = $totalIncome - $totalExpenses;

        $cashBalance = (float) CashFlow::where('user_id', $userId)->where('type', 'in')->sum('amount')
                     - (float) CashFlow::where('user_id', $userId)->where('type', 'out')->sum('amount');

        // ── LineChart: kas masuk vs keluar per minggu, 7 minggu terakhir ──
        $weeks = [];
        for ($i = 6; $i >= 0; $i--) {
            $weekStart = $now->copy()->startOfWeek()->subWeeks($i);
            $weekEnd   = $weekStart->copy()->endOfWeek();
            $label     = $weekStart->format('d M');

            $inflow  = (float) CashFlow::where('user_id', $userId)
                ->whereBetween('date', [$weekStart, $weekEnd])
                ->where('type', 'in')->sum('amount');
            $outflow = (float) CashFlow::where('user_id', $userId)
                ->whereBetween('date', [$weekStart, $weekEnd])
                ->where('type', 'out')->sum('amount');

            $weeks[] = [
                'week'    => $label,
                'inflow'  => $inflow,
                'outflow' => $outflow,
            ];
        }

        // ── BarChart: top 5 produk terlaris (qty penjualan tertinggi) ──
        $top5 = Sale::where('user_id', $userId)
            ->select('inventory_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('inventory_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->with('inventory:id,product_name')
            ->get()
            ->map(fn ($r) => [
                'product' => $r->inventory?->product_name ?? 'Unknown',
                'qty'     => (int) $r->total_qty,
            ]);

        return response()->json([
            'stats' => [
                'total_income'   => $totalIncome,
                'total_expenses' => $totalExpenses,
                'net_profit'     => $netProfit,
                'cash_balance'   => $cashBalance,
            ],
            'weekly_cashflow' => $weeks,
            'top5_products'   => $top5,
        ]);
    }
}