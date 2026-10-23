import { storefrontLayout } from '@/layouts/storefront-layout';
import { type NavCategory, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const VALUES = [
    { label: 'Mission', detail: 'Safer workplaces' },
    { label: 'Certified', detail: 'ISO · CE · ANSI · EN' },
    { label: 'Commitment', detail: 'Every crew, every site' },
    { label: 'Washington', detail: 'Everett, WA' },
    { label: 'Supply', detail: 'PPE on the job' },
];

export default function About() {
    const { company, navCategories } = usePage<SharedData>().props;

    return (
        <>
            <Head title="About Us" />

            <section className="bg-white">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
                    <SupplyScene categories={navCategories} />
                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#117846]">{company.tagline}</p>
                        <h1 className="mt-3 max-w-[16ch] text-3xl font-semibold tracking-tight text-[#002d5b] lg:text-[1.7rem] lg:leading-snug">
                            The gear an engineer wears is the gear we supply.
                        </h1>
                        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-zinc-500">
                            Hard hat, safety glasses, respirator, earmuffs, gloves and a hi-vis vest — the kit on this
                            engineer is the catalogue. Clevesol Northwest outfits crews and sites across the USA with
                            the protection the job actually calls for.
                        </p>
                        <Link
                            href={route('shop')}
                            className="mt-8 inline-flex h-11 items-center rounded-full border border-[#002d5b] px-5 text-sm font-medium text-[#002d5b] hover:bg-[#002d5b] hover:text-white"
                        >
                            Shop the catalogue
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 lg:grid-cols-2 lg:gap-16 lg:pb-28">
                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#117846]">About {company.name}</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#002d5b]">Clevesol Northwest</h2>
                        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-zinc-500">
                            A supplier of personal protective equipment, protective clothing, corporate uniforms and
                            safety signage. Practical gear, certified quality, and a team you can reach.
                        </p>
                        <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                            {company.address}
                            <br />
                            {company.phone}
                        </p>
                        <a href={`mailto:${company.email}`} className="mt-6 inline-flex text-sm font-medium text-[#005696] hover:text-[#117846]">
                            {company.email} →
                        </a>
                    </div>
                    <SplitCards companyName={company.name} phone={company.phone} />
                </div>
            </section>
        </>
    );
}

About.layout = storefrontLayout;

function SupplyScene({ categories }: { categories: NavCategory[] }) {
    const rows = categories.slice(0, 5);

    return (
        <div className="relative min-h-[460px] overflow-hidden">
            <span className="pointer-events-none absolute -left-4 -top-2 h-20 w-20 rounded-full bg-[#117846]/15" />
            <span className="pointer-events-none absolute right-[6%] top-1 h-24 w-28 rotate-12 rounded-[60%_40%_55%_45%] border-2 border-dashed border-[#117846]/30" />

            <div className="absolute right-0 top-6 z-[1] w-[58%] max-w-xs overflow-hidden rounded-b-xl bg-white shadow-[0_22px_40px_rgba(0,45,91,.16)]">
                <div className="bg-[#002d5b] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                    What we supply
                </div>
                <ul className="divide-y divide-zinc-100">
                    {rows.map((cat) => (
                        <li key={cat.slug} className="flex items-center gap-3 px-3 py-2">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-white">
                                {cat.image_path ? (
                                    <img src={cat.image_path} alt="" className="h-full w-full object-contain" />
                                ) : null}
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-[13px] font-semibold text-zinc-800">{cat.name}</span>
                                <span className="block text-[11px] text-zinc-400">In stock</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <img
                src="/images/about/engineer.png"
                alt="Engineer wearing a hard hat, safety glasses, earmuffs, hi-vis vest and gloves"
                className="pointer-events-none absolute bottom-0 left-0 z-[2] h-[104%] w-auto max-w-[52%] object-contain object-left-bottom"
            />

            <div className="absolute bottom-6 right-1 z-[3] w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[12px] leading-snug text-zinc-500 shadow-[0_10px_24px_rgba(16,24,40,.12)]">
                <b className="mb-0.5 block text-[12px] text-[#117846]">Certified quality</b>
                ISO · CE · ANSI · EN
            </div>
        </div>
    );
}

function SplitCards({ companyName, phone }: { companyName: string; phone: string }) {
    return (
        <div className="relative min-h-[460px] overflow-hidden">
            <span className="pointer-events-none absolute -right-3 -top-2 h-20 w-20 rounded-full bg-[#002d5b]/10" />

            <div className="absolute left-0 top-8 z-[1] w-[46%]">
                <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-[0_16px_32px_rgba(16,24,40,.1)]">
                    <b className="block text-base text-zinc-900">{companyName}</b>
                    <span className="text-[12px] text-zinc-500">Everett, Washington</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {VALUES.map((item) => (
                        <span
                            key={item.label}
                            className="rounded-full border border-zinc-200 bg-[#f3f6f8] px-2.5 py-1 text-[11px] font-semibold text-[#002d5b]"
                        >
                            {item.label}
                            <em className="ml-1 font-normal text-zinc-400 not-italic">{item.detail}</em>
                        </span>
                    ))}
                </div>
            </div>

            <img
                src="/images/about/supervisor.png"
                alt="Supervisor wearing a white hard hat, safety glasses, a respirator, an orange hi-vis vest and welding gloves"
                className="pointer-events-none absolute bottom-0 right-0 z-[2] h-[108%] w-auto max-w-[50%] object-contain object-right-bottom"
            />

            <div className="absolute bottom-8 left-0 z-[3] w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[12px] leading-snug text-zinc-500 shadow-[0_10px_24px_rgba(16,24,40,.12)]">
                <b className="mb-0.5 block text-[12px] text-zinc-900">Talk to us</b>
                {phone}
            </div>
        </div>
    );
}
