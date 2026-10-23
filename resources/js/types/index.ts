import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Company {
    name: string;
    tagline: string;
    email: string;
    email_alt: string;
    phone: string;
    website: string;
    address: string;
}

export interface NavCategory {
    name: string;
    slug: string;
    icon: string | null;
    accent: string | null;
    tagline?: string | null;
    image_path?: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    company: Company;
    navCategories: NavCategory[];
    cartCount: number;
    cart: {
        items: {
            index: number;
            product_id: number;
            name: string;
            slug: string;
            subtitle: string | null;
            category: string | null;
            accent?: string | null;
            icon?: string | null;
            image_path: string | null;
            price: number;
            qty: number;
            size: string | null;
            line_total: number;
        }[];
        subtotal: number;
        count: number;
    };
    openCart: string | null;
    flash: { message: string | null };
    staffChatUnread: number;
    [key: string]: unknown;
}

export interface ProductCard {
    id: number;
    name: string;
    slug: string;
    subtitle: string | null;
    brand: string | null;
    badge: string | null;
    price: number;
    rating: number;
    image_path: string | null;
    category: string | null;
    category_slug: string | null;
    accent: string | null;
    icon: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role?: 'admin' | 'buyer';
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
