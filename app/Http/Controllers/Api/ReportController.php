<?php

namespace App\Http\Controllers\Api;

use App\Exports\FinancialReportExport;
use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Inventory;
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
     * Input 3: Validasi range untuk load laporan (max 92 hari = 1 kuarter).
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
     * Input 3: Validasi range untuk export (max 31 hari).
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
     * Tahap 4: hitung "Potential Income (Nilai Inventory)" — estimasi nilai
     * jual dari SELURUH stok inventory user SAAT INI (quantity × unit_price).
     *
     * Ini murni angka informasional untuk meyakinkan pemilik usaha bahwa
     * barang yang masih ada di gudang punya potensi pendapatan sekian —
     * BUKAN pendapatan riil, sehingga SENGAJA TIDAK diikutkan ke perhitungan
     * total_income / total_expenses / net_profit di bawah. Juga sengaja
     * tidak difilter by tanggal (from/to) karena ini snapshot stok "saat
     * laporan dibuka", bukan transaksi dalam periode tertentu.
     */
    private function calcPotentialIncome(int $userId): float
    {
        return (float) (Inventory::where('user_id', $userId)
            ->selectRaw('COALESCE(SUM(quantity * unit_price), 0) as total')
            ->value('total') ?? 0);
    }

    /**
     * Hitung Laba Rugi: Income (Sales) - COGS (Purchases) - OpEx (CashFlow keluar)
     * FIX: tambah parameter $userId — sebelumnya laporan siapa pun menghitung
     * SEMUA transaksi di database, bukan cuma milik user yang login.
     *
     * Tahap 3: sejak Input Pembelian otomatis membuat entry Cash Flow
     * (Kas Keluar, Category Pembelian) supaya tampil di CashFlowPage,
     * OpEx di sini WAJIB mengecualikan entry yang source_type-nya 'purchase'.
     * Kalau tidak, nilai pembelian akan terhitung DUA KALI: sekali lewat
     * $cogs (dari tabel purchases) dan sekali lagi lewat $opEx (dari
     * cash_flows) — sehingga Net Profit jadi salah (lebih rendah dari
     * seharusnya).
     *
     * Tahap 4: tambah 'potential_income' persis setelah 'total_income' —
     * lihat calcPotentialIncome() di atas untuk detail & alasan kenapa
     * angka ini TIDAK ikut memengaruhi total_expenses / net_profit.
     */
    public function buildProfitLoss(int $userId, Carbon $from, Carbon $to): array
    {
        $totalIncome = (float) Sale::where('user_id', $userId)
            ->whereBetween('date', [$from, $to])->sum('total_revenue');
        $potentialIncome = $this->calcPotentialIncome($userId);
        $cogs        = (float) Purchase::where('user_id', $userId)
            ->whereBetween('date', [$from, $to])->sum('total_amount');
        $opEx        = (float) CashFlow::where('user_id', $userId)
            ->whereBetween('date', [$from, $to])
            ->where('type', 'out')
            // Tahap 3: kecualikan entry otomatis dari Pembelian — sudah
            // terhitung lewat $cogs di atas, jangan dihitung dua kali di sini.
            ->where(function ($q) {
                $q->whereNull('source_type')
                  ->orWhere('source_type', '!=', CashFlow::SOURCE_PURCHASE);
            })
            ->sum('amount');

        $totalExpenses = $cogs + $opEx;
        $netProfit     = $totalIncome - $totalExpenses;
        $margin        = $totalIncome > 0 ? round(($netProfit / $totalIncome) * 100, 2) : 0;

        return [
            'total_income'        => $totalIncome,
            // Tahap 4: NEW — persis setelah total_income, sesuai permintaan.
            'potential_income'    => $potentialIncome,
            'cogs'                => $cogs,
            'operating_expenses'  => $opEx,
            'total_expenses'      => $totalExpenses,
            'net_profit'          => $netProfit,
            'profit_margin'       => $margin,
        ];
    }

    /**
     * Detail Arus Kas (murni dari tabel cash_flows, sesuai UI ReportCashFlow yang sudah ada)
     *
     * Tahap 3: TIDAK perlu filter source_type di sini — Ringkasan Arus Kas
     * memang harus menampilkan SEMUA kas masuk & keluar, termasuk yang
     * otomatis berasal dari Input Pembelian (Kas Keluar) & Input Penjualan
     * (Kas Masuk). Filter source_type hanya relevan di buildProfitLoss()
     * untuk menghindari double counting COGS.
     */
    public function buildCashFlow(int $userId, Carbon $from, Carbon $to): array
    {
        $rows = CashFlow::where('user_id', $userId)
            ->whereBetween('date', [$from, $to])->orderBy('date')->get();

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
            ])->values()->toArray(),
        ];
    }

    /**
     * Analisis Kategori: income & expense dikelompokkan per category (dari cash_flows)
     */
    public function buildCategory(int $userId, Carbon $from, Carbon $to): array
    {
        $rows = CashFlow::where('user_id', $userId)->whereBetween('date', [$from, $to])->get();

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
        return response()->json($this->buildProfitLoss($request->user()->id, $from, $to) + [
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
        return response()->json($this->buildCashFlow($request->user()->id, $from, $to) + [
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
        return response()->json($this->buildCategory($request->user()->id, $from, $to) + [
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

        $userId = $request->user()->id;

        $data = [
            'businessName' => $request->user()->business_name ?: $request->user()->name,
            'periodLabel'  => $from->translatedFormat('d M Y') . ' – ' . $to->translatedFormat('d M Y'),
            'printedAt'    => Carbon::now()->translatedFormat('d M Y'),
            'profitLoss'   => $this->buildProfitLoss($userId, $from, $to),
            'cashFlow'     => $this->buildCashFlow($userId, $from, $to),
            'category'     => $this->buildCategory($userId, $from, $to),
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

        $userId       = $request->user()->id;
        $businessName = $request->user()->business_name ?: $request->user()->name;
        $filename     = 'Laporan-Keuangan-' . $from->format('Ymd') . '-' . $to->format('Ymd') . '.xlsx';

        return Excel::download(
            new FinancialReportExport(
                $this->buildProfitLoss($userId, $from, $to),
                $this->buildCashFlow($userId, $from, $to),
                $this->buildCategory($userId, $from, $to),
                $businessName,
                $from,
                $to
            ),
            $filename
        );
    }
}