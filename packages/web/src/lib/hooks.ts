import { useMutation, useQuery } from "urql";

import {
  MY_FAMILIES_QUERY,
  CREATE_FAMILY_MUTATION,
  MY_INVITATIONS_QUERY,
  ACCEPT_INVITATION_MUTATION,
  REGISTER_MUTATION,
  USER_BY_PHONE_QUERY,
  FAMILY_FEED_QUERY,
  POST_DETAIL_QUERY,
  POST_COMMENTS_QUERY,
  POST_REACTIONS_QUERY,
  CREATE_POST_MUTATION,
  ADD_COMMENT_MUTATION,
  ADD_REACTION_MUTATION,
  DELETE_POST_MUTATION,
  FAMILY_EVENTS_QUERY,
  EVENT_DETAIL_QUERY,
  EVENT_RSVPS_QUERY,
  CREATE_EVENT_MUTATION,
  EDIT_EVENT_MUTATION,
  RSVP_EVENT_MUTATION,
  DELETE_EVENT_MUTATION,
  FAMILY_CHORES_QUERY,
  CREATE_CHORE_MUTATION,
  COMPLETE_CHORE_MUTATION,
  DELETE_CHORE_MUTATION,
  REMOVE_REACTION_MUTATION,
  FAMILY_MEMBERS_QUERY,
  INVITE_MEMBER_MUTATION,
  UPDATE_MEMBER_ROLE_MUTATION,
  REMOVE_MEMBER_MUTATION,
  FAMILY_RELATIONSHIPS_QUERY,
  CREATE_RELATIONSHIP_MUTATION,
  EDIT_RELATIONSHIP_MUTATION,
  DELETE_RELATIONSHIP_MUTATION,
  UPDATE_FAMILY_THEME_MUTATION,
  FAMILY_TREE_QUERY,
  NOTIFICATION_PREFS_QUERY,
  UPDATE_NOTIFICATION_PREF_MUTATION,
  GENERATE_UPLOAD_URL_MUTATION,
  CONFIRM_MEDIA_UPLOAD_MUTATION,
} from "./graphql-operations";

// ─── Families ───

