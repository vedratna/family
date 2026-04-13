import type { RSVPStatus } from "@family-app/shared";
import { useMemo } from "react";
import { useParams, Link } from "react-router";

import { useRSVPEvent } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { personName } from "../lib/transforms";
import { useMockData } from "../providers/MockDataProvider";

const STATUS_COLORS: Record<string, string> = {
  going: "bg-green-100 text-green-800",
  maybe: "bg-yellow-100 text-yellow-800",
  "not-going": "bg-red-100 text-red-800",
};

const RSVP_OPTIONS: { label: string; value: RSVPStatus }[] = [
  { label: "Going", value: "going" },
  { label: "Maybe", value: "maybe" },
  { label: "Can't", value: "not-going" },
];

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, rsvps, persons } = useMockData();
  const { rsvpEvent, loading: rsvpLoading } = useRSVPEvent();

  const event = events.find((e) => e.id === eventId);

  const attendees = useMemo(() => {
    return rsvps
      .filter((r) => r.eventId === eventId)
      .map((r) => ({
        name: personName(persons, r.personId),
        status: r.status,
      }));
  }, [rsvps, eventId, persons]);

  function handleRSVP(status: RSVPStatus) {
    if (isApiMode()) {
      void rsvpEvent({ input: { eventId, status } });
    } else {
      console.log("[mock] rsvpEvent:", { eventId, status });
    }
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/calendar" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Calendar
        </Link>
        <p className="mt-4 text-[var(--color-text-secondary)]">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/calendar" className="text-sm text-[var(--color-accent-primary)] hover:underline">
        &larr; Back to Calendar
      </Link>

      <div className="mt-4 p-5 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)]">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{event.title}</h1>
        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-primary)] font-medium mb-4">
          {event.eventType}
        </span>

        <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
          <div className="flex gap-2">
            <span className="font-medium text-[var(--color-text-primary)]">Date:</span>
            <span>{event.startDate}</span>
          </div>
          {event.startTime !== undefined && (
            <div className="flex gap-2">
              <span className="font-medium text-[var(--color-text-primary)]">Time:</span>
              <span>{event.startTime}</span>
            </div>
          )}
          {event.location !== undefined && (
            <div className="flex gap-2">
              <span className="font-medium text-[var(--color-text-primary)]">Location:</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.recurrenceRule !== undefined && (
            <div className="flex gap-2">
              <span className="font-medium text-[var(--color-text-primary)]">Repeats:</span>
              <span>{event.recurrenceRule}</span>
            </div>
          )}
        </div>

        {event.description !== undefined && (
          <p className="mt-4 text-sm text-[var(--color-text-primary)] leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      {/* RSVP Buttons */}
      <div className="mt-4 flex gap-2">
        {RSVP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              handleRSVP(opt.value);
            }}
            disabled={rsvpLoading}
            className="flex-1 py-2 text-sm font-medium rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors disabled:opacity-50"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
          RSVPs ({attendees.length})
        </h2>
        <div className="flex flex-col gap-2">
          {attendees.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-secondary)]"
            >
              <span className="text-sm text-[var(--color-text-primary)]">{a.name}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] ?? ""}`}
              >
                {a.status}
              </span>
            </div>
          ))}
          {attendees.length === 0 && (
            <p className="text-sm text-[var(--color-text-tertiary)]">No RSVPs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
