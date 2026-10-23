<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    protected $fillable = [
        'user_id',
        'reference',
        'name',
        'company',
        'email',
        'phone',
        'message',
        'items',
        'estimated_total',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'estimated_total' => 'decimal:2',
    ];
}
