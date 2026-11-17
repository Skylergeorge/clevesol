import ProductCard from '@/components/storefront/product-card';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { categoryIcon } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { type ProductCard as ProductCardType, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    accent: string | null;
    tagline?: string | null;
    description?: string | null;
}

interface PageProps {
    category: Category | null;
    categories: Category[];
    products: Paginated<ProductCardType>;
    brands: string[];
    filters: { q: string; brand: string; sort: string };
}

export default function Shop() {
    const { category, categories, products, brands, filters } = usePage<SharedData & PageProps>().props;

    const baseRoute = category ? route('category', category.slug) : route('shop');

    const applyFilter = (patch: Record<string, string>) => {
        router.get(baseRoute, { ...filters, ...patch }, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:gap-8 sm:py-8 lg:flex-row lg:items-start">
                <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
                    <div className="lg:hidden">
                        <div className="clv-noscroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                            <Link
                                href={route('shop')}
                                className={cn(
                                    'shrink-0 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap',
                                    !category ? 'border-[#117846] bg-[#117846] text-white' : 'border-zinc-200 bg-white text-zinc-800',
                                )}
                            >
                                All
                            </Link>
                            {categories.map((c) => {
                                const active = category?.id === c.id;
                                return (
                                    <Link
                                        key={c.id}
                                        href={route('category', c.slug)}
                                        className={cn(
                                            'shrink-0 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap',
                                            active ? 'border-[#117846] bg-[#117846] text-white' : 'border-zinc-200 bg-white text-zinc-800',
                                        )}
                                    >
                                        {c.name}
                                    </Link>
                                );
                            })}
                        </div>
                        {brands.length > 0 && (
                            <select
                                value={filters.brand}
                                onChange={(e) => applyFilter({ brand: e.target.value })}
                                className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                            >
                                <option value="">All brands</option>
                                {brands.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="hidden rounded-2xl border border-zinc-200 bg-white p-4 lg:block dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Categories</h2>
                        <div className="space-y-1">
                            {categories.map((c) => {
                                const Icon = categoryIcon(c.icon);
                                const active = category?.id === c.id;
                                return (
                                    <Link
                                        key={c.id}
                                        href={route('category', c.slug)}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                                            active ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" /> {c.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {brands.length > 0 && (
                        <div className="mt-6 hidden lg:block">
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Brand</h3>
                            <select
                                value={filters.brand}
                                onChange={(e) => applyFilter({ brand: e.target.value })}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                            >
                                <option value="">All brands</option>
                                {brands.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </aside>

                {/* Products */}
                <div className="min-w-0 flex-1">
                    {category ? (
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{category.name}</h1>
                            {category.tagline ? (
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{category.tagline}</p>
                            ) : null}
                        </div>
                    ) : null}
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <p className="flex min-w-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <SlidersHorizontal className="h-4 w-4 shrink-0" />
                            <span className="truncate">{products.total} products{filters.q && ` for "${filters.q}"`}</span>
                        </p>
                        <select
                            value={filters.sort}
                            onChange={(e) => applyFilter({ sort: e.target.value })}
                            className="max-w-[55%] shrink-0 rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm sm:max-w-none sm:px-3 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <option value="">Sort: Recommended</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-24 text-center dark:border-zinc-700">
                            <PackageSearch className="h-12 w-12 text-zinc-400" />
                            <p className="mt-4 font-semibold">No products found</p>
                            <p className="text-sm text-zinc-500">Try a different category or search term.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                            {products.data.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    {/* pagination */}
                    {products.links.length > 3 && (
                        <div className="mt-10 flex flex-wrap justify-center gap-1">
                            {products.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    className={cn(
                                        'min-w-9 rounded-lg px-3 py-2 text-sm font-medium',
                                        link.active ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Shop.layout = storefrontLayout;