export function useMyFamilies(pause = false) {
  const [result, reexecute] = useQuery({
    query: MY_FAMILIES_QUERY,
    pause,
  });
  return {
    data: result.data as
      | {
          myFamilies: {
            family: {
              id: string;
              name: string;
              createdBy: string;
              themeName: string;
              createdAt: string;
            };
            role: string;
          }[];
        }
      | undefined,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useCreateFamily() {
  const [result, executeMutation] = useMutation(CREATE_FAMILY_MUTATION);
  return { createFamily: executeMutation, loading: result.fetching, error: result.error };
}

export interface InvitationWithContext {
  familyId: string;
  familyName: string;
  familyThemeName: string;
  phone: string;
  inviterName: string;
  relationshipToInviter: string;
  role: string;
  status: string;
  createdAt: string;
}

export function useMyInvitations(pause = false) {
  const [result, reexecute] = useQuery({
    query: MY_INVITATIONS_QUERY,
    pause,
  });
  return {
    data: result.data as { myInvitations: InvitationWithContext[] } | undefined,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useAcceptInvitation() {
  const [result, executeMutation] = useMutation(ACCEPT_INVITATION_MUTATION);
  return { acceptInvitation: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Auth ───

export function useRegister() {
  const [result, executeMutation] = useMutation(REGISTER_MUTATION);
  return { register: executeMutation, loading: result.fetching, error: result.error };
}

export function useUserByPhone(phone: string, pause = false) {
  const [result, reexecute] = useQuery({
    query: USER_BY_PHONE_QUERY,
    variables: { phone },
    pause: pause || !phone,
  });
  return {
    data: result.data as
      | {
          userByPhone: { id: string; phone: string; displayName: string; createdAt: string } | null;
        }
      | undefined,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

// ─── Feed / Posts ───

export function useFamilyFeed(familyId: string, limit?: number, cursor?: string) {
  const [result, reexecute] = useQuery({
    query: FAMILY_FEED_QUERY,
    variables: { familyId, limit, cursor },
    pause: !familyId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function usePostDetail(postId: string, familyId: string) {
  const [result] = useQuery({
    query: POST_DETAIL_QUERY,
    variables: { postId, familyId },
    pause: !postId || !familyId,
  });
  return { data: result.data as unknown, fetching: result.fetching, error: result.error };
}

export function usePostComments(postId: string) {
  const [result, reexecute] = useQuery({
    query: POST_COMMENTS_QUERY,
    variables: { postId },
    pause: !postId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function usePostReactions(postId: string) {
  const [result] = useQuery({
    query: POST_REACTIONS_QUERY,
    variables: { postId },
    pause: !postId,
  });
  return { data: result.data as unknown, fetching: result.fetching, error: result.error };
}

export function useCreatePost() {
  const [result, executeMutation] = useMutation(CREATE_POST_MUTATION);
  return { createPost: executeMutation, loading: result.fetching, error: result.error };
}

export function useAddComment() {
  const [result, executeMutation] = useMutation(ADD_COMMENT_MUTATION);
  return { addComment: executeMutation, loading: result.fetching, error: result.error };
}

export function useAddReaction() {
  const [result, executeMutation] = useMutation(ADD_REACTION_MUTATION);
  return { addReaction: executeMutation, loading: result.fetching, error: result.error };
}

export function useDeletePost() {
  const [result, executeMutation] = useMutation(DELETE_POST_MUTATION);
  return { deletePost: executeMutation, loading: result.fetching, error: result.error };
}

export function useRemoveReaction() {
  const [result, executeMutation] = useMutation(REMOVE_REACTION_MUTATION);
  return { removeReaction: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Events ───

export function useFamilyEvents(familyId: string, startDate: string, endDate: string) {
  const [result, reexecute] = useQuery({
    query: FAMILY_EVENTS_QUERY,
    variables: { familyId, startDate, endDate },
    pause: !familyId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useEventDetail(familyId: string, date: string, eventId: string) {
  const [result] = useQuery({
    query: EVENT_DETAIL_QUERY,
    variables: { familyId, date, eventId },
    pause: !eventId || !familyId || !date,
  });
  return { data: result.data as unknown, fetching: result.fetching, error: result.error };
}

export function useEventRSVPs(eventId: string) {
  const [result, reexecute] = useQuery({
    query: EVENT_RSVPS_QUERY,
    variables: { eventId },
    pause: !eventId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useCreateEvent() {
  const [result, executeMutation] = useMutation(CREATE_EVENT_MUTATION);
  return { createEvent: executeMutation, loading: result.fetching, error: result.error };
}

export function useEditEvent() {
  const [result, executeMutation] = useMutation(EDIT_EVENT_MUTATION);
  return { editEvent: executeMutation, loading: result.fetching, error: result.error };
}

export function useRSVPEvent() {
  const [result, executeMutation] = useMutation(RSVP_EVENT_MUTATION);
  return { rsvpEvent: executeMutation, loading: result.fetching, error: result.error };
}

export function useDeleteEvent() {
  const [result, executeMutation] = useMutation(DELETE_EVENT_MUTATION);
  return { deleteEvent: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Chores ───

export function useFamilyChores(familyId: string) {
  const [result, reexecute] = useQuery({
    query: FAMILY_CHORES_QUERY,
    variables: { familyId },
    pause: !familyId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useCreateChore() {
  const [result, executeMutation] = useMutation(CREATE_CHORE_MUTATION);
  return { createChore: executeMutation, loading: result.fetching, error: result.error };
}

export function useCompleteChore() {
  const [result, executeMutation] = useMutation(COMPLETE_CHORE_MUTATION);
  return { completeChore: executeMutation, loading: result.fetching, error: result.error };
}

export function useDeleteChore() {
  const [result, executeMutation] = useMutation(DELETE_CHORE_MUTATION);
  return { deleteChore: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Members ───

export function useFamilyMembers(familyId: string) {
  const [result, reexecute] = useQuery({
    query: FAMILY_MEMBERS_QUERY,
    variables: { familyId },
    pause: !familyId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useInviteMember() {
  const [result, executeMutation] = useMutation(INVITE_MEMBER_MUTATION);
  return { inviteMember: executeMutation, loading: result.fetching, error: result.error };
}

export function useUpdateMemberRole() {
  const [result, executeMutation] = useMutation(UPDATE_MEMBER_ROLE_MUTATION);
  return { updateMemberRole: executeMutation, loading: result.fetching, error: result.error };
}

export function useRemoveMember() {
  const [result, executeMutation] = useMutation(REMOVE_MEMBER_MUTATION);
  return { removeMember: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Relationships ───

export function useFamilyRelationships(familyId: string) {
  const [result, reexecute] = useQuery({
    query: FAMILY_RELATIONSHIPS_QUERY,
    variables: { familyId },
    pause: !familyId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useCreateRelationship() {
  const [result, executeMutation] = useMutation(CREATE_RELATIONSHIP_MUTATION);
  return { createRelationship: executeMutation, loading: result.fetching, error: result.error };
}

export function useEditRelationship() {
  const [result, executeMutation] = useMutation(EDIT_RELATIONSHIP_MUTATION);
  return { editRelationship: executeMutation, loading: result.fetching, error: result.error };
}

export function useDeleteRelationship() {
  const [result, executeMutation] = useMutation(DELETE_RELATIONSHIP_MUTATION);
  return { deleteRelationship: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Settings / Theme ───

export function useUpdateFamilyTheme() {
  const [result, executeMutation] = useMutation(UPDATE_FAMILY_THEME_MUTATION);
  return { updateFamilyTheme: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Family Tree ───

export function useFamilyTree(familyId: string) {
  const [result] = useQuery({
    query: FAMILY_TREE_QUERY,
    variables: { familyId },
    pause: !familyId,
  });
  return { data: result.data as unknown, fetching: result.fetching, error: result.error };
}

// ─── Notifications ───

export function useNotificationPrefs(familyId: string) {
  const [result, reexecute] = useQuery({
    query: NOTIFICATION_PREFS_QUERY,
    variables: { familyId },
    pause: !familyId,
  });
  return {
    data: result.data as unknown,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}

export function useUpdateNotificationPref() {
  const [result, executeMutation] = useMutation(UPDATE_NOTIFICATION_PREF_MUTATION);
  return { updateNotificationPref: executeMutation, loading: result.fetching, error: result.error };
}

// ─── Media ───

export function useGenerateUploadUrl() {
  const [result, executeMutation] = useMutation(GENERATE_UPLOAD_URL_MUTATION);
  return { generateUploadUrl: executeMutation, loading: result.fetching, error: result.error };
}

export function useConfirmMediaUpload() {
  const [result, executeMutation] = useMutation(CONFIRM_MEDIA_UPLOAD_MUTATION);
  return { confirmMediaUpload: executeMutation, loading: result.fetching, error: result.error };
}
