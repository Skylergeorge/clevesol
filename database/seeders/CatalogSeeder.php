<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->catalog() as $index => $cat) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'tagline' => $cat['tagline'],
                    'description' => $cat['description'],
                    'icon' => $cat['icon'],
                    'accent' => $cat['accent'],
                    'sort_order' => $index,
                    'is_published' => true,
                ]
            );

            foreach ($cat['products'] as $pIndex => $p) {
                $slug = Str::slug($cat['name'].'-'.$p['name']);
                $imageFile = public_path("images/products/{$slug}.jpg");

                Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'image_path' => file_exists($imageFile) ? "/images/products/{$slug}.jpg" : null,
                        'name' => $p['name'],
                        'subtitle' => $p['subtitle'] ?? null,
                        'sku' => 'CLV-'.strtoupper(Str::random(6)),
                        'brand' => $p['brand'] ?? 'Clevesol',
                        'description' => $p['description'] ?? $this->fallbackDescription($p['name'], $cat['name']),
                        'features' => $p['features'] ?? $this->fallbackFeatures(),
                        'certifications' => $p['certifications'] ?? ['CE', 'ANSI', 'EN', 'ISO'],
                        'sizes' => $p['sizes'] ?? null,
                        'badge' => $p['badge'] ?? null,
                        'price' => $p['price'],
                        'compare_price' => $p['compare_price'] ?? null,
                        'rating' => $p['rating'] ?? round(mt_rand(455, 499) / 100, 2),
                        'reviews_count' => $p['reviews'] ?? mt_rand(12, 340),
                        'stock' => mt_rand(40, 500),
                        'is_featured' => $p['featured'] ?? false,
                        'is_published' => true,
                        'sort_order' => $pIndex,
                    ]
                );
            }
        }
    }

    private function fallbackDescription(string $name, string $category): string
    {
        return "Professional-grade {$name} from the Clevesol {$category} range. "
            ."Sourced from trusted manufacturers and compliant with international safety standards "
            ."including ISO, CE, ANSI and EN. Built for demanding industrial environments.";
    }

    private function fallbackFeatures(): array
    {
        return [
            'Certified to international safety standards',
            'Durable, industrial-grade construction',
            'Comfortable for extended wear',
            'Bulk & corporate pricing available',
        ];
    }

    private function catalog(): array
    {
        return [
            [
                'name' => 'Head Protection',
                'tagline' => 'Helmets & hard hats built to take the hit',
                'description' => 'Industrial helmets and hard hats engineered to protect against impact, falling objects and electrical hazards across construction, welding and emergency response.',
                'icon' => 'HardHat',
                'accent' => 'amber',
                'products' => [
                    ['name' => 'Climbing Helmets', 'subtitle' => 'Vented work-at-height helmet', 'price' => 42.00, 'badge' => 'Best Seller', 'featured' => true],
                    ['name' => 'Welding Helmets', 'subtitle' => 'Passive shade welding helmet', 'price' => 38.50],
                    ['name' => 'Fire Fighting Helmets', 'subtitle' => 'Structural firefighting helmet', 'price' => 129.00, 'featured' => true],
                    ['name' => 'Rider Helmets', 'subtitle' => 'Impact-rated rider helmet', 'price' => 65.00],
                    ['name' => 'Vaultex Safety Helmets', 'subtitle' => 'Ratchet suspension hard hat', 'price' => 14.50, 'brand' => 'Vaultex'],
                    ['name' => 'JSP Safety Helmets', 'subtitle' => 'EVO lightweight hard hat', 'price' => 19.90, 'brand' => 'JSP', 'badge' => 'New'],
                    ['name' => 'Heavy Duty Industrial Helmets', 'subtitle' => 'High-impact industrial helmet', 'price' => 24.00],
                ],
            ],
            [
                'name' => 'Eye & Face Protection',
                'tagline' => 'Shields, goggles & auto-darkening visors',
                'description' => 'Protect eyes and face from sparks, UV, debris and chemical splash with welding shields, goggles and auto-darkening helmets.',
                'icon' => 'Glasses',
                'accent' => 'sky',
                'products' => [
                    ['name' => 'Welding Shields', 'subtitle' => 'Handheld welding face shield', 'price' => 12.00],
                    ['name' => 'Auto-Darkening Helmets', 'subtitle' => 'Variable shade DIN 9-13', 'price' => 89.00, 'badge' => 'Best Seller', 'featured' => true],
                    ['name' => 'Welding Goggles', 'subtitle' => 'Flip-front welding goggles', 'price' => 16.50],
                ],
            ],
            [
                'name' => 'Respiratory Protection',
                'tagline' => 'Masks & respirators for every hazard',
                'description' => 'Full respiratory range from disposable dust masks to 3M full-face respirators for dust, fumes, vapours and biological protection.',
                'icon' => 'Wind',
                'accent' => 'teal',
                'products' => [
                    ['name' => 'Dust Masks', 'subtitle' => 'Disposable particulate mask', 'price' => 0.85],
                    ['name' => 'N95 Masks', 'subtitle' => 'NIOSH N95 respirator', 'price' => 1.50, 'badge' => 'Best Seller', 'featured' => true],
                    ['name' => 'Surgical Masks', 'subtitle' => '3-ply surgical mask (box of 50)', 'price' => 8.90],
                    ['name' => 'NP305 Respirators', 'subtitle' => 'Half-mask reusable respirator', 'price' => 22.00, 'brand' => 'NP'],
                    ['name' => 'NP306 Respirators', 'subtitle' => 'Dual-cartridge respirator', 'price' => 28.00, 'brand' => 'NP'],
                    ['name' => '3M Half Face Respirators', 'subtitle' => '3M 6200 half facepiece', 'price' => 34.00, 'brand' => '3M', 'featured' => true],
                    ['name' => '3M Full Face Respirators', 'subtitle' => '3M 6800 full facepiece', 'price' => 189.00, 'brand' => '3M'],
                ],
            ],
            [
                'name' => 'Hearing Protection',
                'tagline' => 'Earmuffs & plugs that cut the noise',
                'description' => 'High-attenuation earmuffs and ear plugs to protect against prolonged exposure to industrial noise.',
                'icon' => 'Ear',
                'accent' => 'violet',
                'products' => [
                    ['name' => 'JSP Earmuffs', 'subtitle' => 'Over-head ear defenders', 'price' => 11.00, 'brand' => 'JSP'],
                    ['name' => 'Disposable Ear Plugs', 'subtitle' => 'Foam plugs (box of 200)', 'price' => 18.00],
                    ['name' => '3M Earmuffs', 'subtitle' => '3M Peltor Optime earmuffs', 'price' => 24.50, 'brand' => '3M', 'badge' => 'Best Seller', 'featured' => true],
                    ['name' => 'Delta Earmuffs', 'subtitle' => 'Delta Plus ear defenders', 'price' => 13.50, 'brand' => 'Delta Plus'],
                    ['name' => 'Reusable Ear Plugs', 'subtitle' => 'Corded silicone plugs', 'price' => 4.50],
                ],
            ],
            [
                'name' => 'Hand Protection',
                'tagline' => 'Gloves for grip, cut & chemical safety',
                'description' => 'Industrial gloves engineered for chemical resistance, cut protection, grip and welding across every trade.',
                'icon' => 'Hand',
                'accent' => 'emerald',
                'products' => [
                    ['name' => 'Chemical Resistant Gloves', 'subtitle' => 'Nitrile-coated chemical gloves', 'price' => 6.50, 'featured' => true, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'Nitrile Gloves', 'subtitle' => 'Foam-nitrile grip gloves', 'price' => 2.90, 'badge' => 'Best Seller', 'sizes' => ['S', 'M', 'L', 'XL']],
                    ['name' => 'Anti-Cut Gloves', 'subtitle' => 'Level 5 cut-resistant gloves', 'price' => 9.00, 'featured' => true, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'Welding Gloves', 'subtitle' => 'Leather gauntlet welding gloves', 'price' => 12.50, 'sizes' => ['L', 'XL']],
                ],
            ],
            [
                'name' => 'Protective Clothing & Uniforms',
                'tagline' => 'Overalls, coveralls & corporate uniforms',
                'description' => 'From high-visibility overalls and chemical suits to corporate uniforms and aprons, kitted for comfort, durability and compliance.',
                'icon' => 'Shirt',
                'accent' => 'orange',
                'products' => [
                    ['name' => 'Overall', 'subtitle' => 'Industrial cotton overall', 'price' => 28.00, 'sizes' => ['S', 'M', 'L', 'XL', 'XXL']],
                    ['name' => 'Uniforms', 'subtitle' => 'Two-piece work uniform', 'price' => 32.00, 'sizes' => ['S', 'M', 'L', 'XL', 'XXL']],
                    ['name' => 'Dustcoat', 'subtitle' => 'Lab / warehouse dustcoat', 'price' => 18.00, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'Overalls with Reflectors', 'subtitle' => 'Hi-vis reflective coverall', 'price' => 45.00, 'badge' => 'Best Seller', 'featured' => true, 'sizes' => ['M', 'L', 'XL', 'XXL']],
                    ['name' => 'Fire Fighter Suits', 'subtitle' => 'Structural firefighting suit', 'price' => 420.00, 'featured' => true],
                    ['name' => 'Chemical / Boiler Suits', 'subtitle' => 'Chemical-resistant boiler suit', 'price' => 58.00, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'Cold Room Overalls', 'subtitle' => 'Insulated freezer coverall', 'price' => 95.00, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'Chemical Full Kit', 'subtitle' => 'Full chemical protection suit', 'price' => 160.00],
                    ['name' => 'Reflector', 'subtitle' => 'Hi-vis reflective vest', 'price' => 9.50, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'Chemical Apron', 'subtitle' => 'PVC chemical apron', 'price' => 11.00],
                    ['name' => 'Disposable Overalls', 'subtitle' => 'Type 5/6 disposable coverall', 'price' => 6.00, 'sizes' => ['M', 'L', 'XL']],
                    ['name' => 'PVC Apron', 'subtitle' => 'Heavy-duty PVC apron', 'price' => 10.50],
                ],
            ],
            [
                'name' => 'Fall Protection',
                'tagline' => 'Harnesses, lanyards & fall arrest systems',
                'description' => 'Complete work-at-height systems: full-body harnesses, shock-absorbing lanyards, fall arrestors and tripod rescue equipment.',
                'icon' => 'Anchor',
                'accent' => 'rose',
                'products' => [
                    ['name' => 'Delta Safety Harness and Accessories', 'subtitle' => 'Full-body harness + accessories', 'price' => 68.00, 'brand' => 'Delta Plus', 'badge' => 'Best Seller', 'featured' => true],
                    ['name' => 'Safety Block Fall Arrestor', 'subtitle' => 'Retractable fall arrest block', 'price' => 145.00, 'featured' => true],
                    ['name' => 'Double Lanyard with Shock Absorbers', 'subtitle' => 'Twin-leg energy-absorbing lanyard', 'price' => 52.00],
                    ['name' => 'Delta Safety Belt', 'subtitle' => 'Work positioning belt', 'price' => 29.00, 'brand' => 'Delta Plus'],
                    ['name' => 'Tripod Stand', 'subtitle' => 'Confined-space rescue tripod', 'price' => 310.00],
                    ['name' => 'Delta Plus Safety Harness', 'subtitle' => 'Two-point full-body harness', 'price' => 55.00, 'brand' => 'Delta Plus'],
                    ['name' => 'Back Support Belt', 'subtitle' => 'Lumbar support belt', 'price' => 16.00, 'sizes' => ['M', 'L', 'XL']],
                ],
            ],
        ];
    }
}
