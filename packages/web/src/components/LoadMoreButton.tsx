interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  visible?: boolean;
}

export function LoadMoreButton({ onClick, loading, visible = true }: LoadMoreButtonProps) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full py-2.5 mt-4 text-sm font-medium rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)] disabled:opacity-50"
    >
      {loading === true ? "Loading..." : "Load More"}
    </button>
  );
}
