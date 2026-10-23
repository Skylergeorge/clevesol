<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\CatalogueController;
use App\Http\Controllers\Admin\ChatController as AdminChatController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public storefront
|--------------------------------------------------------------------------
*/
Route::get('/', [StorefrontController::class, 'home'])->name('home');
Route::get('/shop', [StorefrontController::class, 'shop'])->name('shop');
Route::get('/about', [StorefrontController::class, 'about'])->name('about');
Route::get('/contact', [StorefrontController::class, 'contact'])->name('contact');
Route::get('/category/{category:slug}', [StorefrontController::class, 'category'])->name('category');
Route::get('/product/{product:slug}', [StorefrontController::class, 'product'])->name('product');

// Cart + quote
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/line', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/line', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/quote', [CartController::class, 'submitQuote'])->name('quote.submit');
Route::get('/quote/thanks/{reference}', [CartController::class, 'thanks'])->name('quote.thanks');

// Visitor live chat (JSON, polled by the floating widget)
Route::prefix('chat')->name('chat.')->group(function () {
    Route::get('/', [ChatController::class, 'show'])->name('show');
    Route::post('/', [ChatController::class, 'send'])->name('send')->middleware('throttle:30,1');
    Route::post('/typing', [ChatController::class, 'typing'])->name('typing')->middleware('throttle:120,1');
});

/*
|--------------------------------------------------------------------------
| Staff / admin
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/account', [AccountController::class, 'show'])->name('account');
    Route::patch('/account', [AccountController::class, 'update'])->name('account.update');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'metrics' => [
                'products' => \App\Models\Product::count(),
                'categories' => \App\Models\Category::count(),
                'open_chats' => \App\Models\StorefrontChat::where('status', 'open')->count(),
                'new_quotes' => \App\Models\QuoteRequest::where('status', 'ordered')->count(),
            ],
        ]);
    })->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        // Catalogue management
        Route::get('/catalogue', [CatalogueController::class, 'index'])->name('catalogue');
        Route::post('/products', [CatalogueController::class, 'store'])->name('products.store');
        Route::delete('/products', [CatalogueController::class, 'destroyAll'])->name('products.destroyAll');
        Route::match(['put', 'patch', 'post'], '/products/{product:id}', [CatalogueController::class, 'update'])->name('products.update');
        Route::patch('/products/{product:id}/visibility', [CatalogueController::class, 'visibility'])->name('products.visibility');
        Route::delete('/products/{product:id}', [CatalogueController::class, 'destroy'])->name('products.destroy');
        Route::post('/categories', [CatalogueController::class, 'storeCategory'])->name('categories.store');

        // Quote requests
        Route::get('/quotes', [QuoteController::class, 'index'])->name('quotes');
        Route::patch('/quotes/{quote}', [QuoteController::class, 'update'])->name('quotes.update');

        // Chat inbox (page + JSON for polling)
        Route::get('/chats', [AdminChatController::class, 'page'])->name('chats');
        Route::get('/chats/list', [AdminChatController::class, 'index'])->name('chats.list');
        Route::get('/chats/{id}', [AdminChatController::class, 'show'])->name('chats.show');
        Route::post('/chats/{id}/reply', [AdminChatController::class, 'reply'])->name('chats.reply')->middleware('throttle:60,1');
        Route::delete('/chats/{id}', [AdminChatController::class, 'close'])->name('chats.close');

        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::delete('/users', [UserController::class, 'destroyAll'])->name('users.destroyAll');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
