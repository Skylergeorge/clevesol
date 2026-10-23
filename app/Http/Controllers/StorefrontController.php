<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function home(): Response
    {
        $categories = Category::query()
            ->where('is_published', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        $featured = Product::query()
            ->with('category')
            ->where('is_published', true)
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->limit(8)
            ->get()
            ->map(fn (Product $p) => $this->cardData($p));

        $newArrivals = Product::query()
            ->with('category')
            ->where('is_published', true)
            ->latest('id')
            ->limit(8)
            ->get()
            ->map(fn (Product $p) => $this->cardData($p));

        return Inertia::render('storefront/home', [
            'categories' => $categories,
            'featured' => $featured,
            'newArrivals' => $newArrivals,
            'stats' => [
                'products' => Product::where('is_published', true)->count(),
                'categories' => $categories->count(),
            ],
        ]);
    }

    public function shop(Request $request): Response
    {
        return $this->renderCatalog($request, null);
    }

    public function category(Request $request, Category $category): Response
    {
        abort_unless($category->is_published, 404);

        return $this->renderCatalog($request, $category);
    }

    private function renderCatalog(Request $request, ?Category $category): Response
    {
        $query = Product::query()
            ->with('category')
            ->where('is_published', true);

        if ($category) {
            $query->where('category_id', $category->id);
        }

        if ($search = trim((string) $request->get('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        if ($brand = $request->get('brand')) {
            $query->where('brand', $brand);
        }

        match ($request->get('sort')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating'),
            'newest' => $query->latest('id'),
            default => $query->orderBy('sort_order')->orderBy('name'),
        };

        $products = $query->paginate(12)->withQueryString()
            ->through(fn (Product $p) => $this->cardData($p));

        return Inertia::render('storefront/shop', [
            'category' => $category,
            'categories' => Category::where('is_published', true)->orderBy('sort_order')->get(['id', 'name', 'slug', 'icon', 'accent']),
            'products' => $products,
            'brands' => Product::where('is_published', true)->whereNotNull('brand')->distinct()->orderBy('brand')->pluck('brand'),
            'filters' => [
                'q' => $request->get('q', ''),
                'brand' => $request->get('brand', ''),
                'sort' => $request->get('sort', ''),
            ],
        ]);
    }

    public function product(Product $product): Response
    {
        abort_unless($product->is_published, 404);
        $product->load('category');

        $related = Product::query()
            ->with('category')
            ->where('is_published', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get()
            ->map(fn (Product $p) => $this->cardData($p));

        return Inertia::render('storefront/product', [
            'product' => [
                ...$this->cardData($product),
                'description' => $product->description,
                'features' => $product->features ?? [],
                'certifications' => $product->certifications ?? [],
                'sizes' => $product->sizes ?? [],
                'sku' => $product->sku,
                'stock' => $product->stock,
                'reviews_count' => $product->reviews_count,
                'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
            ],
            'related' => $related,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('storefront/about');
    }

    public function contact(): Response
    {
        return Inertia::render('storefront/contact');
    }

    private function cardData(Product $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'subtitle' => $p->subtitle,
            'brand' => $p->brand,
            'badge' => $p->badge,
            'price' => (float) $p->price,
            'rating' => (float) $p->rating,
            'image_path' => $p->image_path,
            'category' => $p->category?->name,
            'category_slug' => $p->category?->slug,
            'accent' => $p->category?->accent,
            'icon' => $p->category?->icon,
        ];
    }
}
