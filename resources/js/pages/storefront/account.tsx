import OrderProgressJourney from '@/components/storefront/order-progress-journey';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { formatPrice } from '@/lib/catalog';
import { Head, Link, useForm } from '@inertiajs/react';

interface QuoteItem {
    name: string;
    qty: number;
    size: string | null;
}

interface AccountQuote {
    id: number;
    reference: string;
    status: string;
    estimated_total: number;
    created_at: string | null;
    items: QuoteItem[];
}

export default function Account({ profile, quotes }: { profile: { name: string; email: string; phone: string | null }; quotes: AccountQuote[] }) {
    const form = useForm({
        name: profile.name,
        phone: profile.phone ?? '',
    });

    return (
        <>
            <Head title="Your account" />
            <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[18rem_1fr]">
                <div className="h-fit rounded-lg border border-zinc-200 bg-white p-5">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(route('account.update'), { preserveScroll: true });
                    }}
                >
                    <h1 className="text-lg font-semibold text-[#002d5b]">Your profile</h1>
                    <label className="mt-4 block text-sm text-[#3d5a73]">
                        Name
                        <input
                            required
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[#002d5b]"
                        />
                    </label>
                    <label className="mt-3 block text-sm text-[#3d5a73]">
                        Email
                        <input value={profile.email} readOnly className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[#002d5b]" />
                    </label>
                    <label className="mt-3 block text-sm text-[#3d5a73]">
                        Phone
                        <input
                            value={form.data.phone}
                            onChange={(event) => form.setData('phone', event.target.value)}
                            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-[#002d5b]"
                        />
                    </label>
                    {form.errors.name && <p className="mt-2 text-xs text-red-600">{form.errors.name}</p>}
                    <button type="submit" disabled={form.processing} className="mt-4 rounded-lg bg-[#117846] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Save profile'}
                    </button>
                </form>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-3 w-full rounded-lg border border-[#102753] px-4 py-2 text-sm font-semibold text-[#102753] hover:bg-[#102753] hover:text-white"
                    >
                        Log out
                    </Link>
                </div>

                <section>
                    <h2 className="text-lg font-semibold text-[#002d5b]">Order progress</h2>
                    {quotes.length === 0 ? (
                        <p className="mt-3 text-sm text-[#3d5a73]">Place an order and its progress will show here.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {quotes.map((quote) => (
                                <article key={quote.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <div className="font-medium text-[#002d5b]">{quote.reference}</div>
                                        <div className="text-sm text-[#3d5a73]">{formatPrice(quote.estimated_total)}</div>
                                    </div>
                                    <div className="mt-1 text-xs text-zinc-500">{quote.created_at}</div>
                                    <OrderProgressJourney status={quote.status} />
                                    <ul className="mt-3 space-y-1 text-sm text-[#002d5b]">
                                        {quote.items.map((item, index) => (
                                            <li key={`${quote.id}-${index}`}>
                                                {item.qty} × {item.name}
                                                {item.size ? ` (${item.size})` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

Account.layout = storefrontLayout;
