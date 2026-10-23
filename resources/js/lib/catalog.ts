import {
    Anchor,
    Ear,
    Glasses,
    Hand,
    HardHat,
    ShieldCheck,
    Shirt,
    Wind,
    type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
    HardHat,
    Glasses,
    Wind,
    Ear,
    Hand,
    Shirt,
    Anchor,
    ShieldCheck,
};

export function categoryIcon(name?: string | null): LucideIcon {
    if (name && ICONS[name]) return ICONS[name];
    return ShieldCheck;
}

export interface AccentTheme {
    gradient: string; // for big blocks
    soft: string; // soft tinted bg
    text: string; // accent text
    ring: string; // ring/border
    chip: string; // badge chip
    glow: string; // decorative glow
}

const ACCENTS: Record<string, AccentTheme> = {
    emerald: {
        gradient: 'from-emerald-500 to-green-700',
        soft: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        ring: 'ring-emerald-500/30',
        chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
        glow: 'bg-emerald-400/30',
    },
    amber: {
        gradient: 'from-amber-400 to-orange-600',
        soft: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        ring: 'ring-amber-500/30',
        chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        glow: 'bg-amber-400/30',
    },
    sky: {
        gradient: 'from-sky-400 to-blue-700',
        soft: 'bg-sky-50 dark:bg-sky-950/40',
        text: 'text-sky-700 dark:text-sky-400',
        ring: 'ring-sky-500/30',
        chip: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
        glow: 'bg-sky-400/30',
    },
    teal: {
        gradient: 'from-teal-400 to-cyan-700',
        soft: 'bg-teal-50 dark:bg-teal-950/40',
        text: 'text-teal-700 dark:text-teal-400',
        ring: 'ring-teal-500/30',
        chip: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
        glow: 'bg-teal-400/30',
    },
    violet: {
        gradient: 'from-violet-400 to-purple-700',
        soft: 'bg-violet-50 dark:bg-violet-950/40',
        text: 'text-violet-700 dark:text-violet-400',
        ring: 'ring-violet-500/30',
        chip: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
        glow: 'bg-violet-400/30',
    },
    orange: {
        gradient: 'from-orange-400 to-red-600',
        soft: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-400',
        ring: 'ring-orange-500/30',
        chip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        glow: 'bg-orange-400/30',
    },
    rose: {
        gradient: 'from-rose-400 to-pink-700',
        soft: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        ring: 'ring-rose-500/30',
        chip: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
        glow: 'bg-rose-400/30',
    },
};

export function accentTheme(accent?: string | null): AccentTheme {
    if (accent && ACCENTS[accent]) return ACCENTS[accent];
    return ACCENTS.emerald;
}

export function formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}
