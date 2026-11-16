import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

function absoluteUrl(path: string, origin: string) {
    if (!path) {
        return origin;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return origin.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`);
}

export default function StorefrontSeo() {
    const page = usePage<SharedData>();
    const seoPage = page.props.seoPage;
    if (!seoPage) {
        return null;
    }

    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const image = absoluteUrl(seoPage.image, origin);

    return (
        <Head title={seoPage.full_title}>
            <meta head-key="description" name="description" content={seoPage.description} />
            {seoPage.keywords ? <meta head-key="keywords" name="keywords" content={seoPage.keywords} /> : null}
            <meta head-key="robots" name="robots" content={seoPage.robots} />
            <link head-key="canonical" rel="canonical" href={seoPage.canonical} />
            <meta head-key="og:title" property="og:title" content={seoPage.full_title} />
            <meta head-key="og:description" property="og:description" content={seoPage.description} />
            <meta head-key="og:url" property="og:url" content={seoPage.canonical} />
            <meta head-key="og:image" property="og:image" content={image} />
            <meta head-key="twitter:title" name="twitter:title" content={seoPage.full_title} />
            <meta head-key="twitter:description" name="twitter:description" content={seoPage.description} />
        </Head>
    );
}
