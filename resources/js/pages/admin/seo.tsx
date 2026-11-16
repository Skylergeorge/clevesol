import { appLayout } from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SEO', href: '/admin/seo' },
];

interface SeoFields {
    site_title: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image: string;
    robots: string;
}

export default function Seo({ seo }: { seo: SeoFields }) {
    const flash = usePage().props.flash as { message?: string } | undefined;
    const form = useForm({
        site_title: seo.site_title,
        meta_title: seo.meta_title,
        meta_description: seo.meta_description,
        meta_keywords: seo.meta_keywords,
        og_image: seo.og_image,
        robots: seo.robots,
    });

    return (
        <>
            <Head title="SEO" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">SEO</h1>
                </div>

                {flash?.message ? <p className="text-sm text-emerald-700">{flash.message}</p> : null}

                <form
                    className="flex flex-1 flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(route('admin.seo.update'), { preserveScroll: true });
                    }}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Site title
                            <input
                                value={form.data.site_title}
                                onChange={(event) => form.setData('site_title', event.target.value)}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.site_title ? <p className="mt-1 text-xs text-red-600">{form.errors.site_title}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Home title
                            <input
                                value={form.data.meta_title}
                                onChange={(event) => form.setData('meta_title', event.target.value)}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.meta_title ? <p className="mt-1 text-xs text-red-600">{form.errors.meta_title}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 md:col-span-2">
                            Meta description
                            <textarea
                                value={form.data.meta_description}
                                onChange={(event) => form.setData('meta_description', event.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            <span className="mt-1 block text-xs text-zinc-500">{form.data.meta_description.length}/320</span>
                            {form.errors.meta_description ? <p className="mt-1 text-xs text-red-600">{form.errors.meta_description}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Keywords
                            <input
                                value={form.data.meta_keywords}
                                onChange={(event) => form.setData('meta_keywords', event.target.value)}
                                placeholder="PPE, safety equipment"
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.meta_keywords ? <p className="mt-1 text-xs text-red-600">{form.errors.meta_keywords}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Search engines
                            <select
                                value={form.data.robots}
                                onChange={(event) => form.setData('robots', event.target.value)}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            >
                                <option value="index, follow">Index the site</option>
                                <option value="noindex, nofollow">Hide from search engines</option>
                            </select>
                            {form.errors.robots ? <p className="mt-1 text-xs text-red-600">{form.errors.robots}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 md:col-span-2">
                            Share image
                            <input
                                value={form.data.og_image}
                                onChange={(event) => form.setData('og_image', event.target.value)}
                                placeholder="/images/hero/site.jpg"
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.og_image ? <p className="mt-1 text-xs text-red-600">{form.errors.og_image}</p> : null}
                        </label>
                    </div>

                    <div className="mt-auto flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-[#102753] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {form.processing ? 'Saving…' : 'Save SEO'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Seo.layout = appLayout;
Seo.breadcrumbs = breadcrumbs;
