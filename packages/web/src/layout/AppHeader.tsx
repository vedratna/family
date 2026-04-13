import { useFamily } from "../providers/FamilyProvider";

export function AppHeader() {
  const { activeFamily, families, switchFamily, activeFamilyId } = useFamily();

  const cycleFamilies = () => {
    const currentIndex = families.findIndex((f) => f.id === activeFamilyId);
    const nextIndex = (currentIndex + 1) % families.length;
    const nextFamily = families[nextIndex];
    if (nextFamily) {
      switchFamily(nextFamily.id);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-card)] border-b border-[var(--color-border-primary)]">
      <button
        onClick={cycleFamilies}
        className="text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors"
      >
        {activeFamily?.name ?? "Family App"}
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </header>
  );
}
