import type { Invitation } from "@family-app/shared";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import { DynamoInvitationRepository } from "../invitation-repo";

import { createTestTable, deleteTestTable, getTestTableName } from "./test-helpers";

const TABLE_NAME = getTestTableName();

beforeAll(async () => {
  process.env["DYNAMODB_ENDPOINT"] = "http://localhost:8000";
  process.env["TABLE_NAME"] = TABLE_NAME;
  await createTestTable(TABLE_NAME);
});

afterAll(async () => {
  await deleteTestTable(TABLE_NAME);
});

describe("DynamoInvitationRepository", () => {
  const repo = new DynamoInvitationRepository();

  const invitation1: Invitation = {
    familyId: "family-1",
    phone: "+911234567890",
    invitedBy: "person-1",
    relationshipToInviter: "spouse",
    inverseRelationshipLabel: "spouse",
    role: "admin",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const invitation2: Invitation = {
    familyId: "family-2",
    phone: "+911234567890",
    invitedBy: "person-3",
    relationshipToInviter: "sibling",
    inverseRelationshipLabel: "sibling",
    role: "editor",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  it("creates and retrieves an invitation by family and phone", async () => {
    await repo.create(invitation1);
    const found = await repo.getByFamilyAndPhone("family-1", "+911234567890");
    expect(found).toBeDefined();
    expect(found?.invitedBy).toBe("person-1");
    expect(found?.relationshipToInviter).toBe("spouse");
    expect(found?.inverseRelationshipLabel).toBe("spouse");
    expect(found?.role).toBe("admin");
    expect(found?.status).toBe("pending");
  });

  it("returns undefined for non-existent invitation", async () => {
    const found = await repo.getByFamilyAndPhone("family-1", "+910000000000");
    expect(found).toBeUndefined();
  });

  it("gets all invitations by phone", async () => {
    await repo.create(invitation2);
    const invitations = await repo.getByPhone("+911234567890");
    expect(invitations).toHaveLength(2);
    const familyIds = invitations.map((inv) => inv.familyId).sort();
    expect(familyIds).toEqual(["family-1", "family-2"]);
  });

  it("returns empty array for phone with no invitations", async () => {
    const invitations = await repo.getByPhone("+910000000000");
    expect(invitations).toHaveLength(0);
  });

  it("updates status and verifies change", async () => {
    await repo.updateStatus("family-1", "+911234567890", "accepted");
    const found = await repo.getByFamilyAndPhone("family-1", "+911234567890");
    expect(found?.status).toBe("accepted");
    expect(found?.invitedBy).toBe("person-1");
  });

  it("updates status to expired", async () => {
    await repo.updateStatus("family-2", "+911234567890", "expired");
    const found = await repo.getByFamilyAndPhone("family-2", "+911234567890");
    expect(found?.status).toBe("expired");
  });
});
