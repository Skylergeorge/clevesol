import ProductCard from '@/components/storefront/product-card';
import { storefrontLayout } from '@/layouts/storefront-layout';
import { type ProductCard as ProductCardType, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    icon: string | null;
    accent: string | null;
    products_count: number;
}

interface PageProps {
    categories: Category[];
    featured: ProductCardType[];
    newArrivals: ProductCardType[];
    stats: { products: number; categories: number };
}

export default function Home() {
    const { featured, newArrivals } = usePage<SharedData & PageProps>().props as unknown as PageProps;
    const { company } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Industrial Safety Equipment & PPE" />

            {/* HERO — Walter-style banner: photo full width, copy on the dark left, crew on the right */}
            <section className="relative isolate min-h-[340px] overflow-hidden bg-[#111] text-white lg:min-h-[420px]">
                <img
                    src="/images/hero/site.jpg"
                    alt="Four trades on one site: a carpenter in a hard hat, an electrician in safety glasses, a painter in a respirator, and a supervisor with earmuffs"
                    width={1600}
                    height={900}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-[62%_28%]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 from-0% via-black/45 via-[32%] to-transparent to-[68%]" />
                <div className="relative mx-auto flex min-h-[340px] max-w-7xl flex-col justify-center px-4 pb-20 pt-14 lg:min-h-[420px] lg:pb-24 lg:pt-16">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f4c020]">{company.tagline}</p>
                    <h1 className="mt-3 max-w-[16ch] text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                        Gear that keeps your crew and site safe.
                    </h1>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85">
                        One site. A carpenter, an electrician, a painter and a supervisor — some locked in, one with a
                        small smile. Every one of them is in the gear the job calls for.
                    </p>
                    <div className="mt-7">
                        <HeroActions />
                    </div>
                </div>
            </section>

            {featured.length > 0 && (
                <section className="relative z-10 -mt-14 px-4 sm:px-6 lg:px-10 xl:px-14">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {featured.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {newArrivals.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-16">
                    <SectionHeading eyebrow="Fresh stock" title="New arrivals" href={route('shop', { sort: 'newest' })} linkLabel="See more" />
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {newArrivals.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

Home.layout = storefrontLayout;

function HeroActions() {
    return (
        <div className="flex flex-wrap gap-3">
            <Link
                href={route('shop')}
                className="inline-flex h-11 items-center gap-3 rounded-full bg-[#117846] pl-5 pr-1.5 text-sm font-medium text-white hover:bg-[#0d6a3d]"
            >
                Shop all products
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#117846]">
                    <ArrowRight className="h-4 w-4" />
                </span>
            </Link>
            <Link
                href={route('contact')}
                className="inline-flex h-11 items-center rounded-full border border-white/70 px-5 text-sm font-medium text-white hover:bg-white/10"
            >
                Request a quote
            </Link>
        </div>
    );
}

function SectionHeading({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
    return (
        <div className="flex items-end justify-between">
            <div>
                <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{eyebrow}</span>
                <h2 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h2>
            </div>
            {href && (
                <Link href={href} className="hidden items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-emerald-600 sm:flex dark:text-zinc-300">
                    {linkLabel} <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}
