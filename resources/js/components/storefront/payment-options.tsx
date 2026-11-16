export type PaymentMethod = 'pay_now' | 'pay_on_delivery';

export default function PaymentOptions({
    value,
    onChange,
    paymentsEnabled,
}: {
    value: PaymentMethod;
    onChange: (value: PaymentMethod) => void;
    paymentsEnabled: boolean;
}) {
    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[#002d5b]">Payment</legend>
            <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${value === 'pay_now' ? 'border-[#102753] bg-[#102753]/5' : 'border-zinc-200'} ${paymentsEnabled ? '' : 'opacity-60'}`}>
                <input
                    type="radio"
                    name="payment_method"
                    value="pay_now"
                    checked={value === 'pay_now'}
                    disabled={!paymentsEnabled}
                    onChange={() => onChange('pay_now')}
                    className="mt-1"
                />
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#002d5b]">Pay now by card</span>
                        <CardMarks />
                    </span>
                    {!paymentsEnabled ? <span className="mt-1 block text-xs text-amber-700">Unavailable</span> : null}
                </span>
            </label>
            <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${value === 'pay_on_delivery' ? 'border-[#102753] bg-[#102753]/5' : 'border-zinc-200'}`}>
                <input
                    type="radio"
                    name="payment_method"
                    value="pay_on_delivery"
                    checked={value === 'pay_on_delivery'}
                    onChange={() => onChange('pay_on_delivery')}
                    className="mt-1"
                />
                <span>
                    <span className="block text-sm font-semibold text-[#002d5b]">Place order now and pay after it is delivered</span>
                </span>
            </label>
        </fieldset>
    );
}

function CardMarks() {
    return (
        <span className="flex items-center gap-1" aria-label="Visa, Mastercard, American Express">
            <svg viewBox="0 0 32 20" className="h-5 w-8 shrink-0 rounded-[3px] border border-zinc-200 bg-white" aria-hidden>
                <rect width="32" height="20" rx="2" fill="#1A1F71" />
                <text x="16" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif">
                    VISA
                </text>
            </svg>
            <svg viewBox="0 0 32 20" className="h-5 w-8 shrink-0 rounded-[3px] border border-zinc-200 bg-white" aria-hidden>
                <rect width="32" height="20" rx="2" fill="#fff" />
                <circle cx="13" cy="10" r="6" fill="#EB001B" />
                <circle cx="19" cy="10" r="6" fill="#F79E1B" />
                <path d="M16 5.4a6 6 0 0 1 0 9.2 6 6 0 0 1 0-9.2z" fill="#FF5F00" />
            </svg>
            <svg viewBox="0 0 32 20" className="h-5 w-8 shrink-0 rounded-[3px] border border-zinc-200" aria-hidden>
                <rect width="32" height="20" rx="2" fill="#2E77BC" />
                <text x="16" y="13.5" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="700" fontFamily="Arial, sans-serif">
                    AMEX
                </text>
            </svg>
        </span>
    );
}
