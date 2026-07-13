<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /*
    * GET /api/dashboard
    * Hal mengembalikan semua data yang dibutuhkan Dashboard dalam satu request.
    */
    public function index(Request $request)
    {
        $now        = Carbon::now();
        $thisMonth  = $now->copy()->startofMonth();
        $lastMonth  = $now->copy()->subMonth()->startofMonth();
        $lastMonthEnd = $now->copy()->subMonth()->startofMonth();

        // ── 4 StatCards ───────────────────────────────────────────
        $totalIncome   = (float) Sale::sum('total_revenue');
        $totalExpenses = (float) Purchase::sum('total_amount')
                       + (float) CashFlow::where('type', 'out')->sum('amount');
        $netProfit     = $totalIncome - $totalExpenses;

        // Saldo kas: semua cash-in dikurangi semua cash-out dari tabel cash_flows
        $cashBalance = (float) CashFlow::where('type', 'in')->sum('amount')
                     - (float) CashFlow::where('type', 'out')->sum('amount');

        // ── LineChart: kas masuk vs keluar per minggu, 7 minggu terakhir ──
        $weeks = [];
        for ($i = 6; $i >= 0; $i--) {
            $weekStart = $now->copy()->startOfWeek()->subWeeks($i);
            $weekEnd   = $weekStart->copy()->endOfWeek();
            $label     = $weekStart->format('d M');

            $inflow  = (float) CashFlow::whereBetween('date', [$weekStart, $weekEnd])
                ->where('type', 'in')->sum('amount');
            $outflow = (float) CashFlow::whereBetween('date', [$weekStart, $weekEnd])
                ->where('type', 'out')->sum('amount');

            $weeks[] = [
                'week'    => $label,
                'inflow'  => $inflow,
                'outflow' => $outflow,
            ];
        }

        // ── BarChart: top 5 produk terlaris (qty penjualan tertinggi) ──
        $top5 = Sale::select('inventory_id', DB::raw('SUM(quantity) as total_qty'))
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
                'total_income'    => $totalIncome,
                'total_expenses'  => $totalExpenses,
                'net_profit'      => $netProfit,
                'cash_balance'    => $cashBalance,
            ],
            'weekly_cashflow' => $weeks,
            'top5_products'   => $top5,
        ]);
    }
}
