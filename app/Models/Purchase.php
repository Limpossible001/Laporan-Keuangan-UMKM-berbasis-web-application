<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'date', 'supplier_name', 'item_name',
        'quantity', 'unit_price', 'total_amount', 'description'
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
