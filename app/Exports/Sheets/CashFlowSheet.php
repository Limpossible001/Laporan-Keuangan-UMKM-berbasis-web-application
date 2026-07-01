<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CashFlowSheet implements FromArray, WithTitle, WithStyles, ShouldAutoSize
{
    public function __construct(private array $cashFlow) {}

    public function array(): array
    {
        $header = [['Tanggal', 'Deskripsi', 'Kategori', 'Kas Masuk', 'Kas Keluar']];

        $rows = array_map(fn ($r) => [
            $r['date'], $r['description'], $r['category'], $r['inflow'], $r['outflow'],
        ], $this->cashFlow['details']);

        $footer = [
            [],
            ['', '', 'Total', $this->cashFlow['inflow'], $this->cashFlow['outflow']],
            ['', '', 'Arus Kas Bersih', $this->cashFlow['net'], ''],
        ];

        return array_merge($header, $rows, $footer);
    }

    public function title(): string
    {
        return 'Arus Kas Detail';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);
        return [];
    }
}