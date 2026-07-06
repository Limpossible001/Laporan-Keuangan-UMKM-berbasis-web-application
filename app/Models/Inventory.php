<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    protected $fillable = [
        'item_id', 'product_name', 'category', 'unit_price',
        'quantity', 'last_updated', 'notes'
    ];

    protected $casts = [
        'last_updated' => 'datetime',
        'quantity'     => 'integer', //Notes Kak Rayhan: INT, bukan decimal
        'unit_price'   => 'float',
    ];

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}