import { appLayout } from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
];

interface ShopCategory {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    is_published: boolean;
    sort_order: number;
    products_count: number;
}

export default function Categories({ categories }: { categories: ShopCategory[] }) {
    const form = useForm({ name: '', tagline: '' });

    return (
        <>
            <Head title="Categories" />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-950">Shop categories</h1>
                    <p className="mt-1 text-sm text-zinc-500">Add the categories that should appear in the shop menu. Hide any you do not want shown yet.</p>
                </div>

                <form
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(route('admin.categories.store'), {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        });
                    }}
                >
                    <label className="text-sm text-zinc-600">
                        Name
                        <input
                            required
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="e.g. Head Protection"
                            className="mt-1 block w-64 rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900"
                        />
                    </label>
                    <label className="text-sm text-zinc-600">
                        Short line, optional
                        <input
                            value={form.data.tagline}
                            onChange={(event) => form.setData('tagline', event.target.value)}
                            placeholder="Shown in the shop"
                            className="mt-1 block w-64 rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900"
                        />
                    </label>
                    <button type="submit" disabled={form.processing} className="rounded-lg bg-[#117846] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {form.processing ? 'Adding…' : 'Add category'}
                    </button>
                    {form.errors.name && <p className="w-full text-xs text-red-600">{form.errors.name}</p>}
                </form>

                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                            <tr>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Shop</th>
                                <th className="px-4 py-3">Products</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-4 py-3">
                                        <input
                                            defaultValue={category.name}
                                            className="w-full rounded border border-transparent px-1 py-1 font-medium text-[#102753] outline-none hover:border-zinc-200 focus:border-zinc-300"
                                            onBlur={(event) => {
                                                const name = event.target.value.trim();
                                                if (!name || name === category.name) return;
                                                router.patch(route('admin.categories.update', category.id), { name }, { preserveScroll: true });
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
                                            }}
                                        />
                                        {category.tagline && <div className="px-1 text-xs text-zinc-500">{category.tagline}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.patch(
                                                    route('admin.categories.update', category.id),
                                                    { name: category.name, is_published: !category.is_published },
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium"
                                        >
                                            {category.is_published ? <Eye className="h-3.5 w-3.5 text-[#117846]" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-400" />}
                                            {category.is_published ? 'Shown' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">{category.products_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                                            onClick={() => {
                                                if (category.products_count > 0) {
                                                    alert(`“${category.name}” still has ${category.products_count} products. Move or delete them first.`);
                                                    return;
                                                }
                                                if (confirm(`Remove “${category.name}” from the shop?`)) {
                                                    router.delete(route('admin.categories.destroy', category.id), { preserveScroll: true });
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-500">
                                        No categories yet. Add one above and it will show in the shop.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Categories.layout = appLayout;
