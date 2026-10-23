import { cn } from '@/lib/utils';

export default function Mountains({ className }: { className?: string }) {
    return (
        <svg
            className={cn('block w-full', className)}
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            aria-hidden
        >
            <path
                d="M0 150V88c80-8 160-28 250-24 70 3 120 18 190 12 90-8 140-30 230-22 70 6 110 22 180 16 90-8 150-26 240-14 70 9 130 24 350 32v12z"
                fill="#0387ca"
                opacity=".16"
            />
            <path d="M420 150V78l90-46 28 16 54-32 26 18 72-42 88 52 48-20 62 32v60z" fill="#005696" />
            <path d="M538 48l54-32 26 18 36-22-48 64-68-28z" fill="#d7eef8" opacity=".7" />
            <g fill="#002d5b">
                <path d="M972 52l7-20 7 20v36h-14z" />
                <rect x="964" y="86" width="28" height="8" />
                <rect x="976" y="94" width="10" height="56" />
                <rect x="1000" y="102" width="16" height="48" />
                <rect x="1018" y="88" width="22" height="62" />
                <rect x="1042" y="108" width="14" height="42" />
                <rect x="1058" y="92" width="26" height="58" />
                <rect x="1086" y="112" width="16" height="38" />
                <rect x="1104" y="84" width="20" height="66" />
                <rect x="1126" y="100" width="18" height="50" />
                <rect x="1146" y="90" width="24" height="60" />
                <rect x="1172" y="108" width="14" height="42" />
                <rect x="948" y="112" width="18" height="38" />
            </g>
            <g fill="#117846">
                <path d="M70 150l16-42 16 42z" />
                <path d="M94 150l13-32 13 32z" />
                <path d="M116 150l11-26 11 26z" />
                <path d="M210 150l15-38 15 38z" />
                <path d="M232 150l11-24 11 24z" />
                <path d="M1248 150l15-36 15 36z" />
                <path d="M1272 150l12-28 12 28z" />
                <path d="M1294 150l10-22 10 22z" />
            </g>
            <path
                d="M0 150c140-22 260-48 400-40 170 10 250 42 420 36 180-6 260-44 430-34 90 6 150 22 190 38H0z"
                fill="#117846"
            />
            <path
                d="M0 150c110-12 240-30 380-22 160 9 250 32 410 26 190-8 270-34 440-24 70 4 130 14 210 20H0z"
                fill="#2e9437"
            />
        </svg>
    );
}
