<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'product_name', 'category', 'unit_price',
        'quantity', 'last_updated', 'notes'
    ];

    protected $casts = [
        'last_updated' => 'datetime',
    ];
}
