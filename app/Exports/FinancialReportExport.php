<?php

namespace App\Exports;

use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class FinancialReportExport implements WithMultipleSheets
{
    public function __construct(
        private array $profitLoss,
        private array $cashFlow,
        private array $category,
        private string $businessName,
        private Carbon $from,
        private Carbon $to,
    ) {}

    public function sheets(): array
    {
        return [
            'Ringkasan'        => new Sheets\SummarySheet($this->profitLoss, $this->cashFlow, $this->businessName, $this->from, $this->to),
            'Laba Rugi'        => new Sheets\ProfitLossSheet($this->profitLoss),
            'Arus Kas Detail'  => new Sheets\CashFlowSheet($this->cashFlow),
            'Kategori'         => new Sheets\CategorySheet($this->category),
        ];
    }
}