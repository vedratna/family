// ─── Feed / Post Queries ───

export const FAMILY_FEED_QUERY = `
  query FamilyFeed($familyId: ID!, $limit: Int, $cursor: String) {
    familyFeed(familyId: $familyId, limit: $limit, cursor: $cursor) {
      items { id familyId authorPersonId textContent isSystemPost createdAt }
      cursor
    }
  }
`;

export const POST_DETAIL_QUERY = `
  query PostDetail($postId: ID!) {
    post(postId: $postId) {
      id familyId authorPersonId textContent isSystemPost createdAt
    }
  }
`;

export const POST_COMMENTS_QUERY = `
  query PostComments($postId: ID!) {
    comments(postId: $postId) {
      id postId personId textContent createdAt
    }
  }
`;

export const POST_REACTIONS_QUERY = `
  query PostReactions($postId: ID!) {
    reactions(postId: $postId) {
      postId personId emoji createdAt
    }
  }
`;

export const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id familyId authorPersonId textContent isSystemPost createdAt
    }
  }
`;

export const ADD_COMMENT_MUTATION = `
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id postId personId textContent createdAt
    }
  }
`;

export const ADD_REACTION_MUTATION = `
  mutation AddReaction($input: AddReactionInput!) {
    addReaction(input: $input) {
      postId personId emoji createdAt
    }
  }
`;

export const DELETE_POST_MUTATION = `
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

export const DELETE_COMMENT_MUTATION = `
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId)
  }
`;

// ─── Event Queries ───

export const FAMILY_EVENTS_QUERY = `
  query FamilyEvents($familyId: ID!) {
    familyEvents(familyId: $familyId) {
      id familyId creatorPersonId title description eventType startDate startTime location recurrenceRule createdAt
    }
  }
`;

export const EVENT_DETAIL_QUERY = `
  query EventDetail($eventId: ID!) {
    event(eventId: $eventId) {
      id familyId creatorPersonId title description eventType startDate startTime location recurrenceRule createdAt
    }
  }
`;

export const EVENT_RSVPS_QUERY = `
  query EventRSVPs($eventId: ID!) {
    eventRSVPs(eventId: $eventId) {
      eventId personId status updatedAt
    }
  }
`;

export const CREATE_EVENT_MUTATION = `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id familyId creatorPersonId title description eventType startDate startTime location recurrenceRule createdAt
    }
  }
`;

export const EDIT_EVENT_MUTATION = `
  mutation EditEvent($eventId: ID!, $input: EditEventInput!) {
    editEvent(eventId: $eventId, input: $input) {
      id familyId creatorPersonId title description eventType startDate startTime location recurrenceRule createdAt
    }
  }
`;

export const RSVP_EVENT_MUTATION = `
  mutation RSVPEvent($input: RSVPInput!) {
    rsvpEvent(input: $input) {
      eventId personId status updatedAt
    }
  }
`;

export const DELETE_EVENT_MUTATION = `
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId)
  }
`;

// ─── Chore Queries ───

export const FAMILY_CHORES_QUERY = `
  query FamilyChores($familyId: ID!) {
    familyChores(familyId: $familyId) {
      id familyId title description assigneePersonId dueDate recurrenceRule rotationMembers status completedAt createdAt
    }
  }
`;

export const CREATE_CHORE_MUTATION = `
  mutation CreateChore($input: CreateChoreInput!) {
    createChore(input: $input) {
      id familyId title description assigneePersonId dueDate recurrenceRule rotationMembers status createdAt
    }
  }
`;

export const COMPLETE_CHORE_MUTATION = `
  mutation CompleteChore($input: CompleteChoreInput!) {
    completeChore(input: $input) {
      id status completedAt
    }
  }
`;

export const DELETE_CHORE_MUTATION = `
  mutation DeleteChore($choreId: ID!) {
    deleteChore(choreId: $choreId)
  }
`;

// ─── Family / Members Queries ───

export const FAMILY_QUERY = `
  query Family($familyId: ID!) {
    family(familyId: $familyId) {
      id name createdBy themeName createdAt
    }
  }
`;

export const FAMILY_MEMBERS_QUERY = `
  query FamilyMembers($familyId: ID!) {
    familyMembers(familyId: $familyId) {
      familyId personId userId role joinedAt
    }
  }
`;

export const FAMILY_PERSONS_QUERY = `
  query FamilyPersons($familyId: ID!) {
    familyPersons(familyId: $familyId) {
      id familyId userId name createdAt
    }
  }
`;

export const INVITE_MEMBER_MUTATION = `
  mutation InviteMember($input: InviteMemberInput!) {
    inviteMember(input: $input) {
      id familyId phone name relationship role status createdAt
    }
  }
`;

export const UPDATE_MEMBER_ROLE_MUTATION = `
  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {
    updateMemberRole(input: $input) {
      familyId personId role
    }
  }
`;

export const REMOVE_MEMBER_MUTATION = `
  mutation RemoveMember($familyId: ID!, $personId: ID!) {
    removeMember(familyId: $familyId, personId: $personId)
  }
`;

// ─── Relationship Queries ───

export const FAMILY_RELATIONSHIPS_QUERY = `
  query FamilyRelationships($familyId: ID!) {
    familyRelationships(familyId: $familyId) {
      id familyId personAId personBId aToBLabel bToALabel type status createdAt
    }
  }
`;

export const CREATE_RELATIONSHIP_MUTATION = `
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      id familyId personAId personBId aToBLabel bToALabel type status createdAt
    }
  }
`;

export const EDIT_RELATIONSHIP_MUTATION = `
  mutation EditRelationship($relationshipId: ID!, $input: EditRelationshipInput!) {
    editRelationship(relationshipId: $relationshipId, input: $input) {
      id familyId personAId personBId aToBLabel bToALabel type status createdAt
    }
  }
`;

export const DELETE_RELATIONSHIP_MUTATION = `
  mutation DeleteRelationship($relationshipId: ID!) {
    deleteRelationship(relationshipId: $relationshipId)
  }
`;

// ─── Settings / Theme ───

export const UPDATE_FAMILY_THEME_MUTATION = `
  mutation UpdateFamilyTheme($input: UpdateFamilyThemeInput!) {
    updateFamilyTheme(input: $input) {
      id themeName
    }
  }
`;

// ─── Family Tree ───

export const FAMILY_TREE_QUERY = `
  query FamilyTree($familyId: ID!) {
    familyTree(familyId: $familyId) {
      nodes { personId name hasAppAccount generation spouseIds childIds parentIds }
      rootIds
      generations
    }
  }
`;

// ─── Notification Preferences ───

export const NOTIFICATION_PREFS_QUERY = `
  query NotificationPrefs($userId: ID!, $familyId: ID!) {
    notificationPrefs(userId: $userId, familyId: $familyId) {
      userId familyId category enabled
    }
  }
`;

export const UPDATE_NOTIFICATION_PREF_MUTATION = `
  mutation UpdateNotificationPref($userId: ID!, $familyId: ID!, $category: String!, $enabled: Boolean!) {
    updateNotificationPref(userId: $userId, familyId: $familyId, category: $category, enabled: $enabled) {
      userId familyId category enabled
    }
  }
`;

// ─── Media ───

export const REQUEST_UPLOAD_MUTATION = `
  mutation RequestUpload($input: RequestUploadInput!) {
    requestUpload(input: $input) {
      uploadUrl mediaId
    }
  }
`;
