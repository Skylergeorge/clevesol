<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\CatalogSeeder;

test('catalog seeder refreshes branding and incontinence care', function () {
    $this->seed(CatalogSeeder::class);

    $branding = Category::query()->where('slug', 'promotional-branding-apparel')->first();
    $care = Category::query()->where('slug', 'health-care')->first();

    expect($branding)->not->toBeNull()
        ->and($branding->products()->count())->toBe(14)
        ->and($care)->not->toBeNull()
        ->and($care->name)->toBe('Incontinence Care')
        ->and($care->products()->count())->toBe(7)
        ->and(Product::query()->where('sku', 'CLV-PBA-TEE01')->value('badge'))->toBe('Full Front Print')
        ->and(Product::query()->where('sku', 'CLV-HC-TAB01')->value('name'))->toBe('Adult Tab Briefs')
        ->and(Product::query()->where('sku', 'CLV-HC-TAB01')->value('image_path'))->toBe('/images/products/health-care-adult-tab-briefs.jpg');

    Product::query()->where('sku', 'CLV-HC-TAB01')->update(['price' => 77.00]);

    $this->seed(CatalogSeeder::class);

    expect(Category::query()->where('slug', 'health-care')->count())->toBe(1)
        ->and($care->fresh()->name)->toBe('Incontinence Care')
        ->and(Product::query()->where('sku', 'CLV-HC-TAB01')->value('price'))->toEqual(28.50)
        ->and($branding->fresh()->products()->count())->toBe(14)
        ->and($care->fresh()->products()->count())->toBe(7);
});
