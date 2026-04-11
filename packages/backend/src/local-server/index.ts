import { readFileSync } from "fs";
import { resolve } from "path";

import { ApolloServer } from "@apollo/server";
// @ts-expect-error Apollo Server express4 subpath export types
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";

import { DynamoUserRepository } from "../repositories/dynamodb/user-repo";
import { RegisterWithPhone } from "../use-cases/auth";

const PORT = Number(process.env["PORT"] ?? "4000");

// Read the same schema used by AppSync
const typeDefs = readFileSync(resolve(__dirname, "../../../infra/graphql/schema.graphql"), "utf-8");

// Instantiate repositories (using DynamoDB Local)
const userRepo = new DynamoUserRepository();

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
    ping: (_: unknown, args: { message: string }) => `pong: ${args.message}`,
    updateProfile: () => null,
    createFamily: () => null,
    inviteMember: () => null,
    acceptInvitation: () => null,
    addNonAppPerson: () => null,
    updateMemberRole: () => false,
    transferOwnership: () => false,
    removeMember: () => false,
    updateFamilyTheme: () => false,
  },
};

async function start(): Promise<void> {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  app.use(
    "/graphql",
    express.json(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expressMiddleware(server, {
      context: ({ req }: { req: express.Request }) => {
        // Local auth bypass: use x-user-id header for testing
        const userId = req.headers["x-user-id"] as string | undefined;
        return Promise.resolve({ userId: userId ?? "local-dev-user" });
      },
    }) as express.RequestHandler,
  );

  app.listen(PORT, () => {
    console.log(`Local GraphQL API running at http://localhost:${String(PORT)}/graphql`);
    console.log(`GraphQL Playground available at http://localhost:${String(PORT)}/graphql`);
  });
}

start().catch(console.error);
