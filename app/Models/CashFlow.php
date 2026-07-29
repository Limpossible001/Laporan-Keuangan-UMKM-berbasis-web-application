<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashFlow extends Model
{
    protected $fillable = [
        'user_id', 'date', 'type', 'description',
        'amount', 'category', 'source_type', 'source_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    // Tahap 3: sertakan flag is_auto di setiap response JSON supaya FE
    // (CashFlowPage) bisa menampilkan badge "Otomatis" dan tahu entry mana
    // yang tidak boleh diedit/dihapus langsung dari Cash Flow Records.
    protected $appends = ['is_auto'];

    // Nilai source_type yang valid untuk entry otomatis dari modul lain.
    public const SOURCE_PURCHASE = 'purchase';
    public const SOURCE_SALE     = 'sale';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getIsAutoAttribute(): bool
    {
        return !is_null($this->source_type);
    }

    /** Hanya entry yang otomatis tersinkron dari Purchase/Sale */
    public function scopeAutoLinked($query)
    {
        return $query->whereIn('source_type', [self::SOURCE_PURCHASE, self::SOURCE_SALE]);
    }

    /** Hanya entry manual (dibuat langsung dari form Cash Flow) */
    public function scopeManualOnly($query)
    {
        return $query->whereNull('source_type');
    }
}