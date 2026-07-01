<?php

namespace App\Exports\Sheets;

use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SummarySheet implements FromArray, WithTitle, WithStyles, ShouldAutoSize
{
    public function __construct(
        private array $profitLoss,
        private array $cashFlow,
        private string $businessName,
        private Carbon $from,
        private Carbon $to,
    ) {}

    public function array(): array
    {
        return [
            [$this->businessName],
            ['Laporan Keuangan'],
            ['Periode: ' . $this->from->format('d M Y') . ' s/d ' . $this->to->format('d M Y')],
            ['Dicetak: ' . Carbon::now()->format('d M Y H:i')],
            [],
            ['RINGKASAN LABA RUGI'],
            ['Total Pendapatan',        $this->profitLoss['total_income']],
            ['HPP (Pembelian)',         $this->profitLoss['cogs']],
            ['Biaya Operasional',       $this->profitLoss['operating_expenses']],
            ['Total Beban',             $this->profitLoss['total_expenses']],
            ['Laba / Rugi Bersih',      $this->profitLoss['net_profit']],
            ['Margin Laba (%)',         $this->profitLoss['profit_margin']],
            [],
            ['RINGKASAN ARUS KAS'],
            ['Kas Masuk',  $this->cashFlow['inflow']],
            ['Kas Keluar', $this->cashFlow['outflow']],
            ['Arus Kas Bersih', $this->cashFlow['net']],
        ];
    }

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A6')->getFont()->setBold(true);
        $sheet->getStyle('A14')->getFont()->setBold(true);
        return [];
    }
}