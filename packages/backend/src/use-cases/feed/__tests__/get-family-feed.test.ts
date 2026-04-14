import { describe, it, expect, vi } from "vitest";

import type { IPostRepository } from "../../../repositories/interfaces/post-repo";
import { GetFamilyFeed } from "../get-family-feed";

function mockPostRepo(): IPostRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    getFamilyFeed: vi.fn(),
    delete: vi.fn(),
  };
}

describe("GetFamilyFeed", () => {
  it("returns paginated feed with default page size", async () => {
    const repo = mockPostRepo();
    const feed = { items: [], cursor: undefined };
    vi.mocked(repo.getFamilyFeed).mockResolvedValue(feed);

    const uc = new GetFamilyFeed(repo);
    const result = await uc.execute({ familyId: "f1" });

    expect(result).toEqual(feed);
    expect(repo.getFamilyFeed).toHaveBeenCalledWith("f1", 20, undefined);
  });

  it("respects custom limit and cursor", async () => {
    const repo = mockPostRepo();
    vi.mocked(repo.getFamilyFeed).mockResolvedValue({ items: [], cursor: undefined });

    const uc = new GetFamilyFeed(repo);
    await uc.execute({ familyId: "f1", limit: 5, cursor: "abc" });

    expect(repo.getFamilyFeed).toHaveBeenCalledWith("f1", 5, "abc");
  });
});
