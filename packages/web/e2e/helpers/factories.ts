import { gqlRequest } from "./graphql";

export interface TestUser {
  id: string;
  phone: string;
  displayName: string;
}

export interface TestFamily {
  familyId: string;
  personId: string;
  familyName: string;
}

export interface TestPost {
  id: string;
  familyId: string;
  textContent: string;
}

export interface TestEvent {
  id: string;
  familyId: string;
  title: string;
  startDate: string;
}

export interface TestChore {
  id: string;
  familyId: string;
  title: string;
  status: string;
}

export async function createTestUser(
  workerIndex: number,
  namePrefix = "E2E User",
): Promise<TestUser> {
  const phone = `+91${String(Date.now())}${String(workerIndex)}`;
  const displayName = `${namePrefix} ${phone.slice(-4)}`;
  const cognitoSub = `e2e-${phone}`;

  const data = await gqlRequest<{
    register: { id: string; phone: string; displayName: string };
  }>(
    `mutation Register($phone: String!, $cognitoSub: String!, $displayName: String!) {
      register(phone: $phone, cognitoSub: $cognitoSub, displayName: $displayName) {
        id phone displayName
      }
    }`,
    { phone, cognitoSub, displayName },
  );

  return {
    id: data.register.id,
    phone: data.register.phone,
    displayName: data.register.displayName,
  };
}

export async function createTestFamily(
  userId: string,
  name: string,
  themeName = "teal",
): Promise<TestFamily> {
  const data = await gqlRequest<{
    createFamily: {
      family: { id: string; name: string };
      person: { id: string };
    };
  }>(
    `mutation CreateFamily($name: String!, $themeName: String!) {
      createFamily(name: $name, themeName: $themeName) {
        family { id name }
        person { id }
      }
    }`,
    { name, themeName },
    userId,
  );

  return {
    familyId: data.createFamily.family.id,
    personId: data.createFamily.person.id,
    familyName: data.createFamily.family.name,
  };
}

export async function addTestMember(
  inviterUserId: string,
  familyId: string,
  phone: string,
  name: string,
  relationship = "Sibling",
): Promise<void> {
  await gqlRequest(
    `mutation InviteMember($input: InviteMemberInput!) {
      inviteMember(input: $input) { phone status }
    }`,
    {
      input: {
        familyId,
        phone,
        name,
        relationshipToInviter: relationship,
        inverseRelationshipLabel: relationship,
        role: "editor",
      },
    },
    inviterUserId,
  );
}

export async function acceptTestInvitation(
  userId: string,
  familyId: string,
  phone: string,
  displayName: string,
): Promise<{ personId: string }> {
  const data = await gqlRequest<{
    acceptInvitation: { person: { id: string }; role: string };
  }>(
    `mutation AcceptInvitation($familyId: ID!, $phone: String!, $displayName: String!) {
      acceptInvitation(familyId: $familyId, phone: $phone, displayName: $displayName) {
        person { id }
        role
      }
    }`,
    { familyId, phone, displayName },
    userId,
  );

  return { personId: data.acceptInvitation.person.id };
}

export async function createTestPost(
  userId: string,
  familyId: string,
  textContent: string,
): Promise<TestPost> {
  const data = await gqlRequest<{
    createPost: { id: string; familyId: string; textContent: string };
  }>(
    `mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) { id familyId textContent }
    }`,
    { input: { familyId, textContent } },
    userId,
  );

  return data.createPost;
}

export async function createTestEvent(
  userId: string,
  familyId: string,
  title: string,
  startDate: string,
  eventType = "social-function",
): Promise<TestEvent> {
  const data = await gqlRequest<{
    createEvent: { id: string; familyId: string; title: string; startDate: string };
  }>(
    `mutation CreateEvent($input: CreateEventInput!) {
      createEvent(input: $input) { id familyId title startDate }
    }`,
    { input: { familyId, title, eventType, startDate } },
    userId,
  );

  return data.createEvent;
}

export async function createTestChore(
  userId: string,
  familyId: string,
  title: string,
  assigneePersonId: string,
): Promise<TestChore> {
  const data = await gqlRequest<{
    createChore: { id: string; familyId: string; title: string; status: string };
  }>(
    `mutation CreateChore($input: CreateChoreInput!) {
      createChore(input: $input) { id familyId title status }
    }`,
    { input: { familyId, title, assigneePersonId } },
    userId,
  );

  return data.createChore;
}

export async function createTestRelationship(
  userId: string,
  familyId: string,
  personAId: string,
  personBId: string,
  aToBLabel: string,
  bToALabel: string,
  type = "biological",
): Promise<{ id: string }> {
  const data = await gqlRequest<{
    createRelationship: { id: string };
  }>(
    `mutation CreateRelationship($input: CreateRelationshipInput!) {
      createRelationship(input: $input) { id }
    }`,
    {
      input: {
        familyId,
        personAId,
        personBId,
        aToBLabel,
        bToALabel,
        type,
      },
    },
    userId,
  );

  return { id: data.createRelationship.id };
}
