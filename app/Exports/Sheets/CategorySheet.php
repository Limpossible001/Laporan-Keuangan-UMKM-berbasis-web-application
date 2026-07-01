<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CategorySheet implements FromArray, WithTitle, WithStyles, ShouldAutoSize
{
    public function __construct(private array $category) {}

    public function array(): array
    {
        $rows = [['INCOME BY CATEGORY'], ['Kategori', 'Jumlah (Rp)']];
        foreach ($this->category['income'] as $cat => $amount) {
            $rows[] = [$cat, $amount];
        } 

        $rows[] = [];
        $rows[] = ['EXPENSE BY CATEGORY'];
        $rows[] = ['Kategori', 'Jumlah (Rp)'];
        foreach ($this->category['expense'] as $cat => $amount) {
            $rows[] = [$cat, $amount];
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Kategori';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1')->getFont()->setBold(true);
        return [];
    }
}