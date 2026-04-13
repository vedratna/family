import { useNavigate } from "react-router";

import { useAuth } from "../providers/AuthProvider";

interface SeedUser {
  id: string;
  displayName: string;
}

const SEED_USERS: SeedUser[] = [
  { id: "user-1", displayName: "Raj Sharma" },
  { id: "user-2", displayName: "Priya Verma" },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(user: SeedUser) {
    login(user.id, user.displayName);
    void navigate("/feed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
          Family App
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 text-center">
          Select a user to continue
        </p>
        <div className="flex flex-col gap-3">
          {SEED_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                handleLogin(user);
              }}
              className="p-4 rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent-primary)] transition-colors text-left"
            >
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {user.displayName}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{user.id}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
