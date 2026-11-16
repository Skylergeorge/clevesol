import { appLayout } from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payments', href: '/admin/payments' },
    { title: 'Docs', href: '/admin/payments/docs' },
];

export default function PaymentsDocs({ appUrl, webhookUrl }: { appUrl: string; webhookUrl: string }) {
    return (
        <>
            <Head title="Stripe docs" />
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-4">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Stripe docs</h1>
                    <p className="mt-1 text-sm text-zinc-500">What to copy from the Stripe Dashboard into Payments.</p>
                </div>

                <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <ol className="list-decimal space-y-4 pl-4 text-zinc-700 dark:text-zinc-300">
                        <li>
                            Open <span className="font-medium text-zinc-900 dark:text-zinc-100">Developers → API keys</span> and copy the publishable key
                            and secret key into Payments.
                        </li>
                        <li>
                            Open <span className="font-medium text-zinc-900 dark:text-zinc-100">Developers → Webhooks</span>, add an endpoint, and set
                            the endpoint URL to your app:
                            <span className="mt-2 block break-all rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                                {webhookUrl}
                            </span>
                            <span className="mt-1 block text-xs text-zinc-500">App URL: {appUrl}</span>
                        </li>
                        <li>Copy that endpoint’s signing secret into Webhook signing secret on Payments, then save.</li>
                    </ol>
                </div>
            </div>
        </>
    );
}

PaymentsDocs.layout = appLayout;
PaymentsDocs.breadcrumbs = breadcrumbs;
