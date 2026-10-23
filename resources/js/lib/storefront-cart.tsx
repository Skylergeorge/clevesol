import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type CartState = SharedData['cart'];

export type CartProduct = {
    id: number;
    name: string;
    slug: string;
    subtitle: string | null;
    category: string | null;
    image_path: string | null;
    price: number;
};

type CartApi = {
    cart: CartState;
    open: boolean;
    setOpen: (open: boolean) => void;
    add: (product: CartProduct, qty?: number, size?: string | null) => void;
    setQty: (productId: number, size: string | null, qty: number) => void;
    remove: (productId: number, size: string | null) => void;
};

const CartContext = createContext<CartApi | null>(null);

function csrf(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function money(amount: number): number {
    return Math.round(amount * 100) / 100;
}

function recount(items: CartState['items']): CartState {
    return {
        items: items.map((item, index) => ({ ...item, index })),
        subtotal: money(items.reduce((sum, item) => sum + item.price * item.qty, 0)),
        count: items.reduce((sum, item) => sum + item.qty, 0),
    };
}

function withLine(cart: CartState, product: CartProduct, qty: number, size: string | null): CartState {
    const items = cart.items.map((item) => ({ ...item }));
    const found = items.find((item) => item.product_id === product.id && item.size === size);

    if (found) {
        found.qty = Math.min(999, found.qty + qty);
        found.line_total = money(found.price * found.qty);
    } else {
        items.push({
            index: items.length,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            subtitle: product.subtitle,
            category: product.category,
            image_path: product.image_path,
            price: product.price,
            qty,
            size,
            line_total: money(product.price * qty),
        });
    }

    return recount(items);
}

function withQty(cart: CartState, productId: number, size: string | null, qty: number): CartState {
    const items = cart.items.flatMap((item) => {
        if (item.product_id !== productId || item.size !== size) {
            return [item];
        }
        if (qty <= 0) {
            return [];
        }
        const next = Math.min(999, qty);
        return [{ ...item, qty: next, line_total: money(item.price * next) }];
    });

    return recount(items);
}

async function send(url: string, method: string, body: object): Promise<CartState> {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrf(),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Cart update failed');
    }

    const payload = (await response.json()) as { cart: CartState };
    return payload.cart;
}

export function StorefrontCartProvider({ children }: { children: ReactNode }) {
    const { cart: sharedCart } = usePage<SharedData>().props;
    const [cart, setCart] = useState(sharedCart);
    const [open, setOpen] = useState(false);
    const cartRef = useRef(sharedCart);
    const serverCart = useRef(sharedCart);
    const pending = useRef(0);
    const generation = useRef(0);
    const chain = useRef(Promise.resolve());

    useEffect(() => {
        if (pending.current === 0) {
            cartRef.current = sharedCart;
            serverCart.current = sharedCart;
            setCart(sharedCart);
        }
    }, [sharedCart]);

    const commit = (next: CartState, request: () => Promise<CartState>) => {
        const gen = ++generation.current;
        pending.current += 1;
        cartRef.current = next;
        setCart(next);
        chain.current = chain.current.then(async () => {
            try {
                const confirmed = await request();
                serverCart.current = confirmed;
                if (gen === generation.current) {
                    cartRef.current = confirmed;
                    setCart(confirmed);
                }
            } catch {
                if (gen === generation.current) {
                    cartRef.current = serverCart.current;
                    setCart(serverCart.current);
                }
            } finally {
                pending.current -= 1;
            }
        });
    };

    const api: CartApi = {
        cart,
        open,
        setOpen,
        add: (product, qty = 1, size = null) => {
            setOpen(true);
            commit(withLine(cartRef.current, product, qty, size), () =>
                send(route('cart.add'), 'POST', { product_id: product.id, qty, size }),
            );
        },
        setQty: (productId, size, qty) => {
            commit(withQty(cartRef.current, productId, size, qty), () =>
                send(route('cart.update'), 'PATCH', { product_id: productId, size, qty }),
            );
        },
        remove: (productId, size) => {
            commit(withQty(cartRef.current, productId, size, 0), () =>
                send(route('cart.remove'), 'DELETE', { product_id: productId, size }),
            );
        },
    };

    return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useStorefrontCart(): CartApi {
    const cart = useContext(CartContext);
    if (!cart) {
        throw new Error('useStorefrontCart must be used inside StorefrontCartProvider');
    }
    return cart;
}
