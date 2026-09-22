interface SelectionCardProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
  selected: boolean;
  onChange: (selected: boolean) => void;
}

export function SelectionCard({
  title,
  description,
  icon,
  selected,
  onChange,
}: SelectionCardProps) {
  return (
    <button
      onClick={() => onChange(!selected)}
      style={{
        backgroundColor: selected ? 'rgba(215, 125, 95, 0.05)' : 'var(--color-base-white)',
        borderColor: selected ? 'var(--color-accent-primary)' : 'var(--color-bg-warm-gray)',
      }}
      className="w-full rounded-2xl border px-6 py-6 text-left transition-all hover:border-accent-primary hover:bg-opacity-50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 style={{ color: 'var(--color-text-primary)' }} className="text-lg font-semibold">
              {title}
            </h3>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-base">
            {description}
          </p>
        </div>
        {selected && (
          <div style={{ backgroundColor: 'var(--color-accent-primary)' }} className="ml-4 h-6 w-6 rounded-full flex items-center justify-center text-white flex-shrink-0">
            ✓
          </div>
        )}
      </div>
    </button>
  );
}
