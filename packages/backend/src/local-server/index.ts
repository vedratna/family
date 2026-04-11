import { readFileSync } from "fs";
import { resolve } from "path";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { DynamoUserRepository } from "../repositories/dynamodb/user-repo";
import { RegisterWithPhone } from "../use-cases/auth";

const PORT = Number(process.env["PORT"] ?? "4000");

// Read the same schema used by AppSync
const typeDefs = readFileSync(resolve(__dirname, "../../../infra/graphql/schema.graphql"), "utf-8");

// Instantiate repositories (using DynamoDB Local)
const userRepo = new DynamoUserRepository();

// Stub objects matching the GraphQL schema types
const stubUser = {
  id: "stub",
  phone: "",
  displayName: "Stub",
  profilePhotoKey: null,
  dateOfBirth: null,
  createdAt: new Date().toISOString(),
};

const stubPerson = {
  id: "stub",
  familyId: "stub",
  userId: null,
  name: "Stub",
  profilePhotoKey: null,
  createdAt: new Date().toISOString(),
};

// Resolvers call the same use cases as Lambda handlers
const resolvers = {
  Query: {
    health: () => "OK",
    myFamilies: () => [],
    familyMembers: () => [],
  },
  Mutation: {
    register: async (
      _: unknown,
      args: { phone: string; cognitoSub: string; displayName: string },
    ) => {
      const useCase = new RegisterWithPhone(userRepo);
      const result = await useCase.execute({
        phone: args.phone,
        cognitoSub: args.cognitoSub,
        displayName: args.displayName,
      });
      return result.user;
    },
    updateProfile: () => stubUser,
    createFamily: () => ({
      family: {
        id: "stub",
        name: "Stub",
        themeName: "teal",
        createdBy: "stub",
        createdAt: new Date().toISOString(),
      },
      person: stubPerson,
    }),
    inviteMember: () => ({
      familyId: "stub",
      phone: "",
      invitedBy: "stub",
      relationshipToInviter: "",
      inverseRelationshipLabel: "",
      role: "member",
      status: "pending",
      createdAt: new Date().toISOString(),
    }),
    acceptInvitation: () => ({ person: stubPerson, role: "member" }),
    addNonAppPerson: () => stubPerson,
    updateMemberRole: () => false,
    transferOwnership: () => false,
    removeMember: () => false,
    updateFamilyTheme: () => false,
  },
};

async function start(): Promise<void> {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: ({ req }) => {
      const userId = req.headers["x-user-id"] as string | undefined;
      return Promise.resolve({ userId: userId ?? "local-dev-user" });
    },
  });

  console.log(`Local GraphQL API running at ${url}`);
}

start().catch(console.error);
