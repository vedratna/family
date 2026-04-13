import type { ThemeName } from "@family-app/shared";
import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router";

import { useCreateFamily } from "../lib/hooks";
import { useFamily } from "../providers/FamilyProvider";

const THEME_OPTIONS: { name: ThemeName; color: string }[] = [
  { name: "teal", color: "#2B8A7E" },
  { name: "indigo", color: "#5B5FC7" },
  { name: "coral", color: "#C96B5B" },
  { name: "sage", color: "#6B8F71" },
  { name: "amber", color: "#B8860B" },
  { name: "ocean", color: "#3A7CA5" },
  { name: "plum", color: "#8B5E83" },
  { name: "slate", color: "#64748B" },
];

export function CreateFirstFamilyPage() {
  const { createFamily, loading } = useCreateFamily();
  const { refetchFamilies } = useFamily();
  const navigate = useNavigate();

  const [familyName, setFamilyName] = useState("");
  const [themeName, setThemeName] = useState<ThemeName>("teal");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!familyName.trim()) return;

    setError(null);
    const result = await createFamily({ name: familyName.trim(), themeName });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    refetchFamilies();
    void navigate("/feed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Welcome to Family App!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Create your first family to get started.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="p-6 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="family-name"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
            >
              Family Name
            </label>
            <input
              id="family-name"
              type="text"
              value={familyName}
              onChange={(e) => {
                setFamilyName(e.target.value);
              }}
              placeholder="e.g. The Johnson Family"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Theme</p>
            <div className="flex flex-wrap gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    setThemeName(theme.name);
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    theme.name === themeName
                      ? "border-[var(--color-text-primary)] scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          {error !== null && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !familyName.trim()}
            className="w-full py-2.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Family"}
          </button>
        </form>
      </div>
    </div>
  );
}
