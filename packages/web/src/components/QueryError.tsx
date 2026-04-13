import type { CombinedError } from "urql";

import { formatErrorMessage } from "../lib/error-utils";

interface QueryErrorProps {
  error: CombinedError;
  onRetry: () => void;
}

export function QueryError({ error, onRetry }: QueryErrorProps) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-red-600 mb-3">{formatErrorMessage(error)}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity"
      >
        Retry
      </button>
    </div>
  );
}
