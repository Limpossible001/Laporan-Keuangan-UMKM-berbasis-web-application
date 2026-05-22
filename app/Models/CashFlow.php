<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashFlow extends Model
{
    protected $fillable = [
        'date', 'type', 'description',
        'amount', 'category'
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
