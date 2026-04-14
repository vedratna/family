import { describe, it, expect, vi } from "vitest";

import type { IReactionRepository } from "../../../repositories/interfaces/post-repo";
import { AddReaction, RemoveReaction } from "../reactions";

function mockReactionRepo(): IReactionRepository {
  return {
    add: vi.fn(),
    remove: vi.fn(),
    getByPostId: vi.fn(),
  };
}

describe("AddReaction", () => {
  it("creates and returns a reaction", async () => {
    const repo = mockReactionRepo();
    const uc = new AddReaction(repo);

    const result = await uc.execute({ postId: "post1", personId: "p1", emoji: "heart" });

    expect(result.postId).toBe("post1");
    expect(result.personId).toBe("p1");
    expect(result.emoji).toBe("heart");
    expect(result.createdAt).toBeDefined();
    expect(repo.add).toHaveBeenCalledOnce();
  });
});

describe("RemoveReaction", () => {
  it("delegates to repo.remove", async () => {
    const repo = mockReactionRepo();
    const uc = new RemoveReaction(repo);

    await uc.execute("post1", "p1");

    expect(repo.remove).toHaveBeenCalledWith("post1", "p1");
  });
});
