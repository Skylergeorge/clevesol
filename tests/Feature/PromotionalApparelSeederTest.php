<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\CatalogSeeder;

test('catalog seeder refreshes branding and skips existing health care', function () {
    $this->seed(CatalogSeeder::class);

    $branding = Category::query()->where('slug', 'promotional-branding-apparel')->first();
    $care = Category::query()->where('slug', 'health-care')->first();

    expect($branding)->not->toBeNull()
        ->and($branding->tagline)->toBe('Make your brand unforgettable.')
        ->and($branding->products()->count())->toBe(14)
        ->and($care)->not->toBeNull()
        ->and($care->products()->count())->toBe(7)
        ->and(Product::query()->where('sku', 'CLV-PBA-TEE01')->value('badge'))->toBe('Event Run')
        ->and(Product::query()->where('sku', 'CLV-PBA-MUG01')->value('image_path'))->toBe('/images/products/promotional-branding-apparel-ember-camp-mug.jpg');

    $care->update(['tagline' => 'Kept by an admin']);
    Product::query()->where('sku', 'CLV-HC-TAB01')->update(['price' => 77.00]);
    Product::query()->where('sku', 'CLV-PBA-TEE01')->update(['price' => 18.00]);

    $this->seed(CatalogSeeder::class);

    expect(Category::query()->where('slug', 'promotional-branding-apparel')->count())->toBe(1)
        ->and($care->fresh()->tagline)->toBe('Kept by an admin')
        ->and(Product::query()->where('sku', 'CLV-HC-TAB01')->value('price'))->toEqual(77.00)
        ->and(Product::query()->where('sku', 'CLV-PBA-TEE01')->value('badge'))->toBe('Event Run')
        ->and($branding->fresh()->products()->count())->toBe(14);
});
