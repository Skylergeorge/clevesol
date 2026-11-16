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

    public function sync(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|array|max:50',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.qty' => 'required|integer|min:1|max:999',
            'items.*.size' => 'nullable|string|max:40',
        ]);

        $this->cart->replace($data['items']);

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
            return redirect()->guest(route('login', ['order' => 1]));
        }

        $data = $request->validate([
            'company' => 'nullable|string|max:160',
            'message' => 'nullable|string|max:2000',
            'payment_method' => 'required|in:pay_now,pay_on_delivery',
        ]);

        $detailed = $this->cart->detailed();
        if (empty($detailed['items'])) {
            return back(303)->withErrors(['cart' => 'Your cart is empty.']);
        }

        if ($data['payment_method'] === 'pay_now') {
            return app(CheckoutController::class)->payCart($request);
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
            'payment_status' => 'unpaid',
            'payment_method' => 'pay_on_delivery',
        ]);

        $this->cart->clear();

        return redirect()->route('quote.thanks', ['reference' => $quote->reference]);
    }

    public function thanks(Request $request, string $reference): Response
    {
        $quote = QuoteRequest::query()->where('reference', $reference)->first();
        $owned = $quote && $request->user() && (int) $quote->user_id === (int) $request->user()->id;

        return Inertia::render('storefront/quote-thanks', [
            'reference' => $reference,
            'paid' => $owned && $quote->payment_status === 'paid',
            'quoteId' => $owned ? $quote->id : null,
            'status' => $owned ? $quote->status : 'ordered',
            'paymentStatus' => $owned ? ($quote->payment_status ?? 'unpaid') : 'unpaid',
            'paymentMethod' => $owned ? ($quote->payment_method ?? 'pay_on_delivery') : 'pay_on_delivery',
        ]);
    }
}
