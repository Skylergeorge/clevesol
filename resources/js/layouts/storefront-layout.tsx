import BrandLogo from '@/components/storefront/brand-logo';
import CartDrawer from '@/components/storefront/cart-drawer';
import ChatWidget from '@/components/storefront/chat-widget';
import { StorefrontCartProvider, useStorefrontCart } from '@/lib/storefront-cart';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Mail,
    MapPin,
    Menu,
    Phone,
    Search,
    ShieldCheck,
    ShoppingCart,
    Truck,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState, type PropsWithChildren, type ReactNode } from 'react';

export function storefrontLayout(page: ReactNode) {
    return <StorefrontLayout>{page}</StorefrontLayout>;
}

export default function StorefrontLayout({ children }: PropsWithChildren) {
    return (
        <StorefrontCartProvider>
            <StorefrontFrame>{children}</StorefrontFrame>
        </StorefrontCartProvider>
    );
}

function StorefrontFrame({ children }: PropsWithChildren) {
    const page = usePage<SharedData>();
    const { company, navCategories, auth, flash, openCart } = page.props;
    const accountHref = !auth.user ? route('login') : auth.user.role === 'admin' ? route('dashboard') : route('account');
    const { cart, open: cartOpen, setOpen: setCartOpen } = useStorefrontCart();
    const [catsOpen, setCatsOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.message) {
            setToast(flash.message);
            const t = setTimeout(() => setToast(null), 2600);
            return () => clearTimeout(t);
        }
    }, [flash?.message]);

    useEffect(() => {
        if (openCart) setCartOpen(true);
    }, [openCart]);

    useEffect(() => {
        if (page.url.startsWith('/quote/thanks')) setCartOpen(false);
    }, [page.url]);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('shop'), { q: search }, { preserveState: false });
    };

    return (
        <div className="clv-store min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            {/* Announcement / top bar */}
            <div className="hidden bg-zinc-900 text-zinc-300 lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        ISO · CE · ANSI · EN certified safety equipment
                    </span>
                    <div className="flex items-center gap-5">
                        <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 hover:text-white">
                            <Phone className="h-3.5 w-3.5" /> {company.phone}
                        </a>
                        <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 hover:text-white">
                            <Mail className="h-3.5 w-3.5" /> {company.email}
                        </a>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> {company.address}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
                <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
                    <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
                        <Menu className="h-6 w-6" />
                    </button>

                    <Link href={route('home')} prefetch="mount" className="shrink-0">
                        <BrandLogo />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        <div className="relative" onMouseEnter={() => setCatsOpen(true)} onMouseLeave={() => setCatsOpen(false)}>
                            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Shop by Category
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {catsOpen && (
                                <div className="absolute left-0 top-full z-50 w-80 pt-2">
                                    <div className="overflow-hidden border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                                        {navCategories.map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                href={route('category', cat.slug)}
                                                className="flex items-center gap-3 border-b border-zinc-100 px-3 py-2.5 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                            >
                                                <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-white">
                                                    {cat.image_path ? (
                                                        <img src={cat.image_path} alt="" className="h-full w-full object-contain" />
                                                    ) : null}
                                                </span>
                                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href={route('shop')} prefetch="mount" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            All Products
                        </Link>
                        <Link href={route('about')} prefetch="mount" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            About
                        </Link>
                        <Link href={route('contact')} prefetch="mount" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Contact
                        </Link>
                    </nav>

                    {/* Search */}
                    <form onSubmit={submitSearch} className="ml-auto hidden flex-1 max-w-sm items-center md:flex">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search helmets, gloves, respirators…"
                                className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                            />
                        </div>
                    </form>

                    <div className="ml-auto flex items-center gap-1 md:ml-0">
                        <Link
                            href={accountHref}
                            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            aria-label="Account"
                        >
                            <User className="h-5 w-5" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setCartOpen(true)}
                            className="relative flex h-10 items-center gap-2 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-emerald-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-emerald-500 dark:hover:text-white"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="hidden sm:inline">Cart</span>
                            {cart.count > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-bold text-zinc-900">
                                    {cart.count}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4 dark:bg-zinc-900">
                        <div className="mb-4 flex items-center justify-between">
                            <BrandLogo />
                            <button onClick={() => setMobileOpen(false)}>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={submitSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products…"
                                    className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                />
                            </div>
                        </form>
                        <div className="space-y-1">
                            {navCategories.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={route('category', cat.slug)}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 border-b border-zinc-100 px-1 py-2 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                                >
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-white">
                                        {cat.image_path ? (
                                            <img src={cat.image_path} alt="" className="h-full w-full object-contain" />
                                        ) : null}
                                    </span>
                                    <span className="text-sm font-medium">{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 space-y-1 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                            <Link href={route('shop')} className="block rounded-lg p-2.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">All Products</Link>
                            <Link href={route('about')} className="block rounded-lg p-2.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">About</Link>
                            <Link href={route('contact')} className="block rounded-lg p-2.5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">Contact</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <BrandLogo />
                        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{company.tagline}</p>
                        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            Leading supplier of Personal Protective Equipment, corporate uniforms and safety signage in the USA.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {['ISO', 'CE', 'ANSI', 'EN'].map((c) => (
                                <span key={c} className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Categories</h4>
                        <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {navCategories.slice(0, 6).map((c) => (
                                <li key={c.slug}>
                                    <Link href={route('category', c.slug)} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                        {c.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Company</h4>
                        <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <li><Link href={route('about')} className="hover:text-emerald-600">About Us</Link></li>
                            <li><Link href={route('shop')} className="hover:text-emerald-600">All Products</Link></li>
                            <li><Link href={route('contact')} className="hover:text-emerald-600">Contact</Link></li>
                            <li><button type="button" onClick={() => setCartOpen(true)} className="hover:text-emerald-600">Request a Quote</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Get in touch</h4>
                        <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-600" /> {company.phone}</li>
                            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" /> {company.email}</li>
                            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-emerald-600" /> {company.address}</li>
                            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /> Nationwide delivery</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-zinc-200 py-5 text-center text-xs text-zinc-400 dark:border-zinc-800">
                    © {new Date().getFullYear()} {company.name}. All rights reserved.
                </div>
            </footer>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-zinc-900">
                    {toast}
                </div>
            )}

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            <ChatWidget />
        </div>
    );
}
