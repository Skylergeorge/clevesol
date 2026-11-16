const PAY_NOW_STAGES = [
    { key: 'placed', label: 'Placed', percent: 20, name: 'Order placed' },
    { key: 'paid', label: 'Paid', percent: 40, name: 'Payment confirmed' },
    { key: 'processing', label: 'Processing', percent: 60, name: 'Order is being processed' },
    { key: 'shipped', label: 'Shipped', percent: 80, name: 'Order shipped' },
    { key: 'delivered', label: 'Delivered', percent: 100, name: 'Delivered' },
];

const PAY_LATER_STAGES = [
    { key: 'placed', label: 'Placed', percent: 25, name: 'Order placed — pay after delivery' },
    { key: 'processing', label: 'Processing', percent: 50, name: 'Order is being processed' },
    { key: 'shipped', label: 'Shipped', percent: 75, name: 'Order shipped' },
    { key: 'delivered', label: 'Delivered', percent: 100, name: 'Delivered — pay on receipt' },
];

export const ORDER_STAGES = [
    { key: 'ordered', label: 'Placed' },
    { key: 'contacted', label: 'Processing' },
    { key: 'confirmed', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
];

export function orderStageIndex(status: string, paymentStatus = 'unpaid', paymentMethod = 'pay_now') {
    if (status === 'cancelled') return -1;

    if (paymentMethod === 'pay_on_delivery') {
        if (status === 'delivered') return 3;
        if (status === 'confirmed') return 2;
        if (status === 'contacted') return 1;
        return 0;
    }

    if (status === 'delivered') return 4;
    if (status === 'confirmed') return 3;
    if (status === 'contacted') return 2;
    if (paymentStatus === 'paid') return 1;
    return 0;
}

export default function OrderProgressJourney({
    status,
    paymentStatus = 'unpaid',
    paymentMethod = 'pay_now',
    compact = false,
}: {
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    compact?: boolean;
}) {
    const stages = paymentMethod === 'pay_on_delivery' ? PAY_LATER_STAGES : PAY_NOW_STAGES;
    const cancelled = status === 'cancelled';
    const current = cancelled ? -1 : orderStageIndex(status, paymentStatus, paymentMethod);
    const awaitingPay = !cancelled && paymentMethod !== 'pay_on_delivery' && current === 0 && paymentStatus !== 'paid';
    const deliveredPaid = !cancelled && paymentMethod === 'pay_on_delivery' && status === 'delivered' && paymentStatus === 'paid';
    const stage = cancelled
        ? { name: 'Order cancelled', percent: 0 }
        : awaitingPay
          ? { name: 'Awaiting payment', percent: 10 }
          : deliveredPaid
            ? { name: 'Delivered and paid', percent: 100 }
            : stages[Math.max(0, current)] || stages[0];
    const pos = cancelled ? 0 : (Math.max(0, current) / (stages.length - 1)) * 100;

    return (
        <div className={compact ? 'py-1' : 'py-2'}>
            <div className="relative px-1">
                <div className="absolute left-6 right-6 top-[11px] h-[3px] rounded-full bg-[#d7dee7] sm:left-8 sm:right-8" />
                <div className="absolute left-6 top-[11px] h-[3px] rounded-full bg-[#102753] sm:left-8" style={{ width: `calc((100% - 3rem) * ${pos / 100})` }} />
                <ol className="relative flex justify-between">
                    {stages.map((node, i) => {
                        const done = !cancelled && i < current;
                        const active = !cancelled && i === current;
                        return (
                            <li key={node.key} className="flex min-w-0 flex-1 flex-col items-center">
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
                                <span className={`mt-2 max-w-full px-0.5 text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.02em] sm:text-[10px] sm:tracking-[0.04em] ${done || active ? 'text-[#102753]' : 'text-[#8b98a8]'}`}>
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
