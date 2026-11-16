import PaymentOptions, { type PaymentMethod } from '@/components/storefront/payment-options';
import { formatPrice } from '@/lib/catalog';
import { clearStoredCart, useStorefrontCart } from '@/lib/storefront-cart';
import { type SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useEffect } from 'react';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { auth, paymentsEnabled } = usePage<SharedData>().props;
    const { cart, setQty, remove } = useStorefrontCart();
    const { post, processing, errors, data, setData } = useForm({
        payment_method: (paymentsEnabled ? 'pay_now' : 'pay_on_delivery') as PaymentMethod,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payNow = data.payment_method === 'pay_now';
        if (payNow && !paymentsEnabled) {
            return;
        }
        post(payNow ? route('checkout.pay') : route('quote.submit'), {
            preserveScroll: true,
            onStart: () => {
                if (payNow) {
                    clearStoredCart();
                }
            },
            onSuccess: () => clearStoredCart(),
        });
    };

    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-[60] bg-zinc-900/40 ${open ? '' : 'pointer-events-none opacity-0'}`}
            />
            <aside
                className={`fixed inset-x-0 top-0 z-[70] flex h-dvh w-full flex-col bg-white shadow-2xl transition-transform duration-300 sm:inset-x-auto sm:right-0 sm:max-w-md dark:bg-zinc-950 ${open ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`}
                style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
                aria-hidden={!open}
            >
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-5 sm:py-4 dark:border-zinc-800">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#117846]">Your selection</p>
                        <h2 className="mt-0.5 truncate text-lg font-semibold text-[#002d5b] sm:text-xl">Checkout</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close cart" className="shrink-0 rounded-full border border-zinc-200 p-2.5 hover:bg-zinc-50 dark:border-zinc-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                    {cart.items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                            <ShoppingCart className="h-8 w-8 text-[#117846]" />
                            <p className="mt-4 text-lg font-semibold text-zinc-900">Your cart is empty</p>
                            <p className="mt-1 text-sm text-zinc-500">Add safety gear and request a quote from here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={`${item.product_id}-${item.index}`} className="flex gap-3 rounded-xl border border-zinc-100 p-3 sm:border-0 sm:p-0">
                                    <span className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50 sm:h-20 sm:w-16">
                                        {item.image_path ? (
                                            <img src={item.image_path} alt="" className="h-full w-full object-contain" />
                                        ) : null}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">{item.name}</p>
                                                {item.size && <p className="mt-0.5 text-[11px] text-zinc-500">Size {item.size}</p>}
                                            </div>
                                            <button type="button" onClick={() => remove(item.product_id, item.size)} className="-mr-1 shrink-0 p-1 text-zinc-400 hover:text-red-500" aria-label="Remove">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center rounded-md border border-zinc-200">
                                                <button type="button" onClick={() => setQty(item.product_id, item.size, item.qty - 1)} className="flex h-9 w-9 items-center justify-center hover:bg-zinc-100" aria-label="Decrease">
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-7 text-center text-sm">{item.qty}</span>
                                                <button type="button" onClick={() => setQty(item.product_id, item.size, item.qty + 1)} className="flex h-9 w-9 items-center justify-center hover:bg-zinc-100" aria-label="Increase">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-semibold tabular-nums">{formatPrice(item.line_total)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.items.length > 0 && (
                    <form onSubmit={submit} className="space-y-3 border-t border-zinc-200 px-4 py-4 sm:px-5 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Estimated total</span>
                            <span className="font-semibold tabular-nums">{formatPrice(cart.subtotal)}</span>
                        </div>
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
                                    className="flex h-12 w-full items-center justify-center rounded-lg bg-[#117846] text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#0d6a3d] disabled:opacity-60"
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
                                <Link href={route('login', { order: 1 })} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#117846] text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#0d6a3d]">
                                    Log in to order
                                </Link>
                                <Link href={route('register', { order: 1 })} className="block py-1 text-center text-sm text-[#002d5b] underline">
                                    New here? Create an account
                                </Link>
                            </div>
                        )}
                    </form>
                )}
            </aside>
        </>
    );
}
