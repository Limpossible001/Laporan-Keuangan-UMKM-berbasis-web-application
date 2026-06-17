<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'name', 'contact_person', 'phone', 'address', 'notes'
    ];

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
