interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold">
          {getStepTitle(current)}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="text-base font-medium">
          {current} / {total}
        </p>
      </div>
      <div style={{ backgroundColor: 'var(--color-bg-warm-gray)' }} className="h-1 w-full rounded-full overflow-hidden">
        <div
          style={{
            backgroundColor: 'var(--color-accent-primary)',
            width: `${(current / total) * 100}%`,
          }}
          className="h-full transition-all duration-300"
        />
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  const titles = [
    'SNSでどんなことをしたいですか？',
    'どんなジャンルを発信しますか？',
    'どんな方に届けたいですか？',
    'あなたについて教えてください',
  ];
  return titles[step - 1] || '';
}
