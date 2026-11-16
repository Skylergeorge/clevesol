<?php

namespace App\Http\Controllers;

use App\Models\QuoteRequest;
use App\Services\CartService;
use App\Services\StripeCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Throwable;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService $cart,
        private StripeCheckoutService $stripe,
    ) {}

    public function payCart(Request $request): RedirectResponse|HttpResponse
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(route('login', ['order' => 1]));
        }

        if (! $this->stripe->enabled()) {
            return back(303)->withErrors(['cart' => 'Card payment is not available yet.']);
        }

        $detailed = $this->cart->detailed();
        if (empty($detailed['items'])) {
            return back(303)->withErrors(['cart' => 'Your cart is empty.']);
        }

        $quote = QuoteRequest::create([
            'reference' => 'Q-'.strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
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
            'payment_method' => 'pay_now',
        ]);

        try {
            $session = $this->stripe->createSession($quote, $request);
        } catch (RuntimeException $e) {
            $quote->delete();

            return back(303)->withErrors(['cart' => $e->getMessage()]);
        } catch (Throwable $e) {
            report($e);
            $quote->delete();

            return back(303)->withErrors(['cart' => 'We could not start card payment. Try again.']);
        }

        $this->cart->clear();

        return $this->toStripe($request, (string) $session->url);
    }

    public function payOrder(Request $request, QuoteRequest $quote): RedirectResponse|HttpResponse
    {
        $user = $request->user();
        abort_unless($user && (int) $quote->user_id === (int) $user->id, 403);

        if (! $this->stripe->enabled()) {
            return back(303)->withErrors(['cart' => 'Card payment is not available yet.']);
        }

        if (($quote->payment_method ?? 'pay_now') === 'pay_on_delivery') {
            return back(303)->withErrors(['cart' => 'This order is set to payment after delivery.']);
        }

        if ($quote->payment_status === 'paid') {
            return redirect()->route('checkout.success', $quote->reference);
        }

        try {
            $session = $this->stripe->createSession($quote, $request);
        } catch (RuntimeException $e) {
            return back(303)->withErrors(['cart' => $e->getMessage()]);
        } catch (Throwable $e) {
            report($e);

            return back(303)->withErrors(['cart' => 'We could not start card payment. Try again.']);
        }

        return $this->toStripe($request, (string) $session->url);
    }

    public function success(Request $request, string $reference): Response|RedirectResponse
    {
        $quote = QuoteRequest::query()->where('reference', $reference)->firstOrFail();
        $user = $request->user();
        abort_unless($user && ((int) $quote->user_id === (int) $user->id || $user->isAdmin()), 403);

        $sessionId = (string) $request->query('session_id', '');
        if ($this->stripe->enabled() && $sessionId !== '' && str_starts_with($sessionId, 'cs_')) {
            try {
                $this->stripe->confirmFromCheckoutSession($sessionId, $quote);
                $quote->refresh();
            } catch (Throwable $e) {
                report($e);
            }
        }

        return Inertia::render('storefront/quote-thanks', [
            'reference' => $quote->reference,
            'paid' => $quote->payment_status === 'paid',
            'quoteId' => $quote->id,
            'status' => $quote->status,
            'paymentStatus' => $quote->payment_status ?? 'unpaid',
            'paymentMethod' => $quote->payment_method ?? 'pay_now',
        ]);
    }

    public function cancel(Request $request, string $reference): RedirectResponse
    {
        $quote = QuoteRequest::query()->where('reference', $reference)->first();
        if ($quote && $request->user() && (int) $quote->user_id === (int) $request->user()->id && $quote->payment_status !== 'paid') {
            $quote->update(['payment_status' => 'unpaid']);
        }

        return redirect()->route('account')->with('flash', 'Payment was not completed. Pay now to confirm this order.');
    }

    private function toStripe(Request $request, string $url): HttpResponse
    {
        abort_unless(str_starts_with($url, 'https://checkout.stripe.com/'), 500);

        if ($request->header('X-Inertia')) {
            return Inertia::location($url);
        }

        return redirect()->away($url, HttpResponse::HTTP_SEE_OTHER);
    }
}
