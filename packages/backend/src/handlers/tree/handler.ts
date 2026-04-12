import type { AppSyncResolverEvent } from "aws-lambda";

import { DomainError } from "../../domain/errors";
import { DynamoPersonRepository } from "../../repositories/dynamodb/person-repo";
import { DynamoRelationshipRepository } from "../../repositories/dynamodb/relationship-repo";
import { BuildFamilyTree, serializeTree } from "../../use-cases/tree";

const personRepo = new DynamoPersonRepository();
const relationshipRepo = new DynamoRelationshipRepository();
const buildFamilyTree = new BuildFamilyTree(personRepo, relationshipRepo);

interface HandlerArgs {
  [key: string]: unknown;
}

export async function handler(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  try {
    const field = event.info.fieldName;
    switch (field) {
      case "familyTree":
        return await handleFamilyTree(event);
      default:
        throw new Error(`Unknown field: ${field}`);
    }
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw error;
  }
}

async function handleFamilyTree(event: AppSyncResolverEvent<HandlerArgs>): Promise<unknown> {
  const args = event.arguments;
  const tree = await buildFamilyTree.execute(args.familyId as string);
  return serializeTree(tree);
}
