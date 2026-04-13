import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">Page not found.</p>
      <Link to="/feed" className="text-[var(--color-accent-primary)] underline">
        Back to Feed
      </Link>
    </div>
  );
}
