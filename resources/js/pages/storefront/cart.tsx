import ProductMedia from '@/components/storefront/product-media';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { useStorefrontCart } from '@/lib/storefront-cart';
import { formatPrice } from '@/lib/catalog';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
    const { auth } = usePage<SharedData>().props;
    const { cart, setQty, remove } = useStorefrontCart();

    const { data, setData, post, processing, errors } = useForm({
        company: '',
        message: '',
    });

    const updateQty = (productId: number, size: string | null, qty: number) => {
        setQty(productId, size, qty);
    };

    const removeItem = (productId: number, size: string | null) => {
        remove(productId, size);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('quote.submit'));
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
                            <h2 className="font-bold text-[#002d5b]">Place order</h2>
                            {auth.user ? (
                                <>
                                    <p className="text-sm text-[#3d5a73]">Ordering as {auth.user.name}. Progress shows on your account after you place this order.</p>
                                    <Field label="Company" error={errors.company}>
                                        <input value={data.company} onChange={(e) => setData('company', e.target.value)} className="clv-input" />
                                    </Field>
                                    <Field label="Message" error={errors.message}>
                                        <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} rows={3} className="clv-input resize-none" placeholder="Delivery timeline, sizes, special requirements…" />
                                    </Field>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded-lg bg-[#117846] py-3 text-sm font-bold text-white transition hover:bg-[#0d6a3d] disabled:opacity-50"
                                    >
                                        {processing ? 'Sending…' : 'Place order'}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-[#3d5a73]">Register first, then place the order. You’ll follow its progress from your account.</p>
                                    <Link href={route('register')} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#117846] text-sm font-bold text-white hover:bg-[#0d6a3d]">
                                        Create an account
                                    </Link>
                                    <Link href={route('login')} className="block text-center text-sm text-[#002d5b] underline">
                                        Already registered? Log in
                                    </Link>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <style>{`.clv-input{width:100%;border-radius:0.5rem;border:1px solid rgb(228 228 231);padding:0.5rem 0.75rem;font-size:0.875rem;outline:none;background:transparent}.clv-input:focus{border-color:#10b981}.dark .clv-input{border-color:rgb(63 63 70)}`}</style>
        </>
    );
}

CartPage.layout = storefrontLayout;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
            {children}
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </label>
    );
}
