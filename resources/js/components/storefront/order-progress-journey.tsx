const STAGES = [
    { key: 'ordered', label: 'Ordered', percent: 25, name: 'Order placed' },
    { key: 'contacted', label: 'Contacted', percent: 50, name: 'We have contacted you' },
    { key: 'confirmed', label: 'Confirmed', percent: 75, name: 'Order confirmed' },
    { key: 'delivered', label: 'Delivered', percent: 100, name: 'Delivered' },
];

const INDEX: Record<string, number> = {
    ordered: 0,
    contacted: 1,
    confirmed: 2,
    delivered: 3,
};

export const ORDER_STAGES = STAGES;

export function orderStageIndex(status: string) {
    if (status === 'cancelled') return -1;
    return INDEX[status] ?? 0;
}

export default function OrderProgressJourney({ status, compact = false }: { status: string; compact?: boolean }) {
    const cancelled = status === 'cancelled';
    const current = cancelled ? -1 : orderStageIndex(status);
    const stage = cancelled ? { name: 'Order cancelled', percent: 0 } : STAGES[Math.max(0, current)] || STAGES[0];
    const pos = cancelled ? 0 : (current / (STAGES.length - 1)) * 100;

    return (
        <div className={compact ? 'py-1' : 'py-2'}>
            <div className="relative">
                <div className="absolute left-8 right-8 top-[11px] h-[3px] rounded-full bg-[#d7dee7]" />
                <div className="absolute left-8 top-[11px] h-[3px] rounded-full bg-[#102753]" style={{ width: `calc((100% - 4rem) * ${pos / 100})` }} />
                <ol className="relative flex justify-between">
                    {STAGES.map((node, i) => {
                        const done = !cancelled && i < current;
                        const active = !cancelled && i === current;
                        return (
                            <li key={node.key} className="flex w-16 flex-col items-center">
                                <span
                                    className={
                                        active
                                            ? 'flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#102753] ring-4 ring-[#102753]/15'
                                            : done
                                              ? 'flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#102753] text-[11px] font-bold text-white'
                                              : 'flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#c5d0dc] bg-white'
                                    }
                                >
                                    {done ? '✓' : ''}
                                </span>
                                <span className={`mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.04em] ${done || active ? 'text-[#102753]' : 'text-[#8b98a8]'}`}>
                                    {node.label}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>
            <div className="mt-3 text-center">
                <div className={`font-semibold tracking-tight text-[#102753] ${compact ? 'text-xl' : 'text-2xl'}`}>{stage.percent}%</div>
                <div className="text-sm font-medium text-[#3d4f66]">{stage.name}</div>
            </div>
        </div>
    );
}
