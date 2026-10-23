<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Product;
use App\Models\StorefrontChat;
use App\Services\CartService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'company' => [
                'name' => 'Clevesol Northwest LLC',
                'tagline' => 'Your Safety. Our Commitment.',
                'email' => 'info@clevesolnw.com',
                'email_alt' => 'clevesolnorthwest@gmail.com',
                'phone' => '+1 (253) 417-0079',
                'website' => 'www.clevesolnw.com',
                'address' => '3218 Rockefeller Ave, Everett, WA 98201',
            ],
            'navCategories' => Category::query()
                ->where('is_published', true)
                ->orderBy('sort_order')
                ->select(['id', 'name', 'slug', 'icon', 'accent', 'tagline'])
                ->addSelect(['menu_image' => Product::query()
                    ->select('image_path')
                    ->whereColumn('products.category_id', 'categories.id')
                    ->where('is_published', true)
                    ->whereNotNull('image_path')
                    ->orderByDesc('is_featured')
                    ->orderBy('sort_order')
                    ->limit(1)])
                ->get()
                ->map(fn (Category $category) => [
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                    'accent' => $category->accent,
                    'tagline' => $category->tagline,
                    'image_path' => $category->menu_image,
                ])
                ->values(),
            'cart' => ($detailedCart = app(CartService::class)->detailed()),
            'cartCount' => $detailedCart['count'],
            'openCart' => $request->session()->get('open_cart'),
            'flash' => [
                'message' => $request->session()->get('flash'),
            ],
            'staffChatUnread' => $request->user()?->role === 'admin'
                ? StorefrontChat::where('staff_unread', true)->count()
                : 0,
        ]);
    }
}
