<?php

use App\Models\Setting;
use App\Models\User;
use App\Services\StripeCheckoutService;
use Inertia\Testing\AssertableInertia as Assert;

test('buyers cannot open payment settings', function () {
    $buyer = User::factory()->create(['role' => 'buyer']);

    $this->actingAs($buyer)
        ->get(route('admin.payments'))
        ->assertRedirect(route('account'));
});

test('admins can open payment settings without seeing secrets', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Setting::putEncrypted('stripe.secret', 'sk_test_supersecretvalue');

    $this->actingAs($admin)
        ->get(route('admin.payments'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/payments', false)
            ->where('secretConfigured', true)
            ->missing('secret_key')
            ->etc())
        ->assertDontSee('sk_test_supersecretvalue');
});

test('admins can save stripe keys from the dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->from(route('admin.payments'))
        ->put(route('admin.payments.update'), [
            'publishable_key' => 'pk_test_publishablevalue',
            'secret_key' => 'sk_test_secretvalue123',
            'webhook_secret' => 'whsec_webhookvalue123',
            'currency' => 'usd',
        ])
        ->assertRedirect(route('admin.payments'));

    expect(Setting::decrypted('stripe.secret'))->toBe('sk_test_secretvalue123');
    expect(app(StripeCheckoutService::class)->enabled())->toBeTrue();
    expect(app(StripeCheckoutService::class)->webhookConfigured())->toBeTrue();
});

test('admins can save a restricted stripe secret key', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->from(route('admin.payments'))
        ->put(route('admin.payments.update'), [
            'secret_key' => 'rk_test_restrictedsecretvalue',
            'currency' => 'usd',
        ])
        ->assertRedirect(route('admin.payments'));

    expect(Setting::decrypted('stripe.secret'))->toBe('rk_test_restrictedsecretvalue');
    expect(app(StripeCheckoutService::class)->enabled())->toBeTrue();
});

test('invalid stripe keys are rejected', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->from(route('admin.payments'))
        ->put(route('admin.payments.update'), [
            'publishable_key' => 'not-a-key',
            'secret_key' => 'password',
            'webhook_secret' => 'secret',
            'currency' => 'usd',
        ])
        ->assertSessionHasErrors(['publishable_key', 'secret_key', 'webhook_secret']);
});
