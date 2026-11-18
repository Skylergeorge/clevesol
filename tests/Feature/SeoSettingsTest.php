<?php

use App\Models\User;
use App\Services\SeoService;

test('buyers cannot open seo settings', function () {
    $buyer = User::factory()->create(['role' => 'buyer']);

    $this->actingAs($buyer)
        ->get(route('admin.seo'))
        ->assertRedirect(route('account'));
});

test('admins can save seo settings', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->from(route('admin.seo'))
        ->put(route('admin.seo.update'), [
            'site_title' => 'Clevesol Shop',
            'meta_title' => 'Safety Gear',
            'meta_description' => 'Certified PPE for crews.',
            'meta_keywords' => 'PPE, helmets',
            'og_image' => '/images/hero/site.jpg',
            'robots' => 'index, follow',
        ])
        ->assertRedirect(route('admin.seo'));

    $seo = app(SeoService::class)->all();
    expect($seo['site_title'])->toBe('Clevesol Shop')
        ->and($seo['meta_title'])->toBe('Safety Gear')
        ->and($seo['meta_description'])->toBe('Certified PPE for crews.');
});

test('the homepage html includes the saved meta description', function () {
    app(SeoService::class)->save([
        'meta_description' => 'Unique Clevesol PPE description for tests.',
        'meta_title' => 'Test Home Title',
        'site_title' => 'Clevesol Test',
    ]);

    $this->get('/')
        ->assertOk()
        ->assertSee('Unique Clevesol PPE description for tests.', false)
        ->assertSee('Test Home Title | Clevesol Test', false);
});

test('robots and sitemap are public', function () {
    $this->get('/robots.txt')->assertOk()->assertSee('Sitemap:', false);
    $this->get('/sitemap.xml')->assertOk()->assertSee('urlset', false);
});

test('storefront html includes platform json-ld for crawlers', function () {
    $this->get('/')
        ->assertOk()
        ->assertSee('application/ld+json', false)
        ->assertSee('https://ginglesky.com', false)
        ->assertSee('Ginglesky', false)
        ->assertDontSee('Yetu ERP', false);
});

test('llms txt names the platform vendor', function () {
    $this->get('/llms.txt')
        ->assertOk()
        ->assertSee('Ginglesky', false)
        ->assertSee('https://ginglesky.com', false)
        ->assertDontSee('Yetu ERP', false);
});
