import OrderProgressJourney, { ORDER_STAGES } from '@/components/storefront/order-progress-journey';
import { appLayout } from '@/layouts/app-layout';
import { formatPrice } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Fragment, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quote Requests', href: '/admin/quotes' },
];

interface QuoteItem {
    product_id: number;
    name: string;
    qty: number;
    size: string | null;
    price: number;
}

interface Quote {
    id: number;
    reference: string;
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    message: string | null;
    items: QuoteItem[];
    estimated_total: number;
    status: string;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

const STATUSES = [...ORDER_STAGES.map((stage) => ({ value: stage.key, label: stage.label })), { value: 'cancelled', label: 'Cancelled' }];

export default function Quotes({ quotes, stats }: { quotes: Paginated<Quote>; stats: { new: number; total: number } }) {
    const [open, setOpen] = useState<number | null>(null);

    const setStatus = (quote: Quote, status: string) => {
        router.patch(route('admin.quotes.update', quote.id), { status }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Quote Requests" />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="text-2xl font-extrabold">{stats.new}</div>
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Orders placed</div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="text-2xl font-extrabold">{stats.total}</div>
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Total requests</div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
                            <tr>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Est. total</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {quotes.data.map((q) => (
                                <Fragment key={q.id}>
                                    <tr className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50" onClick={() => setOpen(open === q.id ? null : q.id)}>
                                        <td className="px-4 py-3 font-mono font-semibold text-emerald-600">{q.reference}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">{q.name}</div>
                                            <div className="text-xs text-zinc-500">{q.company ?? q.email}</div>
                                        </td>
                                        <td className="px-4 py-3">{q.items.length}</td>
                                        <td className="px-4 py-3 font-semibold">{formatPrice(q.estimated_total)}</td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={q.status}
                                                onChange={(e) => setStatus(q, e.target.value)}
                                                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none"
                                            >
                                                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                    {open === q.id && (
                                        <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                                            <td colSpan={5} className="px-4 py-4">
                                                <OrderProgressJourney status={q.status} compact />
                                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <h4 className="mb-2 text-xs font-bold uppercase text-zinc-500">Contact</h4>
                                                        <p className="text-sm">{q.email}</p>
                                                        {q.phone && <p className="text-sm">{q.phone}</p>}
                                                        {q.message && <p className="mt-2 rounded-lg bg-white p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{q.message}</p>}
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-2 text-xs font-bold uppercase text-zinc-500">Items</h4>
                                                        <ul className="space-y-1 text-sm">
                                                            {q.items.map((it, i) => (
                                                                <li key={i} className="flex justify-between">
                                                                    <span>{it.qty}× {it.name}{it.size ? ` (${it.size})` : ''}</span>
                                                                    <span className="font-semibold">{formatPrice(it.price * it.qty)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                            {quotes.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-16 text-center text-zinc-500">
                                        <FileText className="mx-auto h-10 w-10 text-zinc-300" />
                                        <p className="mt-3">No quote requests yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {quotes.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {quotes.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                className={cn('min-w-9 rounded-lg px-3 py-2 text-sm', link.active ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Quotes.layout = appLayout;
Quotes.breadcrumbs = breadcrumbs;
