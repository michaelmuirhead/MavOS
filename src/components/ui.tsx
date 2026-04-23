export function PageIntro({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-ink-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="label">{label}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="card p-8 text-center">
      <div className="text-sm text-ink-300">{message}</div>
      {hint && <div className="text-xs text-ink-500 mt-2">{hint}</div>}
    </div>
  );
}
