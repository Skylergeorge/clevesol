import { appLayout } from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Loader2, MessagesSquare, Phone, Send, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chats', href: '/admin/chats' },
];

interface ChatSummary {
    id: number;
    visitor_name: string;
    visitor_email: string | null;
    visitor_phone: string | null;
    status: string;
    staff_unread: boolean;
    unread_count: number;
    visitor_typing: boolean;
    last_message: string | null;
    last_sender: string | null;
    last_message_at: string | null;
}

interface ChatMessage {
    id: number;
    sender: 'visitor' | 'staff';
    body: string;
    staff_name: string | null;
    at: string;
}

interface Thread extends ChatSummary {
    messages: ChatMessage[];
}

function csrf(): string {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

async function api(path: string, options: RequestInit = {}) {
    return fetch(path, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrf(),
            ...(options.headers ?? {}),
        },
        credentials: 'same-origin',
    });
}

export default function AdminChats({ chats: initialChats }: { chats: ChatSummary[] }) {
    const [chats, setChats] = useState<ChatSummary[]>(initialChats);
    const [activeId, setActiveId] = useState<number | null>(initialChats[0]?.id ?? null);
    const [thread, setThread] = useState<Thread | null>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const loadList = useCallback(async () => {
        try {
            const res = await api(route('admin.chats.list'));
            const json = await res.json();
            setChats(json.data);
        } catch {
            /* ignore */
        }
    }, []);

    const loadThread = useCallback(async (id: number) => {
        try {
            const res = await api(route('admin.chats.show', id));
            const json = await res.json();
            setThread(json.data);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            loadList();
            if (activeId) loadThread(activeId);
        }, 3500);
        return () => clearInterval(id);
    }, [loadList, loadThread, activeId]);

    useEffect(() => {
        if (activeId) loadThread(activeId);
    }, [activeId, loadThread]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [thread?.messages.length, thread?.id]);

    const send = async () => {
        const text = reply.trim();
        if (!text || !activeId || sending) return;
        setSending(true);
        try {
            const res = await api(route('admin.chats.reply', activeId), { method: 'POST', body: JSON.stringify({ body: text }) });
            const json = await res.json();
            setThread(json.data);
            setReply('');
            loadList();
        } catch {
            /* ignore */
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Head title="Chats" />
            <div className="flex h-[calc(100vh-7rem)] flex-1 gap-4 p-4">
                {/* list */}
                <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="border-b border-zinc-200 px-4 py-3 font-bold dark:border-zinc-800">
                        Conversations
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 && (
                            <div className="flex flex-col items-center py-16 text-zinc-400">
                                <MessagesSquare className="h-10 w-10" />
                                <p className="mt-2 text-sm">No conversations yet</p>
                            </div>
                        )}
                        {chats.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveId(c.id)}
                                className={cn(
                                    'flex w-full flex-col border-b border-zinc-100 px-4 py-3 text-left dark:border-zinc-800/60',
                                    activeId === c.id ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <User className="h-4 w-4 text-zinc-400" />
                                        {c.visitor_name}
                                    </span>
                                    {c.staff_unread && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white">
                                            {c.unread_count}
                                        </span>
                                    )}
                                </div>
                                <span className="mt-1 line-clamp-1 text-xs text-zinc-500">
                                    {c.visitor_typing ? 'typing…' : c.last_message ?? 'No messages'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* thread */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    {!thread ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-zinc-400">
                            <MessagesSquare className="h-12 w-12" />
                            <p className="mt-3">Select a conversation</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                                <div>
                                    <div className="font-bold">{thread.visitor_name}</div>
                                    <div className="flex gap-3 text-xs text-zinc-500">
                                        {thread.visitor_email && <span>{thread.visitor_email}</span>}
                                        {thread.visitor_phone && (
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {thread.visitor_phone}</span>
                                        )}
                                    </div>
                                </div>
                                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', thread.status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800')}>
                                    {thread.status}
                                </span>
                            </div>

                            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-5 dark:bg-zinc-950">
                                {thread.messages.map((m) => (
                                    <div key={m.id} className={cn('flex', m.sender === 'staff' ? 'justify-end' : 'justify-start')}>
                                        <div className={cn('max-w-[70%] rounded-2xl px-4 py-2 text-sm', m.sender === 'staff' ? 'rounded-br-sm bg-emerald-600 text-white' : 'rounded-bl-sm bg-white text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100')}>
                                            {m.body}
                                            {m.sender === 'staff' && m.staff_name && (
                                                <div className="mt-0.5 text-[10px] text-emerald-100">{m.staff_name}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {thread.visitor_typing && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-3.5 py-3 text-[#117846] shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                                            <span className="chat-typing-dots" aria-label="typing">
                                                <i />
                                                <i />
                                                <i />
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                send();
                                            }
                                        }}
                                        rows={1}
                                        placeholder="Type your reply…"
                                        className="max-h-32 flex-1 resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                    <button onClick={send} disabled={sending || !reply.trim()} className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40">
                                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

AdminChats.layout = appLayout;
AdminChats.breadcrumbs = breadcrumbs;
