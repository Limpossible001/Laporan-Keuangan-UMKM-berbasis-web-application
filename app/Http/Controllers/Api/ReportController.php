<?php

namespace App\Http\Controllers\Api;

use App\Exports\FinancialReportExport;
use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Purchase;
use App\Models\Sale;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Resolve rentang tanggal dari query string ?from=&to=
     * Default: awal bulan ini s/d hari ini, kalau tidak diisi.
     */
    private function resolveRange(Request $request): array
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : Carbon::now()->startOfMonth();

        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : Carbon::now()->endOfDay();

        return [$from, $to];
    }

    /**
     * Input 3: Validasi range untuk load laporan(max 92 hari = 1 kuarter).
     */
    private function validateLoadRange(Carbon $from, Carbon $to): ?array
    {
        if ($from->greaterThan($to)) {
            return ['message' => 'Tanggal awal tidak boleh lebih besar dari tanggal akhir.'];
        }
        if ($from->diffInDays($to) > 92) {
            return ['message' => 'Rentang laporan maksimal 92 hari (1 kuarter) per pembuatan laporan.'];
        }
        return null;
    }

    /**
     * Input 3: Validasi range untuk export(max 31 hari).
     */
    private function validateExportRange(Carbon $from, Carbon $to): ?array
    {
        if ($from->greaterThan($to)) {
            return ['message' => 'Tanggal awal tidak boleh lebih besar dari tanggal akhir.'];
        }
        if ($from->diffInDays($to) > 31) {
            return ['message' => 'Rentang ekspor maksimal 31 hari per ekspor.'];
        }
        return null;
    }

    /**
     * Hitung Laba Rugi: Income (Sales) - COGS (Purchases) - OpEx (CashFlow keluar)
     */
    public function buildProfitLoss(Carbon $from, Carbon $to): array
    {
        $totalIncome = (float) Sale::whereBetween('date', [$from, $to])->sum('total_revenue');
        $cogs        = (float) Purchase::whereBetween('date', [$from, $to])->sum('total_amount');
        $opEx        = (float) CashFlow::whereBetween('date', [$from, $to])->where('type', 'out')->sum('amount');

        $totalExpenses = $cogs + $opEx;
        $netProfit     = $totalIncome - $totalExpenses;
        $margin        = $totalIncome > 0 ? round(($netProfit / $totalIncome) * 100, 2) : 0;

        return [
            'total_income'   => $totalIncome,
            'cogs'           => $cogs,
            'operating_expenses' => $opEx,
            'total_expenses' => $totalExpenses,
            'net_profit'     => $netProfit,
            'profit_margin'  => $margin,
        ];
    }

    /**
     * Detail Arus Kas (murni dari tabel cash_flows, sesuai UI ReportCashFlow yang sudah ada)
     */
    public function buildCashFlow(Carbon $from, Carbon $to): array
    {
        $rows = CashFlow::whereBetween('date', [$from, $to])->orderBy('date')->get();

        $inflow  = (float) $rows->where('type', 'in')->sum('amount');
        $outflow = (float) $rows->where('type', 'out')->sum('amount');

        return [
            'inflow'  => $inflow,
            'outflow' => $outflow,
            'net'     => $inflow - $outflow,
            'count'   => $rows->count(),
            'details' => $rows->map(fn ($r) => [
                'date'        => $r->date->format('Y-m-d'),
                'description' => $r->description,
                'category'    => $r->category,
                'inflow'      => $r->type === 'in' ? (float) $r->amount : 0,
                'outflow'     => $r->type === 'out' ? (float) $r->amount : 0,
            ])->values()->toArray(), // Fix Bug#2: toArray() agar CashFlowSheet tidak dapat Collection
        ];
    }

    /**
     * Analisis Kategori: income & expense dikelompokkan per category (dari cash_flows)
     */
    public function buildCategory(Carbon $from, Carbon $to): array
    {
        $rows = CashFlow::whereBetween('date', [$from, $to])->get();

        $income  = $rows->where('type', 'in')->groupBy('category')
            ->map(fn ($g) => (float) $g->sum('amount'));
        $expense = $rows->where('type', 'out')->groupBy('category')
            ->map(fn ($g) => (float) $g->sum('amount'));

        return [
            'income'  => $income,
            'expense' => $expense,
        ];
    }

    /** GET /api/reports/profit-loss */
    public function profitLoss(Request $request)
    {
        [$from, $to] = $this->resolveRange($request);
        if ($err = $this->validateLoadRange($from, $to)) {
            return response()->json($err, 422);
        }
        return response()->json($this->buildProfitLoss($from, $to) + [
            'from' => $from->toDateString(), 'to' => $to->toDateString(),
        ]);
    }

    /** GET /api/reports/cash-flow */
    public function cashFlow(Request $request)
    {
        [$from, $to] = $this->resolveRange($request);
        if ($err = $this->validateLoadRange($from, $to)) {
            return response()->json($err, 422);
        }
        return response()->json($this->buildCashFlow($from, $to) + [
            'from' => $from->toDateString(), 'to' => $to->toDateString(),
        ]);
    }

    /** GET /api/reports/category */
    public function category(Request $request)
    {
        [$from, $to] = $this->resolveRange($request);
        if ($err = $this->validateLoadRange($from, $to)) {
            return response()->json($err, 422);
        }
        return response()->json($this->buildCategory($from, $to) + [
            'from' => $from->toDateString(), 'to' => $to->toDateString(),
        ]);
    }

    /** GET /api/reports/export/pdf */
    public function exportPdf(Request $request)
    {
        [$from, $to] = $this->resolveRange($request);
        if ($err = $this->validateExportRange($from, $to)) {
            return response()->json($err, 422);
        }

        $data = [
            'businessName' => $request->user()->business_name ?: $request->user()->name,
            'periodLabel'  => $from->translatedFormat('d M Y') . ' – ' . $to->translatedFormat('d M Y'),
            'printedAt'    => Carbon::now()->translatedFormat('d M Y, H:i'),
            'profitLoss'   => $this->buildProfitLoss($from, $to),
            'cashFlow'     => $this->buildCashFlow($from, $to),
            'category'     => $this->buildCategory($from, $to),
        ];

        $pdf = Pdf::loadView('reports.pdf', $data)->setPaper('a4', 'portrait');
        $filename = 'Laporan-Keuangan-' . $from->format('Ymd') . '-' . $to->format('Ymd') . '.pdf';
        return $pdf->download($filename);
    }

    /** GET /api/reports/export/excel */
    public function exportExcel(Request $request)
    {
        [$from, $to] = $this->resolveRange($request);
        if ($err = $this->validateExportRange($from, $to)) {
            return response()->json($err, 422);
        }

        $businessName = $request->user()->business_name ?: $request->user()->name;
        $filename = 'Laporan-Keuangan-' . $from->format('Ymd') . '-' . $to->format('Ymd') . '.xlsx';

        return Excel::download(
            new FinancialReportExport(
                $this->buildProfitLoss($from, $to),
                $this->buildCashFlow($from, $to),
                $this->buildCategory($from, $to),
                $businessName,
                $from,
                $to
            ),
            $filename
        );
    }
}