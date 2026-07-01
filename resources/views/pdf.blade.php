<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan</title>
    <style>
        * { font-family: 'Helvetica', Arial, sans-serif; }
        body { font-size: 12px; color: #111827; }
        .letterhead { border-bottom: 2px solid #4F46E5; padding-bottom: 10px; margin-bottom: 20px; }
        .letterhead h1 { font-size: 18px; margin: 0; color: #4F46E5; }
        .letterhead .sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .section-title {
            background: #f3f4f6; padding: 6px 10px; font-weight: bold;
            font-size: 12px; margin-top: 18px; margin-bottom: 8px; letter-spacing: .04em;
        }
        table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        th, td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 11px; }
        th { background: #f9fafb; font-weight: bold; }
        .text-right { text-align: right; }
        .total-row td { font-weight: bold; border-top: 2px solid #111827; }
        .positive { color: #16a34a; }
        .negative { color: #dc2626; }
        .footer { margin-top: 24px; font-size: 9px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>

    <div class="letterhead">
        <h1>{{ $businessName }}</h1>
        <div class="sub">Laporan Keuangan &mdash; Periode {{ $periodLabel }}</div>
        <div class="sub">Dicetak pada {{ $printedAt }}</div>
    </div>

    {{-- ============ LABA RUGI ============ --}}
    <div class="section-title">LAPORAN LABA RUGI (PROFIT &amp; LOSS)</div>
    <table>
        <tr><td>Total Pendapatan (Penjualan)</td><td class="text-right positive">Rp {{ number_format($profitLoss['total_income'], 0, ',', '.') }}</td></tr>
        <tr><td>HPP / Biaya Pembelian</td><td class="text-right negative">Rp ({{ number_format($profitLoss['cogs'], 0, ',', '.') }})</td></tr>
        <tr><td>Biaya Operasional</td><td class="text-right negative">Rp ({{ number_format($profitLoss['operating_expenses'], 0, ',', '.') }})</td></tr>
        <tr class="total-row">
            <td>Laba / Rugi Bersih ({{ $profitLoss['profit_margin'] }}% margin)</td>
            <td class="text-right {{ $profitLoss['net_profit'] >= 0 ? 'positive' : 'negative' }}">
                Rp {{ number_format($profitLoss['net_profit'], 0, ',', '.') }}
            </td>
        </tr>
    </table>

    {{-- ============ ARUS KAS ============ --}}
    <div class="section-title">LAPORAN ARUS KAS (CASH FLOW)</div>
    <table>
        <tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th class="text-right">Masuk</th><th class="text-right">Keluar</th></tr>
        @forelse ($cashFlow['details'] as $row)
            <tr>
                <td>{{ $row['date'] }}</td>
                <td>{{ $row['description'] }}</td>
                <td>{{ $row['category'] }}</td>
                <td class="text-right">{{ $row['inflow'] ? 'Rp ' . number_format($row['inflow'], 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ $row['outflow'] ? 'Rp ' . number_format($row['outflow'], 0, ',', '.') : '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="5" style="text-align:center; color:#9ca3af;">Tidak ada transaksi pada periode ini.</td></tr>
        @endforelse
        <tr class="total-row">
            <td colspan="3">Total</td>
            <td class="text-right">Rp {{ number_format($cashFlow['inflow'], 0, ',', '.') }}</td>
            <td class="text-right">Rp {{ number_format($cashFlow['outflow'], 0, ',', '.') }}</td>
        </tr>
    </table>

    {{-- ============ KATEGORI ============ --}}
    <div class="section-title">ANALISIS KATEGORI</div>
    <table>
        <tr><th>Income by Category</th><th class="text-right">Jumlah</th></tr>
        @forelse ($category['income'] as $cat => $amount)
            <tr><td>{{ $cat }}</td><td class="text-right">Rp {{ number_format($amount, 0, ',', '.') }}</td></tr>
        @empty
            <tr><td colspan="2" style="text-align:center; color:#9ca3af;">Tidak ada data.</td></tr>
        @endforelse
    </table>
    <table>
        <tr><th>Expense by Category</th><th class="text-right">Jumlah</th></tr>
        @forelse ($category['expense'] as $cat => $amount)
            <tr><td>{{ $cat }}</td><td class="text-right">Rp {{ number_format($amount, 0, ',', '.') }}</td></tr>
        @empty
            <tr><td colspan="2" style="text-align:center; color:#9ca3af;">Tidak ada data.</td></tr>
        @endforelse
    </table>

    <div class="footer">Laporan Keuangan UMKM &middot; dibuat otomatis oleh sistem</div>

</body>
</html>
