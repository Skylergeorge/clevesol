<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CatalogueController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->with('category');

        if ($search = trim((string) $request->get('q'))) {
            $query->where('name', 'like', "%{$search}%")->orWhere('brand', 'like', "%{$search}%");
        }
        if ($categoryId = $request->get('category')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->orderByDesc('id')->paginate(15)->withQueryString()
            ->through(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'subtitle' => $p->subtitle,
                'brand' => $p->brand,
                'sku' => $p->sku,
                'price' => (float) $p->price,
                'stock' => $p->stock,
                'badge' => $p->badge,
                'description' => $p->description,
                'features' => $p->features ?? [],
                'certifications' => $p->certifications ?? [],
                'sizes' => $p->sizes ?? [],
                'sort_order' => $p->sort_order,
                'is_featured' => $p->is_featured,
                'is_published' => $p->is_published,
                'category' => $p->category?->name,
                'category_id' => $p->category_id,
                'accent' => $p->category?->accent,
                'icon' => $p->category?->icon,
                'image_path' => $p->image_path,
            ]);

        return Inertia::render('admin/catalogue', [
            'products' => $products,
            'categories' => Category::orderBy('sort_order')->get(['id', 'name', 'slug', 'icon', 'accent']),
            'filters' => [
                'q' => $request->get('q', ''),
                'category' => $request->get('category', ''),
            ],
            'stats' => [
                'products' => Product::count(),
                'categories' => Category::count(),
                'featured' => Product::where('is_featured', true)->count(),
                'published' => Product::where('is_published', true)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateProduct($request);
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['sku'] = $data['sku'] ?: 'CLV-'.strtoupper(Str::random(6));
        $data['image_path'] = $this->storeImage($request);
        Product::create($data);

        return back(303)->with('flash', 'Product added. It shows on the shop when it is published.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validateProduct($request);
        if ($data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }
        $image = $this->storeImage($request);
        if ($image) {
            $this->deleteUpload($product->image_path);
            $data['image_path'] = $image;
        }
        $product->update($data);

        return back(303)->with('flash', 'Product updated.');
    }

    public function visibility(Request $request, Product $product): RedirectResponse
    {
        $product->update(['is_published' => $request->boolean('is_published')]);

        return back(303);
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->deleteUpload($product->image_path);
        $product->delete();

        return back(303)->with('flash', 'Product deleted.');
    }

    public function destroyAll(): RedirectResponse
    {
        Product::query()->select(['id', 'image_path'])->orderBy('id')->each(function (Product $product) {
            $this->deleteUpload($product->image_path);
        });
        Product::query()->delete();

        return back(303)->with('flash', 'Catalogue cleared.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'tagline' => 'nullable|string|max:200',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:60',
            'accent' => 'nullable|string|max:40',
        ]);
        $data['slug'] = $this->uniqueCategorySlug($data['name']);
        $data['sort_order'] = (int) Category::max('sort_order') + 1;
        Category::create($data);

        return back(303)->with('flash', 'Category created.');
    }

    private function validateProduct(Request $request): array
    {
        $request->merge([
            'stock' => $request->input('stock') === '' || $request->input('stock') === null ? 0 : $request->input('stock'),
            'sort_order' => $request->input('sort_order') === '' || $request->input('sort_order') === null ? 0 : $request->input('sort_order'),
        ]);

        $validated = $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
            'name' => 'required|string|max:160',
            'subtitle' => 'nullable|string|max:200',
            'brand' => 'nullable|string|max:80',
            'sku' => 'nullable|string|max:60',
            'description' => 'nullable|string|max:4000',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'badge' => 'nullable|string|max:40',
            'image' => 'nullable|image|max:4096',
            'features' => 'nullable',
            'certifications' => 'nullable',
            'sizes' => 'nullable',
            'sort_order' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ]);

        unset($validated['image']);
        $validated['stock'] = $validated['stock'] ?? 0;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['features'] = $this->lines($request->input('features'));
        $validated['certifications'] = $this->tokens($request->input('certifications'));
        $validated['sizes'] = $this->tokens($request->input('sizes'));
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['is_published'] = $request->boolean('is_published');

        return $validated;
    }

    private function lines(mixed $value): array
    {
        $parts = is_array($value) ? $value : preg_split('/\r\n|\r|\n/', (string) $value);

        return array_values(array_filter(array_map(fn ($line) => trim((string) $line), $parts ?: [])));
    }

    private function tokens(mixed $value): array
    {
        $parts = is_array($value) ? $value : preg_split('/[\n,]/', (string) $value);

        return array_values(array_filter(array_map(fn ($token) => trim((string) $token), $parts ?: [])));
    }

    private function storeImage(Request $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $file = $request->file('image');
        $dir = public_path('images/products/uploads');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'-'.Str::lower(Str::random(6)).'.'.$file->extension();
        $file->move($dir, $name);

        return '/images/products/uploads/'.$name;
    }

    private function deleteUpload(?string $path): void
    {
        if (! $path || ! str_starts_with($path, '/images/products/uploads/')) {
            return;
        }

        $full = public_path(ltrim($path, '/'));
        if (is_file($full)) {
            unlink($full);
        }
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Product::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function uniqueCategorySlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
