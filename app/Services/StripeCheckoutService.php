<?php

namespace App\Services;

use App\Models\Product;
use App\Models\QuoteRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Stripe\Checkout\Session;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;
use Throwable;
use UnexpectedValueException;

class StripeCheckoutService
{
    public function enabled(): bool
    {
        $secret = $this->secretKey();

        return $secret !== '' && (str_starts_with($secret, 'sk_') || str_starts_with($secret, 'rk_'));
    }

    public function webhookConfigured(): bool
    {
        $secret = $this->webhookSecret();

        return $secret !== '' && str_starts_with($secret, 'whsec_');
    }

    public function publishableKey(): string
    {
        return $this->credential('key');
    }

    public function secretKey(): string
    {
        return $this->credential('secret');
    }

    public function webhookSecret(): string
    {
        return $this->credential('webhook_secret');
    }

    public function currency(): string
    {
        $currency = strtolower($this->credential('currency') ?: 'usd');

        return preg_match('/^[a-z]{3}$/', $currency) ? $currency : 'usd';
    }

    public function createSession(QuoteRequest $quote, Request $request): Session
    {
        if (! $this->enabled()) {
            throw new RuntimeException('Card payment is not configured.');
        }

        if ($quote->payment_status === 'paid') {
            throw new RuntimeException('This order is already paid.');
        }

        $lineItems = $this->lineItemsFromCatalog($quote);
        $expectedCents = $this->centsFromLines($lineItems);

        if ($expectedCents < 50) {
            throw new RuntimeException('This order is too small to charge by card.');
        }

        $host = $request->getSchemeAndHttpHost();
        $client = $this->client();

        if ($quote->stripe_checkout_session_id) {
            try {
                $existing = $client->checkout->sessions->retrieve($quote->stripe_checkout_session_id, []);
                if (
                    $existing->status === 'open'
                    && is_string($existing->url)
                    && $existing->url !== ''
                    && (int) $existing->amount_total === $expectedCents
                ) {
                    return $existing;
                }
            } catch (Throwable) {
                // Create a new Checkout Session if the previous one cannot be reused.
            }
        }

        $session = $client->checkout->sessions->create([
            'mode' => 'payment',
            'customer_email' => $quote->email,
            'client_reference_id' => (string) $quote->id,
            'success_url' => $host.'/checkout/success/'.$quote->reference.'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $host.'/checkout/cancel/'.$quote->reference,
            'line_items' => $lineItems,
            'payment_intent_data' => [
                'metadata' => [
                    'quote_id' => (string) $quote->id,
                    'reference' => $quote->reference,
                ],
            ],
            'metadata' => [
                'quote_id' => (string) $quote->id,
                'user_id' => (string) $quote->user_id,
                'reference' => $quote->reference,
            ],
        ], [
            'idempotency_key' => 'clevesol-order-'.$quote->id.'-'.$expectedCents.'-'.($quote->stripe_checkout_session_id ?: 'new'),
        ]);

        $quote->forceFill([
            'payment_status' => 'pending',
            'stripe_checkout_session_id' => $session->id,
            'estimated_total' => number_format($expectedCents / 100, 2, '.', ''),
        ])->save();

        return $session;
    }

    public function confirmFromCheckoutSession(string $sessionId, ?QuoteRequest $expected = null): QuoteRequest
    {
        $session = $this->client()->checkout->sessions->retrieve($sessionId, []);

        $quote = $this->quoteFromSession($session);
        if ($expected && $expected->id !== $quote->id) {
            throw new RuntimeException('This payment does not match the order.');
        }

        if ($session->payment_status !== 'paid' && $session->status !== 'complete') {
            throw new RuntimeException('Payment is not complete.');
        }

        $this->markPaid($quote, $session);

        return $quote->refresh();
    }

