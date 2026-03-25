interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "[ ]", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-4xl font-mono text-[var(--text-ghost)] mb-4">{icon}</div>
      <h3 className="text-sm font-mono tracking-widest uppercase text-[var(--text-dim)] mb-2">// {title}</h3>
      {description && (
        <p className="text-xs font-mono text-[var(--text-ghost)] max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
