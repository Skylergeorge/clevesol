<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\StorefrontChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __construct(private StorefrontChatService $chats)
    {
    }

    public function page(): Response
    {
        return Inertia::render('admin/chats', [
            'chats' => $this->chats->staffList(),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->chats->staffList()]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => $this->chats->staffThread($id)]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['body' => 'required|string|max:2000']);

        return response()->json(['data' => $this->chats->sendFromStaff(Auth::user(), $id, $data['body'])]);
    }

    public function close(int $id): JsonResponse
    {
        return response()->json(['data' => $this->chats->close($id)]);
    }
}
