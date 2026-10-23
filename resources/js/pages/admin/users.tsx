import { appLayout } from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

interface AccountUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    created_at: string | null;
}

export default function Users({ users, buyerCount }: { users: AccountUser[]; buyerCount: number }) {
    return (
        <>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold text-zinc-950">Users</h1>
                    <button
                        type="button"
                        disabled={buyerCount === 0}
                        onClick={() => {
                            if (confirm(`Remove all ${buyerCount} buyer accounts? Admin accounts stay.`)) {
                                router.delete(route('admin.users.destroyAll'), { preserveScroll: true });
                            }
                        }}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40"
                    >
                        Delete all
                    </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-zinc-200 text-left text-zinc-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-zinc-100 last:border-0">
                                    <td className="px-4 py-3 font-medium text-zinc-950">{user.name}</td>
                                    <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                                    <td className="px-4 py-3 text-zinc-600">{user.phone || '—'}</td>
                                    <td className="px-4 py-3 capitalize text-zinc-600">{user.role}</td>
                                    <td className="px-4 py-3 text-right">
                                        {user.role === 'buyer' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(`Remove ${user.name}?`)) {
                                                        router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
                                                    }
                                                }}
                                                className="text-sm text-red-700 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Users.layout = appLayout;
Users.breadcrumbs = breadcrumbs;
