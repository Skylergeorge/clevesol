import PaymentOptions, { type PaymentMethod } from '@/components/storefront/payment-options';
import ProductMedia from '@/components/storefront/product-media';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { clearStoredCart, useStorefrontCart } from '@/lib/storefront-cart';
import { formatPrice } from '@/lib/catalog';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
    const { auth, paymentsEnabled } = usePage<SharedData>().props;
    const { cart, setQty, remove } = useStorefrontCart();

    const { post, processing, errors, data, setData } = useForm({
        payment_method: (paymentsEnabled ? 'pay_now' : 'pay_on_delivery') as PaymentMethod,
    });

    const updateQty = (productId: number, size: string | null, qty: number) => {
        setQty(productId, size, qty);
    };

    const removeItem = (productId: number, size: string | null) => {
        remove(productId, size);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payNow = data.payment_method === 'pay_now';
        if (payNow && !paymentsEnabled) {
            return;
        }
        post(payNow ? route('checkout.pay') : route('quote.submit'), {
            onStart: () => {
                if (payNow) {
                    clearStoredCart();
                }
            },
            onSuccess: () => clearStoredCart(),
        });
    };

    if (cart.items.length === 0) {
        return (
            <>
                <Head title="Your Cart" />
                <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <ShoppingCart className="h-9 w-9 text-zinc-400" />
                    </span>
                    <h1 className="mt-6 text-2xl font-extrabold">Your cart is empty</h1>
                    <p className="mt-2 text-zinc-500">Browse our safety range and build a quote request.</p>
                    <Link href={route('shop')} className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                        Shop products
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Your Cart" />
            <div className="mx-auto max-w-7xl px-4 py-10">
                <h1 className="text-3xl font-extrabold tracking-tight">Your quote cart</h1>
                <p className="mt-1 text-zinc-500">Review items and send us a request — we'll reply with tailored pricing.</p>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
                    {/* items */}
                    <div className="space-y-3">
                        {cart.items.map((item) => (
                            <div key={item.index} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                <Link href={route('product', item.slug)}>
                                    <ProductMedia
                                        name={item.name}
                                        imagePath={item.image_path}
                                        accent={item.accent}
                                        icon={item.icon}
                                        className="h-24 w-24 shrink-0 rounded-xl"
                                    />
                                </Link>
                                <div className="flex flex-1 flex-col">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            {item.category && <span className="text-xs font-semibold text-emerald-600">{item.category}</span>}
                                            <Link href={route('product', item.slug)} className="block font-semibold hover:text-emerald-600">
                                                {item.name}
                                            </Link>
                                            {item.size && <span className="text-xs text-zinc-500">Size: {item.size}</span>}
                                        </div>
                                        <button onClick={() => removeItem(item.product_id, item.size)} className="text-zinc-400 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between pt-2">
                                        <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            <button onClick={() => updateQty(item.product_id, item.size, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                                            <button onClick={() => updateQty(item.product_id, item.size, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <span className="font-bold">{formatPrice(item.line_total)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* summary + quote form */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500">Items</span>
                                <span className="font-semibold">{cart.count}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-zinc-500">Estimated total</span>
                                <span className="text-2xl font-extrabold">{formatPrice(cart.subtotal)}</span>
                            </div>
                            <p className="mt-2 text-xs text-zinc-400">Final pricing confirmed in your quote.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="font-bold text-[#002d5b]">Checkout</h2>
                            {auth.user ? (
                                <>
                                    <PaymentOptions
                                        value={data.payment_method}
                                        onChange={(method) => setData('payment_method', method)}
                                        paymentsEnabled={!!paymentsEnabled}
                                    />
                                    {errors.cart && <p className="text-xs text-red-500">{errors.cart}</p>}
                                    {errors.payment_method && <p className="text-xs text-red-500">{errors.payment_method}</p>}
                                    <button
                                        type="submit"
                                        disabled={processing || (data.payment_method === 'pay_now' && !paymentsEnabled)}
                                        className="w-full rounded-lg bg-[#117846] py-3 text-sm font-bold text-white transition hover:bg-[#0d6a3d] disabled:opacity-50"
                                    >
                                        {processing
                                            ? data.payment_method === 'pay_now'
                                                ? 'Opening Stripe…'
                                                : 'Placing order…'
                                            : data.payment_method === 'pay_now'
                                              ? 'Place order and pay'
                                              : 'Place order'}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-[#3d5a73]">Log in, then place the order. Your cart is kept.</p>
                                    <Link href={route('login', { order: 1 })} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#117846] text-sm font-bold text-white hover:bg-[#0d6a3d]">
                                        Log in to order
                                    </Link>
                                    <Link href={route('register', { order: 1 })} className="block text-center text-sm text-[#002d5b] underline">
                                        New here? Create an account
                                    </Link>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

        </>
    );
}

CartPage.layout = storefrontLayout;
