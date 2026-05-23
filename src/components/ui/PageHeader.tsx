interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, right }: Props) {
  return (
    <header className="pt-10 pb-8 flex items-start justify-between gap-6 animate-fade-in">
      <div className="min-w-0">
        <h1 className="text-display-md text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-text-muted text-sm mt-1.5">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </header>
  );
}
