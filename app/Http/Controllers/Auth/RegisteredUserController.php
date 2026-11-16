<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/register', [
            'order' => $request->boolean('order'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'nullable|string|max:40',
            'password' => ['required', 'string', 'min:4', 'max:255', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => 'buyer',
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        $cart = app(CartService::class)->raw();

        Auth::login($user);

        $request->session()->regenerate();
        $request->session()->put('clv_cart', $cart);

        if ($cart !== [] || $request->boolean('order')) {
            return redirect()->route('home')->with('open_cart', (string) now()->getTimestampMs());
        }

        return to_route('account');
    }
}
