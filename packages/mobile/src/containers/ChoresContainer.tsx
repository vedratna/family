import type { ChoreStatus } from "@family-app/shared";
import { useCallback, useMemo } from "react";

import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";
import { useNavigation } from "../shared/navigation/ScreenRouter";

interface ChoreItem {
  id: string;
  title: string;
  assigneeName: string;
  dueDate?: string;
  status: ChoreStatus;
}

interface ChoreListScreenProps {
  chores: ChoreItem[];
  onChorePress: (choreId: string) => void;
  onCreateChore: () => void;
  onComplete: (choreId: string) => void;
}

// Placeholder screen component
function ChoreListScreen(_props: ChoreListScreenProps) {
  return null;
}

export function ChoresContainer() {
  const { chores, persons } = useMockData();
  const { activeFamilyId } = useFamily();
  const { screenState } = useNavigation();

  // screenState.screen is always "list" for this tab — included for consistency
  void screenState;

  const choreItems = useMemo<ChoreItem[]>(() => {
    const familyChores = chores.filter((c) => c.familyId === activeFamilyId);
    return familyChores.map(
      (c): ChoreItem => ({
        id: c.id,
        title: c.title,
        assigneeName: persons.find((p) => p.id === c.assigneePersonId)?.name ?? c.assigneePersonId,
        ...(c.dueDate !== undefined ? { dueDate: c.dueDate } : {}),
        status: c.status,
      }),
    );
  }, [chores, activeFamilyId, persons]);

  const onChorePress = useCallback((_choreId: string) => {
    // No detail screen for chores
  }, []);

  const onComplete = useCallback((_choreId: string) => {
    // Would mark chore complete in real app
  }, []);

  return (
    <ChoreListScreen
      chores={choreItems}
      onChorePress={onChorePress}
      onCreateChore={() => {}}
      onComplete={onComplete}
    />
  );
}
