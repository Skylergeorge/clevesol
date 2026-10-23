<?php

namespace App\Services;

use App\Models\StorefrontChat;
use App\Models\StorefrontMessage;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StorefrontChatService
{
    public function findByToken(?string $token): ?StorefrontChat
    {
        $token = trim((string) $token);
        if ($token === '') {
            return null;
        }

        return StorefrontChat::where('token', $token)->first();
    }

    public function visitorPayload(StorefrontChat $chat): array
    {
        $chat->loadMissing('messages');

        return [
            'visitor_name' => $chat->visitor_name,
            'visitor_unread' => (bool) $chat->visitor_unread,
            'staff_typing' => $this->isTyping($chat->staff_typing_at),
            'status' => $chat->status,
            'messages' => $chat->messages->map(fn (StorefrontMessage $m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'body' => $m->body,
                'at' => optional($m->created_at)->toIso8601String(),
            ])->values(),
        ];
    }

    public function sendFromVisitor(?string $token, string $body, ?string $name = null, ?string $email = null, ?string $phone = null): array
    {
        $body = trim($body);
        if ($body === '') {
            throw ValidationException::withMessages(['body' => 'Write a message first.']);
        }

        $chat = $this->findByToken($token);
        if (! $chat) {
            $name = trim((string) $name);
            if ($name === '') {
                throw ValidationException::withMessages(['name' => 'Tell us your name so we know who to reply to.']);
            }
            $chat = StorefrontChat::create([
                'token' => Str::random(48),
                'visitor_name' => Str::limit($name, 80, ''),
                'visitor_email' => $email ? Str::limit(trim($email), 120, '') : null,
                'visitor_phone' => $phone ? Str::limit(trim($phone), 40, '') : null,
                'status' => 'open',
            ]);
        }

        StorefrontMessage::create([
            'storefront_chat_id' => $chat->id,
            'sender' => 'visitor',
            'body' => Str::limit($body, 2000, ''),
        ]);

        $chat->fill([
            'status' => 'open',
            'staff_unread' => true,
            'staff_unread_count' => (int) $chat->staff_unread_count + 1,
            'visitor_unread' => false,
            'visitor_typing_at' => null,
            'last_message_at' => now(),
        ])->save();

        return [
            'token' => $chat->token,
            'chat' => $this->visitorPayload($chat->fresh('messages')),
        ];
    }

    public function markVisitorSeen(StorefrontChat $chat): void
    {
        if ($chat->visitor_unread) {
            $chat->visitor_unread = false;
            $chat->save();
        }
    }

    public function touchTyping(StorefrontChat $chat, string $side, bool $active = true): void
    {
        $column = $side === 'staff' ? 'staff_typing_at' : 'visitor_typing_at';
        if (! $active && ! $chat->{$column}) {
            return;
        }
        $chat->{$column} = $active ? now() : null;
        $chat->save();
    }

    public function staffList(): array
    {
        return StorefrontChat::with(['messages' => fn ($q) => $q->reorder()->latest('id')->limit(1)])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(80)
            ->get()
            ->map(fn (StorefrontChat $chat) => $this->staffSummary($chat))
            ->values()
            ->all();
    }

    public function staffThread(int $id, bool $markRead = true): array
    {
        $chat = StorefrontChat::with('messages')->find($id);
        if (! $chat) {
            throw ValidationException::withMessages(['chat' => 'That conversation was not found.']);
        }
        if ($markRead && ($chat->staff_unread || $chat->staff_unread_count)) {
            $chat->staff_unread = false;
            $chat->staff_unread_count = 0;
            $chat->save();
        }

        return $this->staffThreadPayload($chat);
    }

    public function sendFromStaff(User $user, int $id, string $body): array
    {
        $body = trim($body);
        if ($body === '') {
            throw ValidationException::withMessages(['body' => 'Write a reply first.']);
        }

        $chat = StorefrontChat::find($id);
        if (! $chat) {
            throw ValidationException::withMessages(['chat' => 'That conversation was not found.']);
        }

        StorefrontMessage::create([
            'storefront_chat_id' => $chat->id,
            'sender' => 'staff',
            'user_id' => $user->id,
            'body' => Str::limit($body, 2000, ''),
        ]);

        $chat->fill([
            'status' => 'open',
            'staff_unread' => false,
            'staff_unread_count' => 0,
            'visitor_unread' => true,
            'staff_typing_at' => null,
            'last_message_at' => now(),
        ])->save();

        return $this->staffThread($chat->id, false);
    }

    public function close(int $id): array
    {
        $chat = StorefrontChat::find($id);
        if (! $chat) {
            throw ValidationException::withMessages(['chat' => 'That conversation was not found.']);
        }
        $chat->status = 'closed';
        $chat->save();

        return $this->staffThread($chat->id, false);
    }

    public function unreadCount(): int
    {
        return (int) StorefrontChat::where('staff_unread', true)->count();
    }

    private function isTyping($at): bool
    {
        return $at && $at->gt(now()->subSeconds(4));
    }

    private function staffSummary(StorefrontChat $chat): array
    {
        $latest = $chat->relationLoaded('messages')
            ? $chat->messages->sortByDesc('id')->first()
            : $chat->messages()->latest('id')->first();

        return [
            'id' => $chat->id,
            'visitor_name' => $chat->visitor_name,
            'visitor_email' => $chat->visitor_email,
            'visitor_phone' => $chat->visitor_phone,
            'status' => $chat->status,
            'staff_unread' => (bool) $chat->staff_unread,
            'unread_count' => (int) $chat->staff_unread_count,
            'visitor_typing' => $this->isTyping($chat->visitor_typing_at),
            'last_message' => $latest?->body,
            'last_sender' => $latest?->sender,
            'last_message_at' => optional($chat->last_message_at)->toIso8601String(),
        ];
    }

    private function staffThreadPayload(StorefrontChat $chat): array
    {
        return [
            ...$this->staffSummary($chat),
            'messages' => $chat->messages->map(fn (StorefrontMessage $m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'body' => $m->body,
                'staff_name' => $m->user?->name,
                'at' => optional($m->created_at)->toIso8601String(),
            ])->values(),
        ];
    }
}
