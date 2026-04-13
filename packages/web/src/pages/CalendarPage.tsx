import { useMemo } from "react";
import { Link } from "react-router";

import { toAgendaSections } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

export function CalendarPage() {
  const { events } = useMockData();
  const { activeFamilyId } = useFamily();

  const sections = useMemo(
    () => toAgendaSections(events, activeFamilyId),
    [events, activeFamilyId],
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Calendar</h1>
        <Link
          to="/calendar/month"
          className="text-sm text-[var(--color-accent-primary)] hover:underline font-medium"
        >
          Month View
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <div key={section.date}>
            <h2 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
              {section.dateLabel}
            </h2>
            <div className="flex flex-col gap-2">
              {section.events.map((event) => (
                <Link
                  key={event.id}
                  to={`/calendar/${event.id}`}
                  className="p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)] transition-colors"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {event.title}
                  </p>
                  <div className="flex gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
                    {event.startTime !== undefined && <span>{event.startTime}</span>}
                    {event.location !== undefined && <span>&middot; {event.location}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No upcoming events.</p>
        )}
      </div>
    </div>
  );
}
