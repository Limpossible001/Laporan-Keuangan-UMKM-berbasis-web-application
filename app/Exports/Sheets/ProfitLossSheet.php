<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProfitLossSheet implements FromArray, WithTitle, WithStyles, ShouldAutoSize
{
    public function __construct(private array $profitLoss) {}

    public function array(): array
    {
        return [
            ['Komponen', 'Jumlah (Rp)'],
            ['Total Pendapatan (Sales)',      $this->profitLoss['total_income']],
            ['HPP / COGS (Pembelian)',        -$this->profitLoss['cogs']],
            ['Biaya Operasional (Cash Out)',  -$this->profitLoss['operating_expenses']],
            ['Total Beban',                   -$this->profitLoss['total_expenses']],
            ['Laba / Rugi Bersih',             $this->profitLoss['net_profit']],
            ['Margin Laba (%)',                $this->profitLoss['profit_margin']],
        ];
    }

    public function title(): string
    {
        return 'Laba Rugi';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);
        $sheet->getStyle('A6:B6')->getFont()->setBold(true);
        return [];
    }
}
