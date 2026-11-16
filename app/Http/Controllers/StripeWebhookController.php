<?php

namespace App\Http\Controllers;

use App\Services\StripeCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function __construct(private StripeCheckoutService $stripe) {}

    public function handle(Request $request): Response
    {
        $signature = (string) $request->header('Stripe-Signature', '');
        if ($signature === '') {
            return response('Missing signature', 400);
        }

        try {
            $this->stripe->handleWebhook($request->getContent(), $signature);
        } catch (UnexpectedValueException|SignatureVerificationException) {
            return response('Invalid payload', 400);
        }

        return response('ok', 200);
    }
}
