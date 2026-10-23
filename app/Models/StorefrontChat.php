<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StorefrontChat extends Model
{
    protected $fillable = [
        'token',
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'status',
        'staff_unread',
        'staff_unread_count',
        'visitor_unread',
        'last_message_at',
        'visitor_typing_at',
        'staff_typing_at',
    ];

    protected $casts = [
        'staff_unread' => 'boolean',
        'staff_unread_count' => 'integer',
        'visitor_unread' => 'boolean',
        'last_message_at' => 'datetime',
        'visitor_typing_at' => 'datetime',
        'staff_typing_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(StorefrontMessage::class)->orderBy('id');
    }
}
