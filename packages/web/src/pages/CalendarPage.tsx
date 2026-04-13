import type { EventType } from "@family-app/shared";
import { useMemo, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";

import { useCreateEvent } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toAgendaSections } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const EVENT_TYPES: EventType[] = [
  "birthday",
  "marriage",
  "anniversary",
  "exam",
  "social-function",
  "holiday",
  "custom",
];

export function CalendarPage() {
  const { events } = useMockData();
  const { activeFamilyId } = useFamily();
  const { createEvent, loading: eventLoading } = useCreateEvent();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("custom");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");

  const sections = useMemo(
    () => toAgendaSections(events, activeFamilyId),
    [events, activeFamilyId],
  );

  function handleCreateEvent(e: SyntheticEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    const input: Record<string, string> = {
      familyId: activeFamilyId,
      title: title.trim(),
      eventType,
      startDate,
    };
    if (startTime) input.startTime = startTime;
    if (location.trim()) input.location = location.trim();

    if (isApiMode()) {
      void createEvent({ input });
    } else {
      console.log("[mock] createEvent:", input);
    }

    setTitle("");
    setEventType("custom");
    setStartDate("");
    setStartTime("");
    setLocation("");
    setShowForm(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Calendar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm((v) => !v);
            }}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity"
          >
            {showForm ? "Cancel" : "New Event"}
          </button>
          <Link
            to="/calendar/month"
            className="px-3 py-1.5 text-sm text-[var(--color-accent-primary)] hover:underline font-medium"
          >
            Month View
          </Link>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateEvent}
          className="mb-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] flex flex-col gap-3"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder="Event title"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value as EventType);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
            }}
            placeholder="Location (optional)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={eventLoading || !title.trim() || !startDate}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {eventLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      )}

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
