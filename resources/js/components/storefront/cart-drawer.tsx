import { formatPrice } from '@/lib/catalog';
import { useStorefrontCart } from '@/lib/storefront-cart';
import { type SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { auth } = usePage<SharedData>().props;
    const { cart, setQty, remove } = useStorefrontCart();
    const { data, setData, post, processing, errors } = useForm({
        company: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('quote.submit'), { preserveScroll: true });
    };

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-[60] bg-zinc-900/40 ${open ? '' : 'pointer-events-none opacity-0'}`}
            />
            <aside
                className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 ${open ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`}
                aria-hidden={!open}
            >
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#117846]">Your selection</p>
                        <h2 className="mt-1 text-xl font-semibold text-[#002d5b]">Quote cart</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close cart" className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                    {cart.items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <ShoppingCart className="h-8 w-8 text-[#117846]" />
                            <p className="mt-4 text-lg font-semibold text-zinc-900">Your cart is empty</p>
                            <p className="mt-1 text-sm text-zinc-500">Add safety gear and request a quote from here.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {cart.items.map((item) => (
                                <div key={`${item.product_id}-${item.index}`} className="flex gap-3">
                                    <span className="flex h-20 w-16 shrink-0 items-center justify-center bg-zinc-50">
                                        {item.image_path ? (
                                            <img src={item.image_path} alt="" className="h-full w-full object-contain" />
                                        ) : null}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                                                {item.size && <p className="mt-0.5 text-[11px] text-zinc-500">Size {item.size}</p>}
                                            </div>
                                            <button type="button" onClick={() => remove(item.product_id, item.size)} className="text-zinc-400 hover:text-red-500" aria-label="Remove">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <div className="flex items-center border border-zinc-200">
                                                <button type="button" onClick={() => setQty(item.product_id, item.size, item.qty - 1)} className="p-1.5 hover:bg-zinc-100" aria-label="Decrease">
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-7 text-center text-xs">{item.qty}</span>
                                                <button type="button" onClick={() => setQty(item.product_id, item.size, item.qty + 1)} className="p-1.5 hover:bg-zinc-100" aria-label="Increase">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-semibold">{formatPrice(item.line_total)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.items.length > 0 && (
                    <form onSubmit={submit} className="space-y-3 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Estimated total</span>
                            <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
                        </div>
                        {auth.user ? (
                            <>
                                <p className="text-sm text-[#3d5a73]">Ordering as {auth.user.name}. Progress shows on your account after you place this order.</p>
                                <input value={data.company} onChange={(e) => setData('company', e.target.value)} placeholder="Company" className="h-10 w-full border-b border-zinc-200 bg-transparent text-sm outline-none focus:border-[#117846]" />
                                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} rows={2} placeholder="Message" className="w-full resize-none border-b border-zinc-200 bg-transparent py-2 text-sm outline-none focus:border-[#117846]" />
                                {(errors.company || errors.message) && <p className="text-xs text-red-500">{errors.company || errors.message}</p>}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-12 w-full items-center justify-center bg-[#117846] text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#0d6a3d] disabled:opacity-60"
                                >
                                    {processing ? 'Sending…' : 'Place order'}
                                </button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-[#3d5a73]">Register first, then place the order. You’ll follow its progress from your account.</p>
                                <Link href={route('register')} className="flex h-12 w-full items-center justify-center bg-[#117846] text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#0d6a3d]">
                                    Create an account
                                </Link>
                                <Link href={route('login')} className="block text-center text-sm text-[#002d5b] underline">
                                    Already registered? Log in
                                </Link>
                            </div>
                        )}
                    </form>
                )}
            </aside>
        </>
    );
}
