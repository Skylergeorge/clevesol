<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SeoController extends Controller
{
    public function edit(SeoService $seo): Response
    {
        return Inertia::render('admin/seo', [
            'seo' => $seo->all(),
        ]);
    }

    public function update(Request $request, SeoService $seo): RedirectResponse
    {
        $data = $request->validate([
            'site_title' => ['required', 'string', 'max:80'],
            'meta_title' => ['required', 'string', 'max:70'],
            'meta_description' => ['required', 'string', 'max:320'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'og_image' => ['nullable', 'string', 'max:255'],
            'robots' => ['required', Rule::in(['index, follow', 'noindex, nofollow'])],
        ]);

        $seo->save([
            'site_title' => strip_tags($data['site_title']),
            'meta_title' => strip_tags($data['meta_title']),
            'meta_description' => strip_tags($data['meta_description']),
            'meta_keywords' => strip_tags((string) ($data['meta_keywords'] ?? '')),
            'og_image' => strip_tags((string) ($data['og_image'] ?? '')),
            'robots' => $data['robots'],
        ]);

        return back(303)->with('flash', 'SEO settings saved.');
    }
}
