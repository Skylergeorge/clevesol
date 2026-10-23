<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorefrontMessage extends Model
{
    protected $fillable = [
        'storefront_chat_id',
        'sender',
        'user_id',
        'body',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(StorefrontChat::class, 'storefront_chat_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
