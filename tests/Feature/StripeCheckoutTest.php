<?php

use App\Models\QuoteRequest;
use App\Models\User;

test('stripe webhook rejects a missing signature', function () {
    $this->post('/stripe/webhook', ['type' => 'checkout.session.completed'])
        ->assertStatus(400);
});

test('stripe webhook rejects an invalid signature', function () {
    config(['services.stripe.webhook_secret' => 'whsec_testsecretvalue']);

    $this->call('POST', '/stripe/webhook', [], [], [], [
        'HTTP_STRIPE_SIGNATURE' => 't=1,v1=deadbeef',
        'CONTENT_TYPE' => 'application/json',
    ], '{"id":"evt_test","object":"event","type":"checkout.session.completed","data":{"object":{}}}')
        ->assertStatus(400);
});

test('guests cannot start stripe checkout', function () {
    $this->post(route('checkout.pay'))->assertRedirect();
    $this->assertGuest();
});

test('checkout is refused when stripe is not configured', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('account'))
        ->post(route('checkout.pay'))
        ->assertRedirect(route('account'))
        ->assertSessionHasErrors('cart');
});

test('buyers cannot pay another buyers order', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $quote = QuoteRequest::query()->create([
        'reference' => 'Q-TESTPAY1',
        'user_id' => $owner->id,
        'name' => $owner->name,
        'email' => $owner->email,
        'items' => [],
        'estimated_total' => 10,
        'status' => 'ordered',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($other)
        ->post(route('checkout.payOrder', $quote))
        ->assertForbidden();
});

test('buyers cannot view another buyers checkout success page', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    QuoteRequest::query()->create([
        'reference' => 'Q-TESTOK1',
        'user_id' => $owner->id,
        'name' => $owner->name,
        'email' => $owner->email,
        'items' => [],
        'estimated_total' => 10,
        'status' => 'ordered',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($other)
        ->get(route('checkout.success', 'Q-TESTOK1'))
        ->assertForbidden();
});
