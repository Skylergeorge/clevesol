import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    id: number;
    sender: 'visitor' | 'staff';
    body: string;
    at: string;
}

interface ChatState {
    visitor_name: string;
    visitor_unread: boolean;
    staff_typing: boolean;
    status: string;
    messages: ChatMessage[];
}

const TOKEN_KEY = 'clv_chat_token';

function csrf(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

async function api(path: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem(TOKEN_KEY) ?? '';
    return fetch(path, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrf(),
            'X-Clv-Chat': token,
            ...(options.headers ?? {}),
        },
        credentials: 'same-origin',
    });
}

function TypingDots({ className = '' }: { className?: string }) {
    return (
        <span className={`chat-typing-dots ${className}`} aria-hidden="true">
            <i />
            <i />
            <i />
        </span>
    );
}

export default function ChatWidget() {
    const { company, auth } = usePage<SharedData>().props;
    const signedIn = Boolean(auth.user);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
    const [chat, setChat] = useState<ChatState | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [unread, setUnread] = useState(false);
    const [staffTyping, setStaffTyping] = useState(false);
    const [greetingTyping, setGreetingTyping] = useState(false);
    const [welcomed, setWelcomed] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ left: number; top: number } | null>(null);
    const [dragging, setDragging] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef({ pointerX: 0, pointerY: 0, left: 0, top: 0 });
    const hasDragged = useRef(false);
    const openRef = useRef(false);
    const typingOn = useRef(false);
    const typingIdle = useRef<number | null>(null);
    const typingKeep = useRef<number | null>(null);
    const staffTypingTimer = useRef<number | null>(null);
    const typingWanted = useRef(false);
    const typingBusy = useRef(false);
    openRef.current = open;

    const host = company.name.replace(/\s+LLC$/, '');
    const hello = `Hi, this is ${host}. Need help choosing gear for your crew?`;

    const showStaffTyping = (active: boolean) => {
        if (staffTypingTimer.current) window.clearTimeout(staffTypingTimer.current);
        setStaffTyping(active);
        if (active) {
            staffTypingTimer.current = window.setTimeout(() => setStaffTyping(false), 2200);
        }
    };

    const loadThread = async (current = token, seen = openRef.current) => {
        if (!current) return;
        const res = await api(`/chat${seen ? '?seen=1' : ''}`);
        const json = await res.json();
        if (!json.data) return;
        setChat(json.data);
        showStaffTyping(!!json.data.staff_typing);
        setUnread(!seen && json.data.visitor_unread);
        if (seen) setUnread(false);
    };

    useEffect(() => {
        if (!token) return undefined;
        const poll = window.setInterval(() => {
            loadThread(token, openRef.current).catch(() => {});
        }, 1500);
        loadThread(token, openRef.current).catch(() => {});
        return () => window.clearInterval(poll);
    }, [token]);

    useEffect(() => {
        if (open && token) loadThread(token, true).catch(() => {});
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const frame = window.requestAnimationFrame(() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
        });
        return () => window.cancelAnimationFrame(frame);
    }, [open, welcomed, greetingTyping, chat?.messages.length, staffTyping]);

    useEffect(() => {
        if (!open) return undefined;
        setWelcomed(false);
        setGreetingTyping(true);
        const timer = window.setTimeout(() => {
            setGreetingTyping(false);
            setWelcomed(true);
        }, 1600);
        return () => window.clearTimeout(timer);
    }, [open]);

    const flushTyping = () => {
        if (!token || typingBusy.current) return;
        typingBusy.current = true;
        const active = typingWanted.current;
        api('/chat/typing', { method: 'POST', body: JSON.stringify({ typing: active }) })
            .catch(() => {})
            .finally(() => {
                typingBusy.current = false;
                if (typingWanted.current !== active) flushTyping();
            });
    };

    const setVisitorTyping = (active: boolean) => {
        if (active) {
            if (!token) return;
            const starting = !typingOn.current;
            typingOn.current = true;
            typingWanted.current = true;
            if (starting) {
                flushTyping();
                if (typingKeep.current) window.clearInterval(typingKeep.current);
                typingKeep.current = window.setInterval(() => {
                    if (typingOn.current) flushTyping();
                }, 1200);
            }
            return;
        }
        if (typingKeep.current) window.clearInterval(typingKeep.current);
        if (!typingOn.current && !typingWanted.current) return;
        typingOn.current = false;
        typingWanted.current = false;
        flushTyping();
    };

    const noteTyping = (value: string) => {
        if (typingIdle.current) window.clearTimeout(typingIdle.current);
        if (!value.trim()) {
            setVisitorTyping(false);
            return;
        }
        setVisitorTyping(true);
        typingIdle.current = window.setTimeout(() => setVisitorTyping(false), 900);
    };

    useEffect(
        () => () => {
            if (typingIdle.current) window.clearTimeout(typingIdle.current);
            if (typingKeep.current) window.clearInterval(typingKeep.current);
            if (staffTypingTimer.current) window.clearTimeout(staffTypingTimer.current);
            if (typingOn.current) {
                typingWanted.current = false;
                flushTyping();
            }
        },
        [token],
    );

    const send = async (text?: string) => {
        const body = (text ?? message).trim();
        if (!body || busy) return;
        if (!token && !signedIn && !name.trim()) {
            setError('Add your name so we know who to reply to.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const res = await api('/chat', {
                method: 'POST',
                body: JSON.stringify({
                    body,
                    name: signedIn ? auth.user?.name : name.trim(),
                    phone: signedIn ? auth.user?.phone ?? '' : phone.trim(),
                    email: signedIn ? auth.user?.email : undefined,
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.data?.token) {
                const first = json.errors ? (Object.values(json.errors)[0] as string[])?.[0] : null;
                throw new Error(first || json.message || 'Could not send that.');
            }
            localStorage.setItem(TOKEN_KEY, json.data.token);
            setToken(json.data.token);
            setChat(json.data.chat);
            setMessage('');
            setVisitorTyping(false);
            setUnread(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not send that.');
        } finally {
            setBusy(false);
        }
    };

    const startDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
        const element = chatRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        dragStart.current = { pointerX: event.clientX, pointerY: event.clientY, left: rect.left, top: rect.top };
        hasDragged.current = false;
        setDragPosition({ left: rect.left, top: rect.top });
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const moveDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!dragging) return;
        const element = chatRef.current;
        if (!element) return;
        const movedX = event.clientX - dragStart.current.pointerX;
        const movedY = event.clientY - dragStart.current.pointerY;
        if (Math.abs(movedX) > 4 || Math.abs(movedY) > 4) hasDragged.current = true;
        const maxLeft = Math.max(8, window.innerWidth - element.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - element.offsetHeight - 8);
        setDragPosition({
            left: Math.min(maxLeft, Math.max(8, dragStart.current.left + movedX)),
            top: Math.min(maxTop, Math.max(8, dragStart.current.top + movedY)),
        });
    };

    const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
    };

    const messages = chat?.messages ?? [];

    return (
        <div
            ref={chatRef}
            className={`clv-chat-dock ${dragging ? 'chat-dragging' : ''}`}
            style={dragPosition ? { left: dragPosition.left, top: dragPosition.top, right: 'auto', bottom: 'auto' } : undefined}
        >
            <div className={`clv-chat-panel ${open ? '' : 'is-closed'}`}>
                <div className="flex items-center justify-between gap-3 border-b border-[#002d5b]/10 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <img src="/images/brand/clevesol-lockup.png" alt="" className="h-11 w-auto max-w-[13.5rem] rounded-md object-contain object-left" />
                        <p className="truncate text-xs text-[#3d5a73]">{staffTyping ? 'typing…' : 'Shop chat'}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close chat"
                        onClick={() => {
                            setOpen(false);
                            setVisitorTyping(false);
                        }}
                        className="rounded-md p-1.5 text-[#3d5a73] hover:bg-[#e8f3ec]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div ref={listRef} className="clv-chat-thread space-y-3 px-4 py-4">
                    {greetingTyping && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-md border border-[#002d5b]/10 bg-white px-3.5 py-3 text-[#3d5a73] shadow-sm">
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    {welcomed && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%]">
                                <p className="mb-1 px-1 text-[11px] font-medium text-[#3d5a73]">{host}</p>
                                <div className="rounded-2xl rounded-bl-md border border-[#002d5b]/10 bg-white px-3.5 py-2.5 text-sm text-[#002d5b] shadow-sm">{hello}</div>
                            </div>
                        </div>
                    )}
                    {messages.map((item) => (
                        <div key={item.id} className={`flex ${item.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[85%]">
                                {item.sender !== 'visitor' && <p className="mb-1 px-1 text-[11px] font-medium text-[#3d5a73]">{host}</p>}
                                <div
                                    className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                                        item.sender === 'visitor'
                                            ? 'rounded-br-md bg-[#117846] text-white'
                                            : 'rounded-bl-md border border-[#002d5b]/10 bg-white text-[#002d5b]'
                                    }`}
                                >
                                    {item.body}
                                </div>
                            </div>
                        </div>
                    ))}
                    {staffTyping && welcomed && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-md border border-[#002d5b]/10 bg-white px-3.5 py-3 text-[#3d5a73] shadow-sm">
                                <TypingDots />
                            </div>
                        </div>
                    )}
                </div>

                {!token && !signedIn && (
                    <div className="grid gap-2 border-t border-[#c5d5cc] px-5 pt-3">
                        <input
                            aria-label="Your name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-9 w-full border-b border-[#c5d5cc] bg-transparent text-xs outline-none placeholder:text-[#002d5b]/40 focus:border-[#117846]"
                            placeholder="Your name"
                        />
                        <input
                            aria-label="Phone, optional"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            className="h-9 w-full border-b border-[#c5d5cc] bg-transparent text-xs outline-none placeholder:text-[#002d5b]/40 focus:border-[#117846]"
                            placeholder="Phone, optional"
                        />
                    </div>
                )}
                {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2 px-5 pt-3">
                        <button
                            type="button"
                            onClick={() => send('Hi, help me choose safety gear for the job.')}
                            className="rounded-full border border-[#c5d5cc] px-3 py-2 text-[10px] text-[#002d5b] transition-colors hover:border-[#117846] hover:text-[#117846]"
                        >
                            Help me choose
                        </button>
                        <button
                            type="button"
                            onClick={() => send('Hi, I have a question about bulk pricing.')}
                            className="rounded-full border border-[#c5d5cc] px-3 py-2 text-[10px] text-[#002d5b] transition-colors hover:border-[#117846] hover:text-[#117846]"
                        >
                            Ask about bulk pricing
                        </button>
                    </div>
                )}
                {error && <p className="px-5 pt-2 text-[11px] text-[#117846]">{error}</p>}
                <div className="flex items-center gap-2 border-t border-[#c5d5cc] px-5 py-4">
                    <input
                        aria-label="Message"
                        value={message}
                        onChange={(event) => {
                            setMessage(event.target.value);
                            noteTyping(event.target.value);
                        }}
                        onBlur={() => setVisitorTyping(false)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') send();
                        }}
                        className="min-w-0 flex-1 bg-transparent text-xs text-[#002d5b] outline-none placeholder:text-[#002d5b]/40"
                        placeholder="Write a message..."
                    />
                    <button
                        type="button"
                        disabled={busy}
                        aria-label="Send message"
                        onClick={() => send()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#117846] text-white transition-colors hover:bg-[#0d6338] disabled:opacity-60"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <button
                type="button"
                aria-label="Open chat"
                title="Drag to move · click to chat"
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={() => {
                    if (hasDragged.current) return;
                    if (open) setVisitorTyping(false);
                    if (!open) setDragPosition(null);
                    setOpen(!open);
                }}
                className="clv-chat-pulse relative flex touch-none cursor-grab items-center gap-3 rounded-full bg-[#117846] px-4 py-3 text-white shadow-xl transition-transform hover:scale-105 active:cursor-grabbing"
            >
                <MessageCircle className="h-[18px] w-[18px]" />
                <span className="hidden text-xs font-semibold uppercase tracking-[.12em] sm:inline">Chat with us</span>
                <span className={`flex h-2 w-2 rounded-full ${unread ? 'bg-[#f4c020]' : 'bg-[#f4c020]/70'}`} />
                {unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#f4c020]" />}
            </button>
        </div>
    );
}
