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
        'payment_status',
        'payment_method',
        'amount_paid_cents',
        'stripe_checkout_session_id',
        'stripe_payment_intent_id',
        'paid_at',
    ];

    protected $hidden = [
        'stripe_checkout_session_id',
        'stripe_payment_intent_id',
    ];

    protected $casts = [
        'items' => 'array',
        'estimated_total' => 'decimal:2',
        'paid_at' => 'datetime',
    ];
}
