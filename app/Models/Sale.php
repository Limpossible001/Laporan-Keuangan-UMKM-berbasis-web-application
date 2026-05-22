<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'date', 'product_name', 'quantity',
        'unit_price', 'total_revenue', 'customer_notes'
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
