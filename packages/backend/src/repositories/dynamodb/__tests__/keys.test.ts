import { describe, it, expect } from "vitest";

import { keys } from "../keys";

describe("DynamoDB key builders", () => {
  describe("user keys", () => {
    it("builds user PK", () => {
      expect(keys.user.pk("user-123")).toBe("USER#user-123");
    });

    it("builds profile SK", () => {
      expect(keys.user.sk.profile).toBe("PROFILE");
    });

    it("builds notification preference SK", () => {
      expect(keys.user.sk.notifPref("fam-1", "events-reminders")).toBe(
        "NOTIFPREF#fam-1#events-reminders",
      );
    });

    it("builds device token SK", () => {
      expect(keys.user.sk.device("token-abc")).toBe("DEVICE#token-abc");
    });
  });

  describe("family keys", () => {
    it("builds family PK", () => {
      expect(keys.family.pk("fam-123")).toBe("FAMILY#fam-123");
    });

    it("builds metadata SK", () => {
      expect(keys.family.sk.metadata).toBe("METADATA");
    });

    it("builds member SK", () => {
      expect(keys.family.sk.member("person-1")).toBe("MEMBER#person-1");
    });

    it("builds relationship SK with both person IDs", () => {
      expect(keys.family.sk.relationship("a-1", "b-2")).toBe("REL#a-1#b-2");
    });

    it("builds post SK with timestamp and ID", () => {
      expect(keys.family.sk.post("2026-04-06T12:00:00Z", "post-1")).toBe(
        "POST#2026-04-06T12:00:00Z#post-1",
      );
    });

    it("builds event SK with date and ID", () => {
      expect(keys.family.sk.event("2026-04-12", "evt-1")).toBe("EVENT#2026-04-12#evt-1");
    });

    it("builds tree cache SK", () => {
      expect(keys.family.sk.treeCache).toBe("TREE_CACHE");
    });

    it("builds invite SK", () => {
      expect(keys.family.sk.invite("+919876543210")).toBe("INVITE#+919876543210");
    });
  });

  describe("post keys", () => {
    it("builds post PK", () => {
      expect(keys.post.pk("post-123")).toBe("POST#post-123");
    });

    it("builds comment SK", () => {
      expect(keys.post.sk.comment("2026-04-06T12:00:00Z", "cmt-1")).toBe(
        "COMMENT#2026-04-06T12:00:00Z#cmt-1",
      );
    });

    it("builds reaction SK", () => {
      expect(keys.post.sk.reaction("person-1")).toBe("REACTION#person-1");
    });

    it("builds media SK with zero-padded order index", () => {
      expect(keys.post.sk.media(0, "media-1")).toBe("MEDIA#000#media-1");
      expect(keys.post.sk.media(5, "media-2")).toBe("MEDIA#005#media-2");
      expect(keys.post.sk.media(12, "media-3")).toBe("MEDIA#012#media-3");
    });
  });

  describe("GSI1 keys", () => {
    it("builds phone GSI1PK", () => {
      expect(keys.gsi1.phone("+919876543210")).toBe("PHONE#+919876543210");
    });

    it("builds user GSI1PK", () => {
      expect(keys.gsi1.user("user-1")).toBe("USER#user-1");
    });

    it("builds reverse relationship GSI1SK", () => {
      expect(keys.gsi1.relReverse("b-2", "a-1")).toBe("RELP#b-2#a-1");
    });
  });

  describe("GSI2 keys", () => {
    it("builds event type GSI2PK", () => {
      expect(keys.gsi2.eventType("fam-1", "birthday")).toBe("EVTYPE#fam-1#birthday");
    });
  });

  describe("prefixes", () => {
    it("has correct prefixes for begins_with queries", () => {
      expect(keys.prefix.member).toBe("MEMBER#");
      expect(keys.prefix.post).toBe("POST#");
      expect(keys.prefix.relationship).toBe("REL#");
      expect(keys.prefix.event).toBe("EVENT#");
    });
  });
});
