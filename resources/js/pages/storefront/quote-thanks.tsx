import OrderProgressJourney from '@/components/storefront/order-progress-journey';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { clearStoredCart } from '@/lib/storefront-cart';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

export default function QuoteThanks({
    reference,
    paid = false,
    quoteId = null,
    status = 'ordered',
    paymentStatus = 'unpaid',
    paymentMethod = 'pay_on_delivery',
}: {
    reference: string;
    paid?: boolean;
    quoteId?: number | null;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
}) {
    const { company, paymentsEnabled } = usePage<SharedData>().props;
    const payForm = useForm({});

    useEffect(() => {
        clearStoredCart();
    }, []);

    return (
        <>
            <Head title={paid ? 'Payment confirmed' : 'Order placed'} />
            <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                    <CheckCircle2 className="h-10 w-10" />
                </span>
                <h1 className="mt-6 text-3xl font-extrabold text-[#102753]">{paid ? 'Payment confirmed' : 'Order placed'}</h1>
                <p className="mt-2 text-[#3d5a73]">
                    {paid
                        ? 'Your payment was received. Reference '
                        : paymentMethod === 'pay_on_delivery'
                          ? 'Pay when the order is delivered. Reference '
                          : 'Your order is placed. Reference '}
                    <span className="font-bold text-[#102753]">{reference}</span>.
                </p>
                <div className="mt-6 w-full rounded-xl border border-zinc-200 bg-white px-3 py-4 text-left">
                    <OrderProgressJourney status={status} paymentStatus={paymentStatus} paymentMethod={paymentMethod} />
                </div>
                {paymentsEnabled && paymentMethod === 'pay_now' && !paid && quoteId ? (
                    <button
                        type="button"
                        disabled={payForm.processing}
                        onClick={() => payForm.post(route('checkout.payOrder', quoteId))}
                        className="mt-6 w-full rounded-full bg-[#117846] px-6 py-3 text-sm font-bold text-white hover:bg-[#0d6a3d] disabled:opacity-50"
                    >
                        {payForm.processing ? 'Opening Stripe…' : 'Pay now'}
                    </button>
                ) : null}
                <p className="mt-3 text-sm text-zinc-400">Need it urgently? Call {company.phone}.</p>
                <Link href={route('account')} className="mt-4 text-sm font-semibold text-[#102753] underline">
                    View order progress
                </Link>
            </div>
        </>
    );
}

QuoteThanks.layout = storefrontLayout;
