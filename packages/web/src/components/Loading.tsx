interface LoadingProps {
  label?: string;
}

export function Loading({ label = "Loading..." }: LoadingProps) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
