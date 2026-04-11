import { describe, it, expect, beforeEach, vi } from "vitest";

import { ActivationGateError } from "../../../domain/errors";
import type { IMembershipRepository } from "../../../repositories/interfaces/membership-repo";
import { CheckActivationGate } from "../check-activation-gate";

function createMockMembershipRepo(): IMembershipRepository {
  return {
    create: vi.fn(),
    getByFamilyId: vi.fn(),
    getByUserId: vi.fn(),
    getByFamilyAndPerson: vi.fn(),
    updateRole: vi.fn(),
    delete: vi.fn(),
    countActiveMembers: vi.fn(),
  };
}

describe("CheckActivationGate", () => {
  let membershipRepo: IMembershipRepository;
  let useCase: CheckActivationGate;

  beforeEach(() => {
    membershipRepo = createMockMembershipRepo();
    useCase = new CheckActivationGate(membershipRepo);
  });

  it("succeeds when family has 2 or more active members", async () => {
    vi.mocked(membershipRepo.countActiveMembers).mockResolvedValue(2);

    await expect(useCase.execute("family-1")).resolves.toBeUndefined();
  });

  it("succeeds when family has many active members", async () => {
    vi.mocked(membershipRepo.countActiveMembers).mockResolvedValue(10);

    await expect(useCase.execute("family-1")).resolves.toBeUndefined();
  });

  it("throws ActivationGateError when family has only 1 member", async () => {
    vi.mocked(membershipRepo.countActiveMembers).mockResolvedValue(1);

    await expect(useCase.execute("family-1")).rejects.toThrow(ActivationGateError);
  });

  it("throws ActivationGateError when family has 0 members", async () => {
    vi.mocked(membershipRepo.countActiveMembers).mockResolvedValue(0);

    await expect(useCase.execute("family-1")).rejects.toThrow(ActivationGateError);
  });
});
