<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
use App\Services\StripeCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/quotes', [
            'quotes' => QuoteRequest::latest('id')->paginate(20),
            'stats' => [
                'new' => QuoteRequest::where('status', 'ordered')->count(),
                'total' => QuoteRequest::count(),
            ],
        ]);
    }

    public function update(Request $request, QuoteRequest $quote): RedirectResponse
    {
        $data = $request->validate([
            'status' => 'required|in:ordered,contacted,confirmed,delivered,cancelled',
        ]);

        $prepaid = ($quote->payment_method ?? 'pay_now') === 'pay_now';
        $fulfillment = in_array($data['status'], ['contacted', 'confirmed', 'delivered'], true);
        if ($prepaid && $fulfillment && $quote->payment_status !== 'paid' && app(StripeCheckoutService::class)->enabled()) {
            return back(303)->withErrors(['status' => 'This order must be paid before it can be processed or shipped.']);
        }

        $updates = $data;
        if ($data['status'] === 'delivered' && ($quote->payment_method ?? '') === 'pay_on_delivery' && $quote->payment_status !== 'paid') {
            $updates['payment_status'] = 'paid';
            $updates['paid_at'] = now();
            $updates['amount_paid_cents'] = (int) round((float) $quote->estimated_total * 100);
        }

        $quote->update($updates);

        return back(303)->with('flash', 'Order updated.');
    }
}
