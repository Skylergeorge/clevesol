import { accentTheme, categoryIcon } from '@/lib/catalog';
import { cn } from '@/lib/utils';

interface Props {
    name: string;
    imagePath?: string | null;
    accent?: string | null;
    icon?: string | null;
    className?: string;
    iconClassName?: string;
}

export default function ProductMedia({ name, imagePath, accent, icon, className, iconClassName }: Props) {
    const theme = accentTheme(accent);
    const Icon = categoryIcon(icon);

    if (imagePath) {
        return (
            <div className={cn('relative overflow-hidden', className)}>
                <img src={imagePath} alt={name} className="h-full w-full object-cover" loading="lazy" />
            </div>
        );
    }

    return (
        <div className={cn('relative flex items-center justify-center overflow-hidden', theme.soft, className)}>
            {/* decorative grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage:
                        'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }}
            />
            <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl', theme.glow)} />
            <div
                className={cn(
                    'relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                    theme.gradient,
                    iconClassName,
                )}
            >
                <Icon className="h-9 w-9" strokeWidth={1.6} />
            </div>
        </div>
    );
}
