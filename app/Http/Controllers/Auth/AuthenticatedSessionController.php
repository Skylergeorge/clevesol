<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'order' => $request->boolean('order'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $cart = app(CartService::class)->raw();

        $request->authenticate();

        $request->session()->regenerate();
        $request->session()->put('clv_cart', $cart);

        return $this->afterAuth($request, $cart, $request->boolean('order'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * @param  array<int, array{product_id:int,qty:int,size:?string}>  $cart
     */
    private function afterAuth(Request $request, array $cart, bool $fromOrder = false): RedirectResponse
    {
        if ($cart !== [] || $fromOrder) {
            return redirect()->route('home')->with('open_cart', (string) now()->getTimestampMs());
        }

        if ($request->user()?->role === 'admin') {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        return redirect()->intended(route('account', absolute: false));
    }
}
