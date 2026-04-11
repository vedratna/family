import type { FamilyEvent, RSVPStatus, Person, EventRSVP } from "@family-app/shared";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";
import { useNavigation } from "../shared/navigation/ScreenRouter";

interface AgendaEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  startTime?: string;
  location?: string;
}

interface AgendaSection {
  date: string;
  dateLabel: string;
  events: AgendaEvent[];
}

interface AgendaScreenProps {
  sections: AgendaSection[];
  onEventPress: (eventId: string) => void;
  onSwitchToMonth: () => void;
}

interface DayData {
  date: number;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  isToday: boolean;
}

interface CalendarMonthScreenProps {
  year: number;
  month: number;
  days: DayData[];
  onDayPress: (date: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSwitchToAgenda: () => void;
}

interface RSVPEntry {
  personName: string;
  status: RSVPStatus;
}

interface EventDetailScreenProps {
  title: string;
  eventType: string;
  startDate: string;
  startTime?: string;
  location?: string;
  description?: string;
  isRecurring: boolean;
  userRSVP?: RSVPStatus;
  attendees: RSVPEntry[];
  onRSVP: (status: RSVPStatus) => void;
  onEdit: () => void;
  canEdit: boolean;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function buildAgendaSections(events: FamilyEvent[]): AgendaSection[] {
  const grouped = new Map<string, FamilyEvent[]>();
  for (const event of events) {
    const existing = grouped.get(event.startDate);
    if (existing) {
      existing.push(event);
    } else {
      grouped.set(event.startDate, [event]);
    }
  }

  const sortedDates = [...grouped.keys()].sort();
  return sortedDates.map((date) => ({
    date,
    dateLabel: formatDateLabel(date),
    events: (grouped.get(date) ?? []).map(
      (e): AgendaEvent => ({
        id: e.id,
        title: e.title,
        eventType: e.eventType,
        startDate: e.startDate,
        ...(e.startTime !== undefined ? { startTime: e.startTime } : {}),
        ...(e.location !== undefined ? { location: e.location } : {}),
      }),
    ),
  }));
}

function buildMonthDays(year: number, month: number, events: FamilyEvent[]): DayData[] {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventDates = new Set(
    events
      .filter((e) => {
        const d = new Date(e.startDate);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.startDate).getDate()),
  );

  const days: DayData[] = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      hasEvents: false,
      isToday: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: d,
      isCurrentMonth: true,
      hasEvents: eventDates.has(d),
      isToday: year === todayYear && month === todayMonth && d === todayDate,
    });
  }

  // Next month padding to fill 6 rows
  const totalCells = Math.ceil(days.length / 7) * 7;
  for (let d = 1; days.length < totalCells; d++) {
    days.push({
      date: d,
      isCurrentMonth: false,
      hasEvents: false,
      isToday: false,
    });
  }

  return days;
}

function personName(persons: Person[], personId: string): string {
  return persons.find((p) => p.id === personId)?.name ?? personId;
}

function buildAttendees(rsvps: EventRSVP[], eventId: string, persons: Person[]): RSVPEntry[] {
  return rsvps
    .filter((r) => r.eventId === eventId)
    .map((r) => ({
      personName: personName(persons, r.personId),
      status: r.status,
    }));
}

// Placeholder screen components
function AgendaScreen(_props: AgendaScreenProps) {
  return null;
}

function CalendarMonthScreen(_props: CalendarMonthScreenProps) {
  return null;
}

function EventDetailScreen(_props: EventDetailScreenProps) {
  return null;
}

export function CalendarContainer() {
  const { events, rsvps, persons } = useMockData();
  const { activeFamilyId } = useFamily();
  const { screenState, navigate, goBack } = useNavigation();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const familyEvents = useMemo(
    () => events.filter((e) => e.familyId === activeFamilyId),
    [events, activeFamilyId],
  );

  const sections = useMemo(() => buildAgendaSections(familyEvents), [familyEvents]);

  const days = useMemo(
    () => buildMonthDays(year, month, familyEvents),
    [year, month, familyEvents],
  );

  const onEventPress = useCallback(
    (eventId: string) => {
      navigate("detail", { eventId });
    },
    [navigate],
  );

  const onSwitchToMonth = useCallback(() => {
    navigate("month");
  }, [navigate]);

  const onSwitchToAgenda = useCallback(() => {
    navigate("agenda");
  }, [navigate]);

  const onPrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const onNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  if (screenState.screen === "detail") {
    const eventId = screenState.params["eventId"] ?? "";
    const event = familyEvents.find((e) => e.id === eventId);

    if (!event) {
      return (
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
      );
    }

    const attendees = buildAttendees(rsvps, eventId, persons);

    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <EventDetailScreen
          title={event.title}
          eventType={event.eventType}
          startDate={event.startDate}
          {...(event.startTime !== undefined ? { startTime: event.startTime } : {})}
          {...(event.location !== undefined ? { location: event.location } : {})}
          {...(event.description !== undefined ? { description: event.description } : {})}
          isRecurring={event.recurrenceRule !== undefined}
          attendees={attendees}
          onRSVP={() => {}}
          onEdit={() => {}}
          canEdit={true}
        />
      </>
    );
  }

  if (screenState.screen === "month") {
    return (
      <CalendarMonthScreen
        year={year}
        month={month}
        days={days}
        onDayPress={() => {}}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onSwitchToAgenda={onSwitchToAgenda}
      />
    );
  }

  return (
    <AgendaScreen
      sections={sections}
      onEventPress={onEventPress}
      onSwitchToMonth={onSwitchToMonth}
    />
  );
}
