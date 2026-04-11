import type { Role } from "@family-app/shared";

import { PermissionDeniedError } from "../domain/errors";

const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function requireRole(userRole: Role, minimumRole: Role, action: string): void {
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minimumRole]) {
    throw new PermissionDeniedError(action);
  }
}
