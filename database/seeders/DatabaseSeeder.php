<?php

namespace Database\Seeders;

use App\Models\CashFlow;
use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Note 3: semua data dummy pakai Faker id_ID agar terasa kontekstual Indonesia
        $faker = \Faker\Factory::create('id_ID');

        // ── Users ─────────────────────────────────────────────
        User::factory()->create([
            'name'          => 'Test User',
            'business_name' => 'UMKM Test Mandiri',
            'email'         => 'test@example.com',
            'password'      => Hash::make('password'),
        ]);

        // Akun demo (dipakai tombol "Try Demo Account" di LoginPage)
        $demoUser = User::factory()->create([
            'name'          => 'Demo User',
            'business_name' => 'UMKM Demo Sejahtera',
            'email'         => 'demo@umkm.id',
            'password'      => Hash::make('password'),
        ]);

        // ── Suppliers (5 contoh realistis Indonesia) ──────────
        $supplierNames = [
            ['name' => 'PT Hosana Mulai Perkaka',    'cp' => 'Daniel Santoso',  'phone' => '+6281234567890', 'city' => 'Jakarta'],
            ['name' => 'CV Mantap Makmur',           'cp' => 'Siti Ayundai',   'phone' => '+6285678901234', 'city' => 'Surabaya'],
            ['name' => 'UD Sumber Hikmat',           'cp' => 'Agus Imortaliti', 'phone' => '+6282345678901', 'city' => 'Bandung'],
            ['name' => 'Toko Grosir GreatNusas',      'cp' => 'Dewi Percik',  'phone' => '+6287890123456', 'city' => 'Semarang'],
            ['name' => 'PT Cahaya S L',    'cp' => 'Rudi Gober ',  'phone' => '+6289012345678', 'city' => 'Medan'],
        ];

        $suppliers = [];
        foreach ($supplierNames as $s) {
            $suppliers[] = Supplier::create([
                'name'           => $s['name'],
                'contact_person' => $s['cp'],
                'phone'          => $s['phone'],
                'address'        => 'Jl. ' . $faker->streetName() . ' No. ' . $faker->buildingNumber() . ', ' . $s['city'],
                'notes'          => 'Supplier terpercaya sejak ' . $faker->year(max: 2020),
            ]);
        }

        // ── Inventory (8 produk UMKM khas Indonesia) ──────────
        $products = [
            ['product_name' => 'Batik Tulis Solo', 'category' => 'Pakaian',  'unit_price' => 185000, 'quantity' => 50],
            ['product_name' => 'Keripik Tempe',    'category' => 'Makanan',  'unit_price' => 15000,  'quantity' => 200],
            ['product_name' => 'Kopi Arabika Gayo','category' => 'Minuman',  'unit_price' => 75000,  'quantity' => 80],
            ['product_name' => 'Tas Rotan',        'category' => 'Kerajinan','unit_price' => 120000, 'quantity' => 30],
            ['product_name' => 'Sambal Terasi',    'category' => 'Makanan',  'unit_price' => 22000,  'quantity' => 150],
            ['product_name' => 'Minyak Goreng 1L', 'category' => 'Bahan Baku','unit_price'=> 16500,  'quantity' => 100],
            ['product_name' => 'Gula Merah 500g',  'category' => 'Bahan Baku','unit_price'=> 12000,  'quantity' => 120],
            ['product_name' => 'Tempe 200g',       'category' => 'Makanan',  'unit_price' => 5000,   'quantity' => 8],  // low-stock demo
        ];

        $inventoryItems = [];
        foreach ($products as $p) {
            $inventoryItems[] = Inventory::create(array_merge($p, ['last_updated' => now()]));
        }

        // ── Purchases (10 transaksi pembelian) ────────────────
        for ($i = 0; $i < 10; $i++) {
            $inv = $faker->randomElement($inventoryItems);
            $sup = $faker->randomElement($suppliers);
            $qty = $faker->numberBetween(5, 30);
            $price = $inv->unit_price;
            Purchase::create([
                'date'         => $faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
                'supplier_id'  => $sup->id,
                'inventory_id' => $inv->id,
                'quantity'     => $qty,
                'unit_price'   => $price,
                'total_amount' => $qty * $price,
                'description'  => 'Pembelian stok ' . $inv->product_name,
            ]);
        }

        // ── Sales (15 transaksi penjualan) ────────────────────
        $customers = ['Toko Berkah', 'Pelanggan Umum', 'Warung Bu Sari', 'Restoran Nusantara', 'Minimarket Maju'];
        for ($i = 0; $i < 15; $i++) {
            $inv = $faker->randomElement($inventoryItems);
            $qty = $faker->numberBetween(1, 5);
            $price = (int) ($inv->unit_price * $faker->randomFloat(2, 1.1, 1.5)); // markup 10-50%
            Sale::create([
                'date'           => $faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
                'inventory_id'   => $inv->id,
                'quantity'       => $qty,
                'unit_price'     => $price,
                'total_revenue'  => $qty * $price,
                'customer_notes' => $faker->randomElement($customers),
            ]);
        }

        // ── Cash Flows (20 transaksi arus kas) ────────────────
        $inCategories  = ['Pendapatan Penjualan', 'Penerimaan Piutang', 'Pendapatan Lain-lain'];
        $outCategories = ['Biaya Operasional', 'Gaji Karyawan', 'Sewa Tempat', 'Listrik & Air', 'Transportasi'];

        for ($i = 0; $i < 20; $i++) {
            $isIn = $faker->boolean(55); // 55% pemasukan, 45% pengeluaran
            CashFlow::create([
                'date'        => $faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
                'type'        => $isIn ? 'in' : 'out',
                'amount'      => $faker->numberBetween(50000, 5000000),
                'category'    => $isIn
                    ? $faker->randomElement($inCategories)
                    : $faker->randomElement($outCategories),
                'description' => $faker->sentence(5),
            ]);
        }
    }
}