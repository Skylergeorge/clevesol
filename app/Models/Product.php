<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'subtitle',
        'sku',
        'brand',
        'description',
        'features',
        'certifications',
        'sizes',
        'badge',
        'price',
        'compare_price',
        'rating',
        'reviews_count',
        'stock',
        'image_path',
        'gallery',
        'is_featured',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'certifications' => 'array',
        'sizes' => 'array',
        'gallery' => 'array',
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'rating' => 'decimal:2',
        'reviews_count' => 'integer',
        'stock' => 'integer',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
