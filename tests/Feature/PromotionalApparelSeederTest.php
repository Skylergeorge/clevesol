<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\CatalogSeeder;

test('catalog seeder adds branding and health care once', function () {
    $this->seed(CatalogSeeder::class);

    $branding = Category::query()->where('slug', 'promotional-branding-apparel')->first();
    $care = Category::query()->where('slug', 'health-care')->first();

    expect($branding)->not->toBeNull()
        ->and($branding->products()->count())->toBe(10)
        ->and($care)->not->toBeNull()
        ->and($care->products()->count())->toBe(7)
        ->and(Product::query()->where('sku', 'CLV-PBA-TEE01')->value('image_path'))->toBe('/images/products/promotional-branding-apparel-harborline-event-tee.jpg')
        ->and(Product::query()->where('sku', 'CLV-HC-TAB01')->value('image_path'))->toBe('/images/products/health-care-tidehold-tab-briefs.jpg');

    $branding->update(['tagline' => 'Kept by an admin']);
    Product::query()->where('sku', 'CLV-PBA-TEE01')->update(['price' => 99.00]);
    Product::query()->where('sku', 'CLV-HC-TAB01')->update(['price' => 77.00]);

    $this->seed(CatalogSeeder::class);

    expect(Category::query()->where('slug', 'promotional-branding-apparel')->count())->toBe(1)
        ->and(Category::query()->where('slug', 'health-care')->count())->toBe(1)
        ->and($branding->fresh()->tagline)->toBe('Kept by an admin')
        ->and(Product::query()->where('sku', 'CLV-PBA-TEE01')->value('price'))->toEqual(99.00)
        ->and(Product::query()->where('sku', 'CLV-HC-TAB01')->value('price'))->toEqual(77.00)
        ->and($branding->products()->count())->toBe(10)
        ->and($care->products()->count())->toBe(7);
});
