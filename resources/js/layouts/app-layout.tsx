import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactElement, type ReactNode } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}

function crumbsFor(page: ReactNode): BreadcrumbItem[] | undefined {
    return (page as ReactElement & { type?: { breadcrumbs?: BreadcrumbItem[] } }).type?.breadcrumbs;
}

/** One shared layout so sidebar chrome stays mounted between dashboard links. */
export function appLayout(page: ReactNode) {
    return <AppLayout breadcrumbs={crumbsFor(page)}>{page}</AppLayout>;
}

/** Settings pages keep the same sidebar and the settings menu. */
export function settingsLayout(page: ReactNode) {
    return (
        <AppLayout breadcrumbs={crumbsFor(page)}>
            <SettingsLayout>{page}</SettingsLayout>
        </AppLayout>
    );
}
