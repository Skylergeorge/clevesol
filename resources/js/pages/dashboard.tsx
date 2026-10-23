import { appLayout } from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileText, MessagesSquare, Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface Metrics {
    products: number;
    categories: number;
    open_chats: number;
    new_quotes: number;
}

export default function Dashboard({ metrics }: { metrics: Metrics }) {
    const cards = [
        { label: 'Products', value: metrics.products, href: '/admin/catalogue' },
        { label: 'Categories', value: metrics.categories, href: '/admin/catalogue' },
        { label: 'Orders placed', value: metrics.new_quotes, href: '/admin/quotes' },
        { label: 'Open chats', value: metrics.open_chats, href: '/admin/chats' },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Dashboard</h1>
                    <p className="mt-1 text-sm text-zinc-500">Catalogue, quote requests, and customer chats.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            prefetch="mount"
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                        >
                            <div className="text-sm text-zinc-500">{card.label}</div>
                            <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">{card.value}</div>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                    <QuickLink href="/admin/catalogue" title="Manage catalogue" desc="Add, edit, and publish products." icon={Package} />
                    <QuickLink href="/admin/quotes" title="Quote requests" desc="Review requests sent from the shop." icon={FileText} />
                    <QuickLink href="/admin/chats" title="Customer chats" desc="Reply to storefront conversations." icon={MessagesSquare} />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = appLayout;
Dashboard.breadcrumbs = breadcrumbs;

function QuickLink({ href, title, desc, icon: Icon }: { href: string; title: string; desc: string; icon: typeof Package }) {
    return (
        <Link
            href={href}
            prefetch="mount"
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
            <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
            <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</div>
                <div className="text-sm text-zinc-500">{desc}</div>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-zinc-400" />
        </Link>
    );
}
