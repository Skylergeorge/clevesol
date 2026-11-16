import { appLayout } from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payments', href: '/admin/payments' },
];

interface PaymentSettings {
    paymentsEnabled: boolean;
    webhookReady: boolean;
    currency: string;
    publishableHint: string | null;
    secretConfigured: boolean;
    webhookConfigured: boolean;
}

export default function Payments({
    paymentsEnabled,
    webhookReady,
    currency,
    publishableHint,
    secretConfigured,
    webhookConfigured,
}: PaymentSettings) {
    const flash = usePage().props.flash as { message?: string } | undefined;
    const form = useForm({
        publishable_key: '',
        secret_key: '',
        webhook_secret: '',
        currency,
    });

    return (
        <>
            <Head title="Payments" />
            <div className="flex h-full flex-1 flex-col gap-5 p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Stripe payments</h1>
                    <a
                        href={route('admin.payments.docs')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#102753] underline-offset-2 hover:underline"
                    >
                        <BookOpen className="h-4 w-4" />
                        Docs
                    </a>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <StatusCard
                        ok={paymentsEnabled}
                        label="Card checkout"
                        detail={paymentsEnabled ? 'On — buyers can pay now' : 'Off — add a secret key'}
                    />
                    <StatusCard
                        ok={webhookReady}
                        label="Payment webhooks"
                        detail={webhookReady ? 'Signing secret saved' : 'Add the webhook signing secret'}
                    />
                </div>

                {flash?.message ? <p className="text-sm text-emerald-700">{flash.message}</p> : null}

                <form
                    className="flex flex-1 flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(route('admin.payments.update'), {
                            preserveScroll: true,
                            onSuccess: () => form.setData({ publishable_key: '', secret_key: '', webhook_secret: '', currency: form.data.currency }),
                        });
                    }}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Publishable key
                            <input
                                value={form.data.publishable_key}
                                onChange={(event) => form.setData('publishable_key', event.target.value)}
                                autoComplete="off"
                                placeholder={publishableHint ? `Saved ${publishableHint}` : 'pk_test_...'}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.publishable_key ? <p className="mt-1 text-xs text-red-600">{form.errors.publishable_key}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Secret key
                            <input
                                type="password"
                                value={form.data.secret_key}
                                onChange={(event) => form.setData('secret_key', event.target.value)}
                                autoComplete="new-password"
                                placeholder={secretConfigured ? 'Saved — leave blank to keep' : 'sk_test_... or rk_test_...'}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.secret_key ? <p className="mt-1 text-xs text-red-600">{form.errors.secret_key}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Webhook signing secret
                            <input
                                type="password"
                                value={form.data.webhook_secret}
                                onChange={(event) => form.setData('webhook_secret', event.target.value)}
                                autoComplete="new-password"
                                placeholder={webhookConfigured ? 'Saved — leave blank to keep' : 'whsec_...'}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            />
                            {form.errors.webhook_secret ? <p className="mt-1 text-xs text-red-600">{form.errors.webhook_secret}</p> : null}
                        </label>

                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Currency
                            <select
                                value={form.data.currency}
                                onChange={(event) => form.setData('currency', event.target.value)}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                            >
                                {['usd', 'eur', 'gbp', 'cad', 'kes', 'ngn', 'ghs', 'zar', 'aed'].map((code) => (
                                    <option key={code} value={code}>
                                        {code.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            {form.errors.currency ? <p className="mt-1 text-xs text-red-600">{form.errors.currency}</p> : null}
                        </label>
                    </div>

                    <div className="mt-auto flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-[#102753] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {form.processing ? 'Saving…' : 'Save payment settings'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Payments.layout = appLayout;
Payments.breadcrumbs = breadcrumbs;

function StatusCard({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`text-xs font-semibold uppercase tracking-wide ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>{ok ? 'Ready' : 'Needed'}</div>
            <div className="mt-1 font-semibold">{label}</div>
            <div className="mt-1 text-sm text-zinc-500">{detail}</div>
        </div>
    );
}
