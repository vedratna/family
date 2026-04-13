// ─── Family Queries ───

export const MY_FAMILIES_QUERY = `
  query MyFamilies {
    myFamilies {
      family { id name createdBy themeName createdAt }
      role
    }
  }
`;

export const CREATE_FAMILY_MUTATION = `
  mutation CreateFamily($name: String!, $themeName: String!) {
    createFamily(name: $name, themeName: $themeName) {
      family { id name createdBy themeName createdAt }
      person { id familyId userId name createdAt }
    }
  }
`;

export const MY_INVITATIONS_QUERY = `
  query MyInvitations {
    myInvitations {
      familyId
      familyName
      familyThemeName
      phone
      inviterName
      relationshipToInviter
      role
      status
      createdAt
    }
  }
`;

export const ACCEPT_INVITATION_MUTATION = `
  mutation AcceptInvitation($familyId: ID!, $phone: String!, $displayName: String!) {
    acceptInvitation(familyId: $familyId, phone: $phone, displayName: $displayName) {
      person { id name }
      role
    }
  }
`;

// ─── Feed / Post Queries ───

export const FAMILY_FEED_QUERY = `
  query FamilyFeed($familyId: ID!, $limit: Int, $cursor: String) {
    familyFeed(familyId: $familyId, limit: $limit, cursor: $cursor) {
      items {
        id familyId authorPersonId authorName textContent isSystemPost createdAt
        reactionCount commentCount
      }
      cursor
    }
  }
`;

export const POST_DETAIL_QUERY = `
  query PostDetail($postId: ID!, $familyId: ID!) {
    postDetail(postId: $postId, familyId: $familyId) {
      id familyId authorPersonId authorName textContent isSystemPost createdAt
      reactionCount commentCount
    }
  }
`;

export const POST_COMMENTS_QUERY = `
  query PostComments($postId: ID!, $limit: Int, $cursor: String) {
    postComments(postId: $postId, limit: $limit, cursor: $cursor) {
      items { id postId personId personName textContent createdAt }
      cursor
    }
  }
`;

export const POST_REACTIONS_QUERY = `
  query PostReactions($postId: ID!) {
    postReactions(postId: $postId) {
      postId personId personName emoji createdAt
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
  mutation AddReaction($postId: ID!, $emoji: String!) {
    addReaction(postId: $postId, emoji: $emoji) {
      postId personId emoji createdAt
    }
  }
`;

export const DELETE_POST_MUTATION = `
  mutation DeletePost($familyId: ID!, $postId: ID!) {
    deletePost(familyId: $familyId, postId: $postId)
  }
`;

export const REMOVE_REACTION_MUTATION = `
  mutation RemoveReaction($postId: ID!) {
    removeReaction(postId: $postId)
  }
`;

// ─── Event Queries ───

export const FAMILY_EVENTS_QUERY = `
  query FamilyEvents($familyId: ID!, $startDate: String!, $endDate: String!) {
    familyEvents(familyId: $familyId, startDate: $startDate, endDate: $endDate) {
      id familyId creatorPersonId creatorName title description eventType startDate startTime location recurrenceRule createdAt
    }
  }
`;

export const EVENT_DETAIL_QUERY = `
  query EventDetail($familyId: ID!, $date: String!, $eventId: ID!) {
    eventDetail(familyId: $familyId, date: $date, eventId: $eventId) {
      id familyId creatorPersonId creatorName title description eventType startDate startTime location recurrenceRule createdAt
    }
  }
`;

export const EVENT_RSVPS_QUERY = `
  query EventRSVPs($eventId: ID!) {
    eventRSVPs(eventId: $eventId) {
      personName
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
  mutation EditEvent($input: EditEventInput!) {
    editEvent(input: $input)
  }
`;

export const RSVP_EVENT_MUTATION = `
  mutation RSVPEvent($eventId: ID!, $status: String!) {
    rsvpEvent(eventId: $eventId, status: $status) {
      eventId personId status updatedAt
    }
  }
`;

export const DELETE_EVENT_MUTATION = `
  mutation DeleteEvent($familyId: ID!, $date: String!, $eventId: ID!) {
    deleteEvent(familyId: $familyId, date: $date, eventId: $eventId)
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
  mutation CompleteChore($familyId: ID!, $choreId: ID!) {
    completeChore(familyId: $familyId, choreId: $choreId)
  }
`;

// ─── Family / Members Queries ───

export const FAMILY_MEMBERS_QUERY = `
  query FamilyMembers($familyId: ID!) {
    familyMembers(familyId: $familyId) {
      person { id familyId userId name profilePhotoKey createdAt }
      role
      joinedAt
      hasAppAccount
    }
  }
`;

export const INVITE_MEMBER_MUTATION = `
  mutation InviteMember($input: InviteMemberInput!) {
    inviteMember(input: $input) {
      familyId phone invitedBy relationshipToInviter role status createdAt
    }
  }
`;

export const UPDATE_MEMBER_ROLE_MUTATION = `
  mutation UpdateMemberRole($familyId: ID!, $personId: ID!, $role: String!) {
    updateMemberRole(familyId: $familyId, personId: $personId, role: $role)
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
  mutation EditRelationship($input: EditRelationshipInput!) {
    editRelationship(input: $input)
  }
`;

export const DELETE_RELATIONSHIP_MUTATION = `
  mutation DeleteRelationship($familyId: ID!, $personAId: ID!, $personBId: ID!) {
    deleteRelationship(familyId: $familyId, personAId: $personAId, personBId: $personBId)
  }
`;

// ─── Settings / Theme ───

export const UPDATE_FAMILY_THEME_MUTATION = `
  mutation UpdateFamilyTheme($familyId: ID!, $themeName: String!) {
    updateFamilyTheme(familyId: $familyId, themeName: $themeName)
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
  query NotificationPrefs($familyId: ID!) {
    notificationPreferences(familyId: $familyId) {
      userId familyId category enabled
    }
  }
`;

export const UPDATE_NOTIFICATION_PREF_MUTATION = `
  mutation UpdateNotificationPref($familyId: ID!, $category: String!, $enabled: Boolean!) {
    updateNotificationPreference(familyId: $familyId, category: $category, enabled: $enabled)
  }
`;

// ─── Auth ───

export const REGISTER_MUTATION = `
  mutation Register($phone: String!, $cognitoSub: String!, $displayName: String!) {
    register(phone: $phone, cognitoSub: $cognitoSub, displayName: $displayName) {
      id phone displayName createdAt
    }
  }
`;

export const USER_BY_PHONE_QUERY = `
  query UserByPhone($phone: String!) {
    userByPhone(phone: $phone) {
      id phone displayName createdAt
    }
  }
`;

// ─── Media ───

export const GENERATE_UPLOAD_URL_MUTATION = `
  mutation GenerateUploadUrl($familyId: ID!, $contentType: String!, $sizeBytes: Int!) {
    generateUploadUrl(familyId: $familyId, contentType: $contentType, sizeBytes: $sizeBytes) {
      uploadUrl s3Key
    }
  }
`;

export const CONFIRM_MEDIA_UPLOAD_MUTATION = `
  mutation ConfirmMediaUpload($input: ConfirmMediaUploadInput!) {
    confirmMediaUpload(input: $input) {
      id familyId s3Key contentType sizeBytes uploadedBy createdAt
    }
  }
`;
