import type { RSVPStatus, FamilyEvent } from "@family-app/shared";
import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery } from "urql";

import { ConfirmModal } from "../components/ConfirmModal";
import { InlineEdit } from "../components/InlineEdit";
import { Loading } from "../components/Loading";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import { EVENT_DETAIL_QUERY, EVENT_RSVPS_QUERY } from "../lib/graphql-operations";
import { useRSVPEvent, useEditEvent, useDeleteEvent } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { personName } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
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

interface ApiRSVP {
  eventId: string;
  personId: string;
  personName: string;
  status: RSVPStatus;
  updatedAt: string;
}

interface ApiEvent extends FamilyEvent {
  creatorName: string;
}

export function EventDetailPage() {
  const { eventId, date } = useParams<{ eventId: string; date: string }>();
  const navigate = useNavigate();
  const mockData = useMockData();
  const { activeFamilyId, activePersonId } = useFamily();
  const { rsvpEvent, loading: rsvpLoading } = useRSVPEvent();
  const { editEvent } = useEditEvent();
  const { deleteEvent, loading: deleteLoading } = useDeleteEvent();
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [eventResult, reexecuteEvent] = useQuery({
    query: EVENT_DETAIL_QUERY,
    variables: { familyId: activeFamilyId, date: date ?? "", eventId: eventId ?? "" },
    pause: !isApiMode() || eventId === undefined || !activeFamilyId || date === undefined,
  });

  const [rsvpsResult, reexecuteRsvps] = useQuery({
    query: EVENT_RSVPS_QUERY,
    variables: { eventId: eventId ?? "" },
    pause: !isApiMode() || eventId === undefined,
  });

  const event = useMemo((): ApiEvent | FamilyEvent | null => {
    if (isApiMode()) {
      const raw = eventResult.data as { eventDetail: ApiEvent | null } | undefined;
      return raw?.eventDetail ?? null;
    }
    return mockData.events.find((e) => e.id === eventId) ?? null;
  }, [eventResult.data, mockData.events, eventId]);

  const creatorName = isApiMode() && event !== null ? (event as ApiEvent).creatorName : null;

  const rsvps = useMemo((): ApiRSVP[] => {
    if (isApiMode()) {
      const raw = rsvpsResult.data as { eventRSVPs: ApiRSVP[] } | undefined;
      return raw?.eventRSVPs ?? [];
    }
    return [];
  }, [rsvpsResult.data]);

  const currentUserRsvpStatus = useMemo((): RSVPStatus | null => {
    if (activePersonId === undefined) return null;
    const match = rsvps.find((r) => r.personId === activePersonId);
    return match?.status ?? null;
  }, [rsvps, activePersonId]);

  const attendees = useMemo(() => {
    if (isApiMode()) {
      return rsvps.map((r) => ({
        name: r.personName,
        status: r.status,
      }));
    }
    return mockData.rsvps
      .filter((r) => r.eventId === eventId)
      .map((r) => ({
        name: personName(mockData.persons, r.personId),
        status: r.status,
      }));
  }, [rsvps, mockData.rsvps, mockData.persons, eventId]);

  const loading = isApiMode() && (eventResult.fetching || rsvpsResult.fetching);

  function handleRSVP(status: RSVPStatus) {
    setRsvpError(null);
    if (isApiMode()) {
      void rsvpEvent({ eventId, status }).then((result) => {
        if (result.error) {
          setRsvpError(formatErrorMessage(result.error));
          return;
        }
        reexecuteRsvps({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] rsvpEvent:", { eventId, status });
    }
  }

  function handleEditField(field: "title" | "description" | "location", next: string) {
    setEditError(null);
    if (!isApiMode() || !event) {
      console.log("[mock] editEvent:", { field, value: next });
      return;
    }
    const input: Record<string, string | undefined> = {
      familyId: activeFamilyId,
      eventId,
      date,
    };
    input[field] = next;
    void editEvent({ input }).then((result) => {
      if (result.error) {
        setEditError(formatErrorMessage(result.error));
        return;
      }
      reexecuteEvent({ requestPolicy: "network-only" });
    });
  }

  function handleDeleteEvent() {
    setDeleteError(null);
    if (isApiMode()) {
      void deleteEvent({ familyId: activeFamilyId, date, eventId }).then((result) => {
        if (result.error) {
          setDeleteError(formatErrorMessage(result.error));
          setShowDeleteModal(false);
          return;
        }
        setShowDeleteModal(false);
        void navigate("/calendar");
      });
    } else {
      console.log("[mock] deleteEvent:", { familyId: activeFamilyId, date, eventId });
      setShowDeleteModal(false);
      void navigate("/calendar");
    }
  }

  if (eventResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/calendar" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Calendar
        </Link>
        <QueryError
          error={eventResult.error}
          onRetry={() => {
            reexecuteEvent({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (rsvpsResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/calendar" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Calendar
        </Link>
        <QueryError
          error={rsvpsResult.error}
          onRetry={() => {
            reexecuteRsvps({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/calendar" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Calendar
        </Link>
        <Loading />
      </div>
    );
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
        <InlineEdit
          value={event.title}
          onSave={(next) => {
            handleEditField("title", next);
          }}
          className="text-xl font-bold text-[var(--color-text-primary)] mb-1"
        />
        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-primary)] font-medium mb-4">
          {event.eventType}
        </span>

        <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
          {creatorName !== null && (
            <div className="flex gap-2">
              <span className="font-medium text-[var(--color-text-primary)]">Created by:</span>
              <span>{creatorName}</span>
            </div>
          )}
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
          <div className="flex gap-2 items-start">
            <span className="font-medium text-[var(--color-text-primary)]">Location:</span>
            <InlineEdit
              value={event.location ?? ""}
              onSave={(next) => {
                handleEditField("location", next);
              }}
              placeholder="Add location"
            />
          </div>
          {event.recurrenceRule !== undefined && (
            <div className="flex gap-2">
              <span className="font-medium text-[var(--color-text-primary)]">Repeats:</span>
              <span>{event.recurrenceRule}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <InlineEdit
            value={event.description ?? ""}
            onSave={(next) => {
              handleEditField("description", next);
            }}
            multiline
            placeholder="Add description"
            className="text-sm text-[var(--color-text-primary)] leading-relaxed"
          />
        </div>

        {editError !== null && <p className="text-sm text-red-600 mt-2">{editError}</p>}
      </div>

      {/* Delete Event */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(true);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          Delete Event
        </button>
        {deleteError !== null && <span className="text-sm text-red-600">{deleteError}</span>}
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Event"
        message="Delete this event? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setShowDeleteModal(false);
        }}
      />

      {/* RSVP Buttons */}
      <div className="mt-4 flex gap-2">
        {RSVP_OPTIONS.map((opt) => {
          const isActive = currentUserRsvpStatus === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                handleRSVP(opt.value);
              }}
              disabled={rsvpLoading}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                isActive
                  ? "bg-[var(--color-accent-primary)] text-white border-[var(--color-accent-primary)]"
                  : "border-[var(--color-border-secondary)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {rsvpError !== null && <p className="text-sm text-red-600 mt-2">{rsvpError}</p>}

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
