import type { FamilyEvent } from "@family-app/shared";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "urql";

import { FAMILY_EVENTS_QUERY } from "../lib/graphql-operations";
import { isApiMode } from "../lib/mode";
import { toMonthDays } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarMonthPage() {
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();

  // Fetch events for a wide date range (1 year back, 1 year forward)
  const eventsStartDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split("T")[0] ?? "";
  }, []);
  const eventsEndDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0] ?? "";
  }, []);

  const [eventsResult] = useQuery({
    query: FAMILY_EVENTS_QUERY,
    variables: { familyId: activeFamilyId, startDate: eventsStartDate, endDate: eventsEndDate },
    pause: !isApiMode() || !activeFamilyId,
  });

  const events = useMemo((): FamilyEvent[] | null => {
    if (isApiMode()) {
      if (eventsResult.fetching) return null;
      const raw = eventsResult.data as { familyEvents: FamilyEvent[] } | undefined;
      return raw?.familyEvents ?? [];
    }
    return mockData.events;
  }, [eventsResult.fetching, eventsResult.data, mockData.events]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const days = useMemo(() => {
    if (events === null) return null;
    return toMonthDays(events, year, month, activeFamilyId);
  }, [events, year, month, activeFamilyId]);

  const familyEvents = useMemo(() => {
    if (events === null) return [];
    return events.filter((e) => e.familyId === activeFamilyId);
  }, [events, activeFamilyId]);

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return familyEvents.filter((e) => {
      const d = new Date(e.startDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
    });
  }, [familyEvents, selectedDay, year, month]);

  const onPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const onNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  if (days === null) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/calendar"
          className="text-sm text-[var(--color-accent-primary)] hover:underline font-medium"
        >
          &larr; Agenda
        </Link>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Month View</h1>
        <div className="w-16" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="px-3 py-1 text-sm rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
        >
          &larr;
        </button>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={onNextMonth}
          className="px-3 py-1 text-sm rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
        >
          &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--color-border-secondary)] rounded-lg overflow-hidden">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-[var(--color-bg-secondary)] p-2 text-center text-xs font-semibold text-[var(--color-text-tertiary)]"
          >
            {day}
          </div>
        ))}
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => {
              if (day.isCurrentMonth) setSelectedDay(day.date);
            }}
            className={`bg-[var(--color-bg-card)] p-2 text-center text-sm min-h-[40px] relative transition-colors ${
              day.isCurrentMonth
                ? "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer"
                : "text-[var(--color-text-tertiary)]"
            } ${day.isToday ? "font-bold" : ""} ${
              day.isCurrentMonth && day.date === selectedDay ? "bg-[var(--color-accent-light)]" : ""
            }`}
          >
            {day.date}
            {day.hasEvents && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
            )}
          </button>
        ))}
      </div>

      {selectedDay !== null && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
            Events on {MONTH_NAMES[month]} {selectedDay}
          </h3>
          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)]">No events on this day.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedDayEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/calendar/${event.startDate}/${event.id}`}
                  className="p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)] transition-colors"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {event.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {event.startTime ?? "All day"}
                    {event.location !== undefined ? ` \u00B7 ${event.location}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
