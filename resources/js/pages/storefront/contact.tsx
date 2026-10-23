import { storefrontLayout } from '@/layouts/storefront-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export default function Contact() {
    const { company } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Contact Us" />

            <section className="mx-auto max-w-5xl px-4 py-16">
                <div className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Get in touch</span>
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Let's talk safety</h1>
                    <p className="mt-3 text-zinc-500">Questions, bulk orders or custom corporate kits — we're here to help.</p>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Card icon={Phone} title="Call us" lines={[company.phone]} href={`tel:${company.phone}`} />
                    <Card icon={Mail} title="Email us" lines={[company.email, company.email_alt]} href={`mailto:${company.email}`} />
                    <Card icon={MapPin} title="Visit us" lines={[company.address]} />
                </div>

                <div className="mt-10 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-800 p-8 text-center text-white">
                    <MessageCircle className="mx-auto h-10 w-10 text-yellow-300" />
                    <h2 className="mt-3 text-2xl font-extrabold">Prefer to chat?</h2>
                    <p className="mt-2 text-emerald-50">Use the live chat button in the corner — our safety team typically replies in minutes.</p>
                </div>
            </section>
        </>
    );
}

Contact.layout = storefrontLayout;

function Card({ icon: Icon, title, lines, href }: { icon: typeof Phone; title: string; lines: string[]; href?: string }) {
    const inner = (
        <div className="h-full rounded-2xl border border-zinc-200 p-6 transition hover:shadow-md dark:border-zinc-800">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-bold">{title}</h3>
            {lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{l}</p>
            ))}
        </div>
    );
    return href ? <a href={href}>{inner}</a> : inner;
}
