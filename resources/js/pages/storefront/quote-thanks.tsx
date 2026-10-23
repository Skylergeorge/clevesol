import { storefrontLayout } from '@/layouts/storefront-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

export default function QuoteThanks({ reference }: { reference: string }) {
    const { company } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Quote Request Received" />
            <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                    <CheckCircle2 className="h-10 w-10" />
                </span>
                <h1 className="mt-6 text-3xl font-extrabold text-[#102753]">Order placed</h1>
                <p className="mt-2 text-[#3d5a73]">
                    Your order is placed. Reference{' '}
                    <span className="font-bold text-[#102753]">{reference}</span>. Follow it from Ordered through Delivered on your account.
                </p>
                <p className="mt-2 text-sm text-zinc-400">Need it urgently? Call {company.phone}.</p>
                <Link href={route('account')} className="mt-8 rounded-full bg-[#117846] px-6 py-3 text-sm font-bold text-white hover:bg-[#0d6a3d]">
                    View order progress
                </Link>
            </div>
        </>
    );
}

QuoteThanks.layout = storefrontLayout;
