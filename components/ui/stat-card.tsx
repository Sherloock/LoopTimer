interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  className = "",
  valueClassName = "font-mono text-2xl font-bold",
}: StatCardProps) {
  return (
    <div className={`rounded-lg bg-secondary px-4 py-2 ${className}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
}
