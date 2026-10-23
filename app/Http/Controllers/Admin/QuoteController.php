<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
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
        $quote->update($data);

        return back(303)->with('flash', 'Quote updated.');
    }
}
