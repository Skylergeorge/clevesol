<?php

namespace App\Http\Controllers;

use App\Services\StorefrontChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(private StorefrontChatService $chats)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $chat = $this->chats->findByToken($request->header('X-Clv-Chat'));
        if (! $chat) {
            return response()->json(['data' => null]);
        }
        if ($request->boolean('seen')) {
            $this->chats->markVisitorSeen($chat);
            $chat->refresh();
        }

        return response()->json(['data' => $this->chats->visitorPayload($chat)]);
    }

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'body' => 'required|string|max:2000',
            'name' => 'nullable|string|max:80',
            'email' => 'nullable|email|max:120',
            'phone' => 'nullable|string|max:40',
        ]);

        $user = $request->user();
        $result = $this->chats->sendFromVisitor(
            $request->header('X-Clv-Chat'),
            $data['body'],
            $user?->name ?: ($data['name'] ?? null),
            $user?->email ?: ($data['email'] ?? null),
            $user?->phone ?: ($data['phone'] ?? null),
        );

        return response()->json(['data' => $result]);
    }

    public function typing(Request $request): JsonResponse
    {
        $chat = $this->chats->findByToken($request->header('X-Clv-Chat'));
        if ($chat) {
            $this->chats->touchTyping($chat, 'visitor', $request->boolean('typing', true));
        }

        return response()->json(['ok' => true]);
    }
}
