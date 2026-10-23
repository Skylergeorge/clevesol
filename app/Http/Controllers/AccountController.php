<?php

namespace App\Http\Controllers;

use App\Models\QuoteRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        $quotes = QuoteRequest::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)->orWhere('email', $user->email);
            })
            ->latest()
            ->get()
            ->map(fn (QuoteRequest $quote) => [
                'id' => $quote->id,
                'reference' => $quote->reference,
                'status' => $quote->status,
                'estimated_total' => (float) $quote->estimated_total,
                'created_at' => $quote->created_at?->toDateString(),
                'items' => collect($quote->items ?? [])->map(fn ($item) => [
                    'name' => $item['name'] ?? '',
                    'qty' => $item['qty'] ?? 1,
                    'size' => $item['size'] ?? null,
                ])->values(),
            ]);

        return Inertia::render('storefront/account', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'quotes' => $quotes,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:40',
        ]);

        $request->user()->update($data);

        return back(303)->with('flash', 'Profile saved.');
    }
};
