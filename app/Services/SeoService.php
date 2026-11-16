<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SeoService
{
    /**
     * @return array{site_title:string,meta_title:string,meta_description:string,meta_keywords:string,og_image:string,robots:string}
     */
    public function all(): array
    {
        $saved = [];
        $raw = Setting::decrypted('seo');
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $saved = $decoded;
            }
        }

        return array_merge($this->defaults(), array_intersect_key($saved, $this->defaults()));
    }

    /**
     * @param  array<string, string>  $data
     */
    public function save(array $data): void
    {
        Setting::putEncrypted('seo', json_encode(array_merge($this->all(), $data), JSON_UNESCAPED_SLASHES));
    }

    /**
     * @return array{title:string,full_title:string,description:string,keywords:string,image:string,robots:string,canonical:string}
     */
    public function forRequest(Request $request): array
    {
        $seo = $this->all();
        $title = $seo['meta_title'];
        $description = $seo['meta_description'];
        $image = $seo['og_image'];
        $robots = $seo['robots'];

        if ($request->routeIs('product')) {
            $product = $request->route('product');
            if ($product instanceof Product) {
                $title = $product->name;
                $description = Str::limit(trim(strip_tags((string) ($product->subtitle ?: $product->description ?: $description))), 320, '');
                $image = $product->image_path ?: $image;
            }
        } elseif ($request->routeIs('category')) {
            $category = $request->route('category');
            if ($category instanceof Category) {
                $title = $category->name;
                $description = $category->tagline ?: $description;
            }
        } elseif ($request->routeIs('shop')) {
            $title = 'All Products';
        } elseif ($request->routeIs('about')) {
            $title = 'About Us';
        } elseif ($request->routeIs('contact')) {
            $title = 'Contact Us';
        }

        if ($request->routeIs('account', 'account.update', 'cart', 'checkout.*', 'quote.*', 'login', 'register')) {
            $robots = 'noindex, nofollow';
        }

        $fullTitle = $seo['site_title'] !== '' ? $title.' | '.$seo['site_title'] : $title;

        return [
            'title' => $title,
            'full_title' => $fullTitle,
            'description' => $description,
            'keywords' => $seo['meta_keywords'],
            'image' => $image,
            'robots' => $robots,
            'canonical' => $request->url(),
        ];
    }

    /**
     * @return array{site_title:string,meta_title:string,meta_description:string,meta_keywords:string,og_image:string,robots:string}
     */
    public function defaults(): array
    {
        return [
            'site_title' => 'Clevesol Northwest LLC',
            'meta_title' => 'Industrial Safety Equipment & PPE',
            'meta_description' => 'Shop certified PPE, uniforms, and safety gear from Clevesol Northwest LLC in Everett, WA.',
            'meta_keywords' => 'PPE, safety equipment, industrial safety, uniforms, Clevesol',
            'og_image' => '/images/hero/site.jpg',
            'robots' => 'index, follow',
        ];
    }
}
