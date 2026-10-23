<?php

namespace App\Http\Controllers;

use App\Models\QuoteRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private CartService $cart)
    {
    }

    public function index(): RedirectResponse
    {
        return redirect()->route('home')->with('open_cart', (string) now()->getTimestampMs());
    }

    public function add(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'qty' => 'nullable|integer|min:1|max:999',
            'size' => 'nullable|string|max:40',
        ]);

        $this->cart->add($data['product_id'], $data['qty'] ?? 1, $data['size'] ?? null);

        return $this->cartJson();
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|integer',
            'size' => 'nullable|string|max:40',
            'qty' => 'required|integer|min:0|max:999',
        ]);

        $this->cart->setLine($data['product_id'], $data['size'] ?? null, $data['qty']);

        return $this->cartJson();
    }

    public function remove(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|integer',
            'size' => 'nullable|string|max:40',
        ]);

        $this->cart->setLine($data['product_id'], $data['size'] ?? null, 0);

        return $this->cartJson();
    }

    private function cartJson(): JsonResponse
    {
        return response()->json(['cart' => $this->cart->detailed()]);
    }

    public function submitQuote(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(route('register'));
        }

        $data = $request->validate([
            'company' => 'nullable|string|max:160',
            'message' => 'nullable|string|max:2000',
        ]);

        $detailed = $this->cart->detailed();
        if (empty($detailed['items'])) {
            return back(303)->withErrors(['cart' => 'Your cart is empty.']);
        }

        $quote = QuoteRequest::create([
            'reference' => 'Q-'.strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'name' => $user->name,
            'company' => $data['company'] ?? null,
            'email' => $user->email,
            'phone' => $user->phone,
            'message' => $data['message'] ?? null,
            'items' => collect($detailed['items'])->map(fn ($i) => [
                'product_id' => $i['product_id'],
                'name' => $i['name'],
                'qty' => $i['qty'],
                'size' => $i['size'],
                'price' => $i['price'],
            ])->all(),
            'estimated_total' => $detailed['subtotal'],
            'status' => 'ordered',
        ]);

        $this->cart->clear();

        return redirect()->route('quote.thanks', ['reference' => $quote->reference]);
    }

    public function thanks(string $reference): Response
    {
        return Inertia::render('storefront/quote-thanks', [
            'reference' => $reference,
        ]);
    }
}
