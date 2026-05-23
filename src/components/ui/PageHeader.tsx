interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, right }: Props) {
  return (
    <header className="pt-6 pb-6 flex items-start justify-between gap-4 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
