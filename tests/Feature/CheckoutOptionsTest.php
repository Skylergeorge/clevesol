<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Services\StripeCheckoutService;

function publishedProduct(): Product
{
    $category = Category::query()->create([
        'name' => 'Head Protection',
        'slug' => 'head-protection-test',
        'is_published' => true,
    ]);

    return Product::query()->create([
        'category_id' => $category->id,
        'name' => 'Helmet',
        'slug' => 'helmet-test',
        'price' => 42,
        'is_published' => true,
    ]);
}

test('payment after delivery places an order without charging', function () {
    $user = User::factory()->create();
    $product = publishedProduct();

    $this->actingAs($user)
        ->withSession(['clv_cart' => [['product_id' => $product->id, 'qty' => 1, 'size' => null]]])
        ->post(route('quote.submit'), ['payment_method' => 'pay_on_delivery'])
        ->assertRedirect();

    $quote = QuoteRequest::query()->first();
    expect($quote)->not->toBeNull()
        ->and($quote->payment_method)->toBe('pay_on_delivery')
        ->and($quote->payment_status)->toBe('unpaid')
        ->and($quote->status)->toBe('ordered');
});

test('pay after delivery orders can be processed before they are paid', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $quote = QuoteRequest::query()->create([
        'reference' => 'Q-COD1',
        'user_id' => $admin->id,
        'name' => $admin->name,
        'email' => $admin->email,
        'items' => [],
        'estimated_total' => 42,
        'status' => 'ordered',
        'payment_status' => 'unpaid',
        'payment_method' => 'pay_on_delivery',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.quotes.update', $quote), ['status' => 'contacted'])
        ->assertRedirect();

    expect($quote->fresh()->status)->toBe('contacted');
});

test('card orders cannot be paid through the delivery path', function () {
    $user = User::factory()->create();
    $quote = QuoteRequest::query()->create([
        'reference' => 'Q-COD2',
        'user_id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'items' => [],
        'estimated_total' => 42,
        'status' => 'ordered',
        'payment_status' => 'unpaid',
        'payment_method' => 'pay_on_delivery',
    ]);

    $this->mock(StripeCheckoutService::class, function ($mock) {
        $mock->shouldReceive('enabled')->andReturn(true);
    });

    $this->actingAs($user)
        ->from(route('account'))
        ->post(route('checkout.payOrder', $quote))
        ->assertRedirect(route('account'))
        ->assertSessionHasErrors('cart');
});
