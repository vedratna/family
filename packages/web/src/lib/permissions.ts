export type Role = "owner" | "admin" | "editor" | "viewer";

const ADMIN_ROLES: ReadonlySet<Role> = new Set(["owner", "admin"]);
const EDITOR_PLUS: ReadonlySet<Role> = new Set(["owner", "admin", "editor"]);

export function isAdmin(role: string | undefined): boolean {
  return ADMIN_ROLES.has(role as Role);
}

export function canEditPost(
  role: string | undefined,
  authorPersonId: string,
  activePersonId: string | undefined,
): boolean {
  if (activePersonId !== undefined && authorPersonId === activePersonId) return true;
  return isAdmin(role);
}
export const canDeletePost = canEditPost;

export function canEditEvent(
  role: string | undefined,
  creatorPersonId: string,
  activePersonId: string | undefined,
): boolean {
  if (activePersonId !== undefined && creatorPersonId === activePersonId) return true;
  return isAdmin(role);
}
export const canDeleteEvent = canEditEvent;

export function canEditChore(role: string | undefined): boolean {
  return EDITOR_PLUS.has(role as Role);
}
export const canDeleteChore = canEditChore;

export function canEditRelationship(role: string | undefined): boolean {
  return isAdmin(role);
}
export const canDeleteRelationship = canEditRelationship;

export function canManageMembers(role: string | undefined): boolean {
  return isAdmin(role);
}
