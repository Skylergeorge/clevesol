<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Throwable;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'payload',
    ];

    public static function decrypted(string $key): ?string
    {
        $row = static::query()->where('key', $key)->first();
        if (! $row) {
            return null;
        }

        try {
            $value = Crypt::decryptString($row->payload);
        } catch (Throwable) {
            return null;
        }

        return $value === '' ? null : $value;
    }

    public static function putEncrypted(string $key, string $value): void
    {
        static::query()->updateOrCreate(
            ['key' => $key],
            ['payload' => Crypt::encryptString($value)],
        );
    }

    public static function forget(string $key): void
    {
        static::query()->where('key', $key)->delete();
    }
}
