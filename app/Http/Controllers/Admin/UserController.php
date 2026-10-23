<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::query()->orderByDesc('id')->get(['id', 'name', 'email', 'phone', 'role', 'created_at']);

        return Inertia::render('admin/users', [
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at?->toDateString(),
            ]),
            'buyerCount' => $users->where('role', 'buyer')->count(),
        ]);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->role === 'admin' || $user->id === $request->user()->id) {
            return back(303)->with('flash', 'Admin accounts stay in place.');
        }

        $user->delete();

        return back(303)->with('flash', 'User removed.');
    }

    public function destroyAll(Request $request): RedirectResponse
    {
        User::query()
            ->where('role', 'buyer')
            ->where('id', '!=', $request->user()->id)
            ->delete();

        return back(303)->with('flash', 'Buyer accounts cleared.');
    }
};
