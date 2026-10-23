import ProductMedia from '@/components/storefront/product-media';
import { accentTheme, formatPrice } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { useStorefrontCart } from '@/lib/storefront-cart';
import { type ProductCard as ProductCardType } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Star } from 'lucide-react';

export default function ProductCard({ product }: { product: ProductCardType }) {
    const theme = accentTheme(product.accent);
    const { add } = useStorefrontCart();

    const addToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        add(product, 1);
    };

    return (
        <Link
            href={route('product', product.slug)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className="relative">
                <ProductMedia
                    name={product.name}
                    imagePath={product.image_path}
                    accent={product.accent}
                    icon={product.icon}
                    className="aspect-[4/3] w-full"
                />
                {product.badge && (
                    <span
                        className={cn(
                            'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                            theme.chip,
                        )}
                    >
                        {product.badge}
                    </span>
                )}
                <button
                    onClick={addToCart}
                    aria-label="Add to cart"
                    className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-zinc-900 text-white opacity-0 shadow-lg transition-all hover:bg-emerald-600 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-zinc-900 dark:hover:bg-emerald-500 dark:hover:text-white"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            <div className="flex flex-1 flex-col p-4">
                {product.category && (
                    <span className={cn('text-[11px] font-semibold uppercase tracking-wide', theme.text)}>
                        {product.category}
                    </span>
                )}
                <h3 className="mt-1 line-clamp-1 font-semibold text-zinc-900 dark:text-zinc-50">{product.name}</h3>
                {product.subtitle && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">{product.subtitle}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(product.price)}</span>
                    <span className="flex items-center gap-1 text-sm text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">{product.rating.toFixed(1)}</span>
                    </span>
                </div>
            </div>
        </Link>
    );
}
