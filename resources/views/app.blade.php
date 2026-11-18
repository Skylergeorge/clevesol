<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        @php($seoPage = app(\App\Services\SeoService::class)->forRequest(request()))

        <title inertia>{{ $seoPage['full_title'] }}</title>
        <meta name="description" content="{{ $seoPage['description'] }}">
        @if ($seoPage['keywords'] !== '')
            <meta name="keywords" content="{{ $seoPage['keywords'] }}">
        @endif
        <meta name="robots" content="{{ $seoPage['robots'] }}">
        <link rel="canonical" href="{{ $seoPage['canonical'] }}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $seoPage['full_title'] }}">
        <meta property="og:description" content="{{ $seoPage['description'] }}">
        <meta property="og:url" content="{{ $seoPage['canonical'] }}">
        <meta property="og:image" content="{{ str_starts_with($seoPage['image'], 'http') ? $seoPage['image'] : rtrim(config('app.url'), '/').'/'.ltrim($seoPage['image'], '/') }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoPage['full_title'] }}">
        <meta name="twitter:description" content="{{ $seoPage['description'] }}">
        @if (! empty($seoPage['graph']))
            <script type="application/ld+json">{!! json_encode($seoPage['graph'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
        @endif

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        <link href="https://fonts.bunny.net/css?family=poppins:400,500,600,700,800" rel="stylesheet" />

        @routes
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
