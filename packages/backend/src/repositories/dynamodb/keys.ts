// Key builders for DynamoDB single-table design.
// Each function returns a string key following the access patterns documented in access-patterns.md.

export const keys = {
  user: {
    pk: (userId: string) => `USER#${userId}`,
    sk: {
      profile: "PROFILE" as const,
      notifPref: (familyId: string, category: string) => `NOTIFPREF#${familyId}#${category}`,
      device: (deviceToken: string) => `DEVICE#${deviceToken}`,
    },
  },

  family: {
    pk: (familyId: string) => `FAMILY#${familyId}`,
    sk: {
      metadata: "METADATA" as const,
      member: (personId: string) => `MEMBER#${personId}`,
      person: (personId: string) => `PERSON#${personId}`,
      relationship: (personAId: string, personBId: string) => `REL#${personAId}#${personBId}`,
      post: (timestamp: string, postId: string) => `POST#${timestamp}#${postId}`,
      event: (date: string, eventId: string) => `EVENT#${date}#${eventId}`,
      chore: (choreId: string) => `CHORE#${choreId}`,
      treeCache: "TREE_CACHE" as const,
      invite: (phone: string) => `INVITE#${phone}`,
    },
  },

  post: {
    pk: (postId: string) => `POST#${postId}`,
    sk: {
      comment: (timestamp: string, commentId: string) => `COMMENT#${timestamp}#${commentId}`,
      reaction: (personId: string) => `REACTION#${personId}`,
      media: (orderIndex: number, mediaId: string) =>
        `MEDIA#${String(orderIndex).padStart(3, "0")}#${mediaId}`,
    },
  },

  event: {
    pk: (eventId: string) => `EVENT#${eventId}`,
    sk: {
      rsvp: (personId: string) => `RSVP#${personId}`,
    },
  },

  // GSI1 keys
  gsi1: {
    phone: (phone: string) => `PHONE#${phone}`,
    user: (userId: string) => `USER#${userId}`,
    family: (familyId: string) => `FAMILY#${familyId}`,
    person: (personId: string) => `PERSON#${personId}`,
    relReverse: (personBId: string, personAId: string) => `RELP#${personBId}#${personAId}`,
  },

  // GSI2 keys
  gsi2: {
    eventType: (familyId: string, type: string) => `EVTYPE#${familyId}#${type}`,
  },

  // Prefix helpers for begins_with queries
  prefix: {
    member: "MEMBER#",
    person: "PERSON#",
    relationship: "REL#",
    post: "POST#",
    event: "EVENT#",
    chore: "CHORE#",
    comment: "COMMENT#",
    reaction: "REACTION#",
    media: "MEDIA#",
    rsvp: "RSVP#",
    notifPref: "NOTIFPREF#",
    device: "DEVICE#",
    invite: "INVITE#",
    relReverse: "RELP#",
  },
} as const;
