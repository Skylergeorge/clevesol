import { cn } from '@/lib/utils';
import { Mountain } from 'lucide-react';

/**
 * Flyer lockup: shield, CLEVESOL NORTHWEST LLC, and the gold tagline.
 * - variant "image" (default): that full logo, for light surfaces.
 * - variant "light": white wordmark for dark surfaces.
 */
export default function BrandLogo({
    className,
    variant = 'image',
    size = 'md',
}: {
    className?: string;
    variant?: 'image' | 'light';
    size?: 'sm' | 'md' | 'lg';
}) {
    const h = size === 'sm' ? 'h-10' : size === 'lg' ? 'h-16' : 'h-11 sm:h-12 lg:h-14';

    if (variant === 'image') {
        return (
            <img
                src="/images/brand/clevesol-lockup.png"
                alt="Clevesol Northwest LLC"
                className={cn(h, 'w-auto max-w-full rounded-md object-contain object-left', className)}
            />
        );
    }

    const emblem = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';

    return (
        <span className={cn('flex items-center gap-3', className)}>
            <span
                className={cn(
                    'relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0387ca] via-[#005696] to-[#117846] text-white shadow-lg ring-1 ring-white/20',
                    emblem,
                )}
            >
                <Mountain className="h-6 w-6" strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-none">
                <span className="font-brand text-lg font-extrabold tracking-tight text-white">
                    CLEVE<span className="text-[#5fd08a]">SOL</span>
                </span>
                <span className="font-brand text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                    Northwest
                </span>
            </span>
        </span>
    );
}
