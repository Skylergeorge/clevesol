import { appLayout } from '@/layouts/app-layout';
import { formatPrice } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, ImagePlus, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Catalogue', href: '/admin/catalogue' },
];

interface AdminProduct {
    id: number;
    name: string;
    subtitle: string | null;
    brand: string | null;
    sku: string | null;
    price: number;
    stock: number;
    badge: string | null;
    description: string | null;
    features: string[];
    certifications: string[];
    sizes: string[];
    sort_order: number;
    is_featured: boolean;
    is_published: boolean;
    category: string | null;
    category_id: number;
    accent: string | null;
    icon: string | null;
    image_path: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    accent: string | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface PageProps {
    products: Paginated<AdminProduct>;
    categories: Category[];
    filters: { q: string; category: string };
    stats: { products: number; categories: number; featured: number; published: number };
}

interface PieceForm {
    category_id: number;
    name: string;
    subtitle: string;
    brand: string;
    sku: string;
    badge: string;
    price: string;
    stock: string;
    sizes: string;
    sort_order: string;
    description: string;
    features: string;
    certifications: string;
    is_featured: boolean;
    is_published: boolean;
    image: File | null;
}

function emptyPiece(categories: Category[]): PieceForm {
    return {
        category_id: categories[0]?.id ?? 0,
        name: '',
        subtitle: '',
        brand: '',
        sku: '',
        badge: '',
        price: '',
        stock: '',
        sizes: '',
        sort_order: '0',
        description: '',
        features: '',
        certifications: '',
        is_featured: false,
        is_published: true,
        image: null,
    };
}

export default function Catalogue({ products, categories, filters, stats }: PageProps) {
    const [q, setQ] = useState(filters.q);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [photoKey, setPhotoKey] = useState(0);
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [photoName, setPhotoName] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const photoRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const form = useForm<PieceForm>(emptyPiece(categories));

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const clearImage = () => {
        form.setData('image', null);
        setPhotoName('');
        setImagePreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return '';
        });
        if (photoRef.current) photoRef.current.value = '';
    };

    const chooseImage = (file: File | null) => {
        if (file && !file.type.startsWith('image/')) {
            form.setError('image', 'Choose a PNG or JPG photo.');
            return;
        }
        if (file && file.size > 4 * 1024 * 1024) {
            form.setError('image', 'Photo must be 4 MB or smaller.');
            return;
        }
        form.clearErrors('image');
        form.setData('image', file);
        setPhotoName(file?.name ?? '');
        setImagePreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return file ? URL.createObjectURL(file) : '';
        });
    };

    const startEdit = (product: AdminProduct) => {
        clearImage();
        setEditingId(product.id);
        setCurrentPhoto(product.image_path);
        form.setData({
            category_id: product.category_id,
            name: product.name,
            subtitle: product.subtitle ?? '',
            brand: product.brand ?? '',
            sku: product.sku ?? '',
            badge: product.badge ?? '',
            price: String(product.price ?? ''),
            stock: product.stock == null ? '' : String(product.stock),
            sizes: (product.sizes || []).join(', '),
            sort_order: String(product.sort_order ?? 0),
            description: product.description ?? '',
            features: (product.features || []).join('\n'),
            certifications: (product.certifications || []).join(', '),
            is_featured: product.is_featured,
            is_published: product.is_published,
            image: null,
        });
        form.clearErrors();
        if (formRef.current) formRef.current.scrollTop = 0;
    };

    const cancelEdit = () => {
        setEditingId(null);
        setCurrentPhoto(null);
        clearImage();
        form.setData(emptyPiece(categories));
        form.clearErrors();
    };

    const savePiece = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                setEditingId(null);
                setCurrentPhoto(null);
                setPhotoName('');
                setPhotoKey((key) => key + 1);
                setImagePreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return '';
                });
                form.setData(emptyPiece(categories));
            },
        };
        if (editingId) {
            form.post(route('admin.products.update', editingId), options);
        } else {
            form.post(route('admin.products.store'), options);
        }
    };

    const setVisible = (product: AdminProduct) => {
        const next = !product.is_published;
        router.patch(
            route('admin.products.visibility', product.id),
            { is_published: next },
            { preserveScroll: true, preserveState: true },
        );
        if (editingId === product.id) {
            form.setData('is_published', next);
        }
    };

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.catalogue'), { q, category: filters.category }, { preserveState: true, preserveScroll: true });
    };

    const field = (key: keyof PieceForm, label: string, required = false) => (
        <label className="mb-3 block text-sm">
            <span className="text-zinc-800 dark:text-zinc-200">{label}</span>
            <input
                required={required}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                value={String(form.data[key] ?? '')}
                onChange={(e) => form.setData(key, e.target.value as never)}
            />
            {form.errors[key] && <span className="mt-1 block text-xs text-red-500">{form.errors[key]}</span>}
        </label>
    );

    return (
        <>
            <Head title="Catalogue" />
            <div className="flex flex-col gap-5 p-4 lg:h-[calc(100svh-4rem)] lg:overflow-hidden">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Products" value={stats.products} />
                    <StatCard label="Categories" value={stats.categories} />
                    <StatCard label="Featured" value={stats.featured} />
                    <StatCard label="Published" value={stats.published} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <form onSubmit={search} className="relative">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search products…"
                            className="w-64 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        />
                    </form>
                    <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={stats.products === 0}
                        onClick={() => {
                            if (confirm(`Remove all ${stats.products} products from the catalogue? This cannot be undone.`)) {
                                setEditingId(null);
                                setCurrentPhoto(null);
                                clearImage();
                                router.delete(route('admin.products.destroyAll'), { preserveScroll: true });
                            }
                        }}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                        Delete all
                    </button>
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            router.get(route('admin.catalogue'), { q, category: e.target.value }, { preserveState: true, preserveScroll: true })
                        }
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    </div>
                </div>

                <div className="grid min-h-0 gap-4 lg:flex-1 lg:grid-cols-2">
                    <form
                        ref={formRef}
                        onSubmit={savePiece}
                        className="rounded-xl border border-zinc-200 bg-white p-5 lg:h-full lg:overflow-y-auto lg:overscroll-contain dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">{editingId ? 'Edit piece' : 'Add a piece'}</h2>
                        {field('name', 'Name', true)}
                        {field('subtitle', 'Subtitle')}
                        <label className="mb-3 block text-sm">
                            <span className="text-zinc-800 dark:text-zinc-200">Category</span>
                            <select
                                required
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', Number(e.target.value))}
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.category_id && <span className="mt-1 block text-xs text-red-500">{form.errors.category_id}</span>}
                        </label>
                        {field('brand', 'Brand')}
                        {field('sku', 'SKU')}
                        {field('badge', 'Badge')}
                        {field('price', 'Price', true)}
                        {field('stock', 'Stock')}
                        {field('sizes', 'Sizes')}
                        {field('sort_order', 'Sort order')}
                        <label className="mb-3 block text-sm">
                            Description
                            <textarea
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                            {form.errors.description && <span className="mt-1 block text-xs text-red-500">{form.errors.description}</span>}
                        </label>
                        <label className="mb-3 block text-sm">
                            Details (one per line)
                            <textarea
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                                rows={3}
                                value={form.data.features}
                                onChange={(e) => form.setData('features', e.target.value)}
                            />
                        </label>
                        {field('certifications', 'Certifications')}
                        <PhotoDrop
                            inputKey={`${editingId || 'new'}-${photoKey}`}
                            inputRef={photoRef}
                            preview={imagePreview}
                            current={currentPhoto}
                            fileName={photoName}
                            dragOver={dragOver}
                            error={form.errors.image}
                            onChoose={chooseImage}
                            onClear={clearImage}
                            onDragOver={(over) => setDragOver(over)}
                        />
                        <label className="mb-2 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.is_published}
                                onChange={(e) => form.setData('is_published', e.target.checked)}
                            />
                            Show on the shop
                        </label>
                        {!form.data.is_published && (
                            <p className="mb-3 text-xs text-zinc-500">Hidden pieces stay in the catalogue, but the public site does not list them.</p>
                        )}
                        <label className="mb-4 flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.is_featured}
                                onChange={(e) => form.setData('is_featured', e.target.checked)}
                            />
                            Featured
                        </label>
                        <div className="flex gap-2">
                            <button
                                disabled={form.processing}
                                className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
                                type="submit"
                            >
                                {form.processing ? 'Saving…' : 'Save piece'}
                            </button>
                            {editingId && (
                                <button type="button" className="px-4 py-2" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="space-y-3 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
                        {products.data.map((product) => (
                            <div key={product.id} className="flex justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex min-w-0 gap-3">
                                    {product.image_path ? (
                                        <img src={product.image_path} alt="" className="h-16 w-14 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 object-cover" />
                                    ) : (
                                        <div className="h-16 w-14 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                                    )}
                                    <div className="min-w-0">
                                        <div className="font-medium text-zinc-950 dark:text-zinc-50">{product.name}</div>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {product.category} · {formatPrice(product.price)}
                                            {product.stock == null ? '' : ` · ${product.stock} in stock`}
                                            {' · '}
                                            {product.is_published ? 'On the shop' : 'Hidden from the shop'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-start gap-1">
                                    <button
                                        type="button"
                                        title={product.is_published ? 'Hide from the shop' : 'Show on the shop'}
                                        className={cn(
                                            'rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                            product.is_published ? 'text-emerald-800' : 'text-zinc-400 hover:text-emerald-800',
                                        )}
                                        onClick={() => setVisible(product)}
                                    >
                                        {product.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        title="Edit"
                                        className="rounded p-2 text-zinc-500 hover:bg-zinc-100 hover:text-emerald-800 dark:hover:bg-zinc-800"
                                        onClick={() => startEdit(product)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete"
                                        className="rounded p-2 text-zinc-500 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => {
                                            if (confirm(`Remove "${product.name}" from the shop? This cannot be undone.`)) {
                                                if (editingId === product.id) cancelEdit();
                                                router.delete(route('admin.products.destroy', product.id), { preserveScroll: true });
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {products.data.length === 0 && <p className="px-2 py-8 text-center text-sm text-zinc-500">No products found.</p>}
                        {products.links.length > 3 && (
                            <div className="flex flex-wrap justify-center gap-1 pt-2">
                                {products.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                        className={cn(
                                            'min-w-9 rounded-lg px-3 py-2 text-sm',
                                            link.active ? 'bg-emerald-700 text-white' : 'hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Catalogue.layout = appLayout;
Catalogue.breadcrumbs = breadcrumbs;

function PhotoDrop({
    inputKey,
    inputRef,
    preview,
    current,
    fileName,
    dragOver,
    error,
    onChoose,
    onClear,
    onDragOver,
}: {
    inputKey: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    preview: string;
    current: string | null;
    fileName: string;
    dragOver: boolean;
    error?: string;
    onChoose: (file: File | null) => void;
    onClear: () => void;
    onDragOver: (over: boolean) => void;
}) {
    const shown = preview || current || '';
    const openPicker = () => inputRef.current?.click();

    return (
        <div className="mb-4">
            <span className="text-sm text-zinc-800 dark:text-zinc-200">Photo</span>
            <input
                key={inputKey}
                ref={inputRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => onChoose(e.target.files?.[0] || null)}
            />
            <div
                role="button"
                tabIndex={0}
                onClick={openPicker}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openPicker();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver(true);
                }}
                onDragLeave={() => onDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    onDragOver(false);
                    onChoose(e.dataTransfer.files?.[0] || null);
                }}
                className={cn(
                    'mt-1 flex w-full overflow-hidden rounded-xl border border-dashed text-left transition',
                    shown ? 'relative h-52' : 'h-40 items-center justify-center',
                    dragOver
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 dark:bg-emerald-950/40'
                        : 'border-zinc-300 bg-zinc-50 hover:border-emerald-600 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-emerald-500',
                )}
            >
                {shown ? (
                    <>
                        <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
                        <div className="relative flex h-full w-full items-end justify-between gap-3 p-3 text-white">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{preview ? fileName || 'New photo' : 'Current photo'}</p>
                                <p className="text-xs text-white/80">
                                    {dragOver ? 'Drop to replace' : preview ? 'This photo will be saved' : 'Drop a new photo to replace it'}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">Replace</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center px-6 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <ImagePlus className="h-5 w-5" />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {dragOver ? 'Drop the photo' : 'Drop a photo here, or browse'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">PNG, JPG, or WebP, up to 4 MB</p>
                    </div>
                )}
            </div>
            {preview && (
                <button type="button" onClick={onClear} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                    Remove new photo
                </button>
            )}
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
        </div>
    );
}
