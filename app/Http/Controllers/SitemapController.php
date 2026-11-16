<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\SeoService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function robots(SeoService $seo): Response
    {
        $appUrl = rtrim((string) config('app.url'), '/');
        $index = str_starts_with($seo->all()['robots'], 'index');

        $body = $index
            ? "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /account\nDisallow: /checkout\nSitemap: {$appUrl}/sitemap.xml\n"
            : "User-agent: *\nDisallow: /\n";

        return response($body, 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    public function sitemap(): Response
    {
        $appUrl = rtrim((string) config('app.url'), '/');
        $urls = [
            ['loc' => $appUrl.'/', 'changefreq' => 'weekly', 'priority' => '1.0'],
            ['loc' => $appUrl.'/shop', 'changefreq' => 'weekly', 'priority' => '0.9'],
            ['loc' => $appUrl.'/about', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => $appUrl.'/contact', 'changefreq' => 'monthly', 'priority' => '0.6'],
        ];

        foreach (Category::query()->where('is_published', true)->orderBy('sort_order')->get(['slug', 'updated_at']) as $category) {
            $urls[] = [
                'loc' => $appUrl.'/category/'.$category->slug,
                'lastmod' => $category->updated_at?->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        foreach (Product::query()->where('is_published', true)->orderBy('id')->get(['slug', 'updated_at']) as $product) {
            $urls[] = [
                'loc' => $appUrl.'/product/'.$product->slug,
                'lastmod' => $product->updated_at?->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>'.e($url['loc'])."</loc>\n";
            if (! empty($url['lastmod'])) {
                $xml .= '    <lastmod>'.e($url['lastmod'])."</lastmod>\n";
            }
            $xml .= '    <changefreq>'.e($url['changefreq'])."</changefreq>\n";
            $xml .= '    <priority>'.e($url['priority'])."</priority>\n";
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
