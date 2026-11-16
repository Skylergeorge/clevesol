<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\StripeCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingsController extends Controller
{
    public function edit(StripeCheckoutService $stripe): Response
    {
        $publishable = $stripe->publishableKey();
        $secret = $stripe->secretKey();
        $webhook = $stripe->webhookSecret();

        return Inertia::render('admin/payments', [
            'paymentsEnabled' => $stripe->enabled(),
            'webhookReady' => $stripe->webhookConfigured(),
            'currency' => $stripe->currency(),
            'publishableHint' => $this->hint($publishable),
            'secretConfigured' => $secret !== '',
            'webhookConfigured' => $webhook !== '',
        ]);
    }

    public function docs(): Response
    {
        $appUrl = rtrim((string) config('app.url'), '/');

        return Inertia::render('admin/payments-docs', [
            'appUrl' => $appUrl,
            'webhookUrl' => $appUrl.'/stripe/webhook',
        ]);
    }

    public function update(Request $request, StripeCheckoutService $stripe): RedirectResponse
    {
        $data = $request->validate([
            'publishable_key' => ['nullable', 'string', 'max:255', 'regex:/^pk_(test|live)_/'],
            'secret_key' => ['nullable', 'string', 'max:255', 'regex:/^sk_(test|live)_/'],
            'webhook_secret' => ['nullable', 'string', 'max:255', 'regex:/^whsec_/'],
            'currency' => ['required', 'string', 'size:3', 'regex:/^[a-z]{3}$/'],
        ]);

        if (filled($data['publishable_key'] ?? null)) {
            Setting::putEncrypted('stripe.key', trim($data['publishable_key']));
        }

        if (filled($data['secret_key'] ?? null)) {
            Setting::putEncrypted('stripe.secret', trim($data['secret_key']));
        }

        if (filled($data['webhook_secret'] ?? null)) {
            Setting::putEncrypted('stripe.webhook_secret', trim($data['webhook_secret']));
        }

        Setting::putEncrypted('stripe.currency', strtolower($data['currency']));

        $message = $stripe->enabled()
            ? 'Stripe payment settings saved. Card checkout is on.'
            : 'Settings saved. Add a secret key starting with sk_ to turn on card checkout.';

        return back(303)->with('flash', $message);
    }

    private function hint(?string $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        $tail = substr($value, -4);

        return '••••'.$tail;
    }
}