    public function handleWebhook(string $payload, string $signature): void
    {
        $secret = $this->webhookSecret();
        if ($secret === '' || ! str_starts_with($secret, 'whsec_')) {
            throw new RuntimeException('Stripe webhook secret is not configured.');
        }

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (UnexpectedValueException|SignatureVerificationException $e) {
            throw $e;
        }

        if ($event->type === 'checkout.session.completed' || $event->type === 'checkout.session.async_payment_succeeded') {
            /** @var Session $session */
            $session = $event->data->object;
            $quote = $this->quoteFromSession($session);
            if ($session->payment_status === 'paid' || $event->type === 'checkout.session.async_payment_succeeded') {
                $this->markPaid($quote, $session);
            }

            return;
        }

        if ($event->type === 'checkout.session.async_payment_failed') {
            /** @var Session $session */
            $session = $event->data->object;
            $quote = $this->quoteFromSession($session);
            if ($quote->payment_status !== 'paid') {
                $quote->update(['payment_status' => 'failed']);
            }
        }
    }

    private function markPaid(QuoteRequest $quote, Session $session): void
    {
        $paidCents = (int) $session->amount_total;
        $expectedCents = (int) round((float) $quote->estimated_total * 100);

        if ($paidCents !== $expectedCents) {
            Log::warning('stripe.amount_mismatch', [
                'quote_id' => $quote->id,
                'reference' => $quote->reference,
            ]);

            throw new RuntimeException('Paid amount does not match this order.');
        }

        DB::transaction(function () use ($quote, $session, $paidCents) {
            /** @var QuoteRequest $locked */
            $locked = QuoteRequest::query()->lockForUpdate()->findOrFail($quote->id);
            if ($locked->payment_status === 'paid') {
                return;
            }

            $intent = $session->payment_intent;
            $locked->forceFill([
                'payment_status' => 'paid',
                'amount_paid_cents' => $paidCents,
                'stripe_checkout_session_id' => $session->id,
                'stripe_payment_intent_id' => is_string($intent) ? $intent : $intent?->id,
                'paid_at' => now(),
            ])->save();
        });
    }

    private function quoteFromSession(Session $session): QuoteRequest
    {
        $quoteId = $session->metadata['quote_id'] ?? $session->client_reference_id;
        $quote = QuoteRequest::query()->find($quoteId);

        if (! $quote) {
            throw new RuntimeException('No order found for this payment.');
        }

        if ($quote->stripe_checkout_session_id && $quote->stripe_checkout_session_id !== $session->id) {
            if ($quote->payment_status === 'paid') {
                return $quote;
            }
        }

        return $quote;
    }

    /**
     * Rebuild Stripe line items from live catalogue prices, not the browser.
     *
     * @return array<int, array{quantity:int, price_data: array{currency:string, unit_amount:int, product_data: array{name:string}}}>
     */
    private function lineItemsFromCatalog(QuoteRequest $quote): array
    {
        $currency = $this->currency();
        $lines = [];

        foreach ($quote->items ?? [] as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $qty = max(1, min(999, (int) ($item['qty'] ?? 1)));
            $product = Product::query()->where('id', $productId)->where('is_published', true)->first();
            if (! $product) {
                throw new RuntimeException('An item in this order is no longer available.');
            }

            $name = $product->name;
            if (! empty($item['size'])) {
                $name .= ' ('.$item['size'].')';
            }

            $lines[] = [
                'quantity' => $qty,
                'price_data' => [
                    'currency' => $currency,
                    'unit_amount' => (int) round((float) $product->price * 100),
                    'product_data' => [
                        'name' => $name,
                    ],
                ],
            ];
        }

        if ($lines === []) {
            throw new RuntimeException('This order has no items to charge.');
        }

        return $lines;
    }

    /**
     * @param  array<int, array{quantity:int, price_data: array{unit_amount:int}}>  $lines
     */
    private function centsFromLines(array $lines): int
    {
        $total = 0;
        foreach ($lines as $line) {
            $total += $line['quantity'] * $line['price_data']['unit_amount'];
        }

        return $total;
    }

    private function client(): StripeClient
    {
        return new StripeClient($this->secretKey());
    }

    private function credential(string $name): string
    {
        $fromSettings = Setting::decrypted('stripe.'.$name);
        if (is_string($fromSettings) && $fromSettings !== '') {
            return $fromSettings;
        }

        return (string) config('services.stripe.'.$name, '');
    }
}
