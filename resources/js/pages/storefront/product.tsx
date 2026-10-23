import ProductCard from '@/components/storefront/product-card';
import ProductMedia from '@/components/storefront/product-media';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { useStorefrontCart } from '@/lib/storefront-cart';
import { accentTheme, formatPrice } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { type ProductCard as ProductCardType, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, CheckCircle2, Minus, Plus, ShieldCheck, Star, Truck } from 'lucide-react';
import { useState } from 'react';

interface ProductDetail extends ProductCardType {
    description: string | null;
    features: string[];
    certifications: string[];
    sizes: string[];
    sku: string | null;
    stock: number;
    reviews_count: number;
    compare_price: number | null;
}

interface PageProps {
    product: ProductDetail;
    related: ProductCardType[];
}

export default function ProductPage() {
    const { product, related } = usePage<SharedData & PageProps>().props as unknown as PageProps;
    const [qty, setQty] = useState(1);
    const [size, setSize] = useState<string | null>(product.sizes?.[0] ?? null);
    const theme = accentTheme(product.accent);
    const { add } = useStorefrontCart();

    const addToCart = () => {
        add(product, qty, size);
    };

    const buyNow = () => {
        add(product, qty, size);
    };

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 py-8">
                <nav className="text-xs text-zinc-500 dark:text-zinc-400">
                    <Link href={route('home')} className="hover:text-emerald-600">Home</Link>
                    <span className="px-1.5">/</span>
                    {product.category_slug && (
                        <>
                            <Link href={route('category', product.category_slug)} className="hover:text-emerald-600">{product.category}</Link>
                            <span className="px-1.5">/</span>
                        </>
                    )}
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">{product.name}</span>
                </nav>

                <div className="mt-6 grid gap-10 lg:grid-cols-2">
                    {/* media */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <ProductMedia
                            name={product.name}
                            imagePath={product.image_path}
                            accent={product.accent}
                            icon={product.icon}
                            className="aspect-square w-full rounded-3xl border border-zinc-200 dark:border-zinc-800"
                        />
                        <div className="mt-4 grid grid-cols-4 gap-3">
                            {product.certifications.slice(0, 4).map((c) => (
                                <div key={c} className="flex items-center justify-center gap-1 rounded-xl border border-zinc-200 py-2 text-xs font-bold text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {c}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* info */}
                    <div>
                        {product.brand && (
                            <span className={cn('text-sm font-semibold uppercase tracking-wide', theme.text)}>{product.brand}</span>
                        )}
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{product.name}</h1>
                        {product.subtitle && <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">{product.subtitle}</p>}

                        <div className="mt-4 flex items-center gap-4">
                            <span className="flex items-center gap-1 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn('h-4 w-4', i < Math.round(product.rating) && 'fill-current')} />
                                ))}
                                <span className="ml-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                    {product.rating.toFixed(1)} ({product.reviews_count} reviews)
                                </span>
                            </span>
                        </div>

                        <div className="mt-6 flex items-end gap-3">
                            <span className="text-4xl font-extrabold">{formatPrice(product.price)}</span>
                            {product.compare_price && (
                                <span className="mb-1 text-lg text-zinc-400 line-through">{formatPrice(product.compare_price)}</span>
                            )}
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> In stock · {product.stock} available
                        </p>

                        {product.sizes.length > 0 && (
                            <div className="mt-6">
                                <p className="mb-2 text-sm font-semibold">Size</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={cn(
                                                'min-w-12 rounded-lg border px-4 py-2 text-sm font-semibold',
                                                size === s ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-200 hover:border-emerald-500 dark:border-zinc-700',
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* qty + actions */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-semibold">{qty}</span>
                                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                onClick={addToCart}
                                className="flex-1 rounded-lg border-2 border-zinc-900 px-6 py-3 text-sm font-bold transition hover:bg-zinc-900 hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-zinc-900"
                            >
                                Add to cart
                            </button>
                            <button
                                onClick={buyNow}
                                className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                            >
                                Request quote
                            </button>
                        </div>

                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                            <Truck className="h-5 w-5 text-emerald-600" /> Nationwide delivery · bulk & corporate pricing available
                        </div>

                        {/* description */}
                        {product.description && (
                            <div className="mt-8">
                                <h2 className="text-lg font-bold">Description</h2>
                                <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-300">{product.description}</p>
                            </div>
                        )}

                        {/* features */}
                        {product.features.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-lg font-bold">Key features</h2>
                                <ul className="mt-3 space-y-2">
                                    {product.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-extrabold tracking-tight">Related products</h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ProductPage.layout = storefrontLayout;
