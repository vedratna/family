import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

const currentDir = dirname(fileURLToPath(import.meta.url));

interface ApiStackProps extends cdk.StackProps {
  stage: string;
  userPool: cognito.UserPool;
  table: dynamodb.ITable;
}

interface LambdaDef {
  id: string;
  domain: string;
}

const lambdaDefs: LambdaDef[] = [
  { id: "auth", domain: "auth" },
  { id: "family", domain: "family" },
  { id: "feed", domain: "feed" },
  { id: "calendar", domain: "calendar" },
  { id: "chores", domain: "chores" },
  { id: "relationships", domain: "relationships" },
  { id: "tree", domain: "tree" },
  { id: "media", domain: "media" },
  { id: "notifications", domain: "notifications" },
];

interface ResolverMapping {
  typeName: "Query" | "Mutation";
  fieldName: string;
  handlerId: string;
}

const resolverMappings: ResolverMapping[] = [
  // Queries
  { typeName: "Query", fieldName: "health", handlerId: "auth" },
  { typeName: "Query", fieldName: "userByPhone", handlerId: "auth" },
  { typeName: "Query", fieldName: "myFamilies", handlerId: "family" },
  { typeName: "Query", fieldName: "myInvitations", handlerId: "family" },
  { typeName: "Query", fieldName: "familyMembers", handlerId: "family" },
  { typeName: "Query", fieldName: "familyFeed", handlerId: "feed" },
  { typeName: "Query", fieldName: "postDetail", handlerId: "feed" },
  { typeName: "Query", fieldName: "postComments", handlerId: "feed" },
  { typeName: "Query", fieldName: "postReactions", handlerId: "feed" },
  { typeName: "Query", fieldName: "familyEvents", handlerId: "calendar" },
  { typeName: "Query", fieldName: "eventDetail", handlerId: "calendar" },
  { typeName: "Query", fieldName: "eventRSVPs", handlerId: "calendar" },
  { typeName: "Query", fieldName: "familyChores", handlerId: "chores" },
  {
    typeName: "Query",
    fieldName: "familyRelationships",
    handlerId: "relationships",
  },
  { typeName: "Query", fieldName: "familyTree", handlerId: "tree" },
  {
    typeName: "Query",
    fieldName: "notificationPreferences",
    handlerId: "notifications",
  },

  // Mutations — Auth
  { typeName: "Mutation", fieldName: "register", handlerId: "auth" },
  { typeName: "Mutation", fieldName: "updateProfile", handlerId: "auth" },

  // Mutations — Family
  { typeName: "Mutation", fieldName: "createFamily", handlerId: "family" },
  { typeName: "Mutation", fieldName: "inviteMember", handlerId: "family" },
  {
    typeName: "Mutation",
    fieldName: "acceptInvitation",
    handlerId: "family",
  },
  { typeName: "Mutation", fieldName: "addNonAppPerson", handlerId: "family" },
  {
    typeName: "Mutation",
    fieldName: "updateMemberRole",
    handlerId: "family",
  },
  {
    typeName: "Mutation",
    fieldName: "transferOwnership",
    handlerId: "family",
  },
  { typeName: "Mutation", fieldName: "removeMember", handlerId: "family" },
  {
    typeName: "Mutation",
    fieldName: "updateFamilyTheme",
    handlerId: "family",
  },

  // Mutations — Feed
  { typeName: "Mutation", fieldName: "createPost", handlerId: "feed" },
  { typeName: "Mutation", fieldName: "deletePost", handlerId: "feed" },
  { typeName: "Mutation", fieldName: "addReaction", handlerId: "feed" },
  { typeName: "Mutation", fieldName: "removeReaction", handlerId: "feed" },
  { typeName: "Mutation", fieldName: "addComment", handlerId: "feed" },

  // Mutations — Calendar
  { typeName: "Mutation", fieldName: "createEvent", handlerId: "calendar" },
  { typeName: "Mutation", fieldName: "editEvent", handlerId: "calendar" },
  { typeName: "Mutation", fieldName: "deleteEvent", handlerId: "calendar" },
  { typeName: "Mutation", fieldName: "rsvpEvent", handlerId: "calendar" },

  // Mutations — Chores
  { typeName: "Mutation", fieldName: "createChore", handlerId: "chores" },
  { typeName: "Mutation", fieldName: "completeChore", handlerId: "chores" },
  { typeName: "Mutation", fieldName: "deleteChore", handlerId: "chores" },
  { typeName: "Mutation", fieldName: "rotateChore", handlerId: "chores" },

  // Mutations — Relationships
  {
    typeName: "Mutation",
    fieldName: "createRelationship",
    handlerId: "relationships",
  },
  {
    typeName: "Mutation",
    fieldName: "editRelationship",
    handlerId: "relationships",
  },
  {
    typeName: "Mutation",
    fieldName: "deleteRelationship",
    handlerId: "relationships",
  },
  {
    typeName: "Mutation",
    fieldName: "confirmInference",
    handlerId: "relationships",
  },
  {
    typeName: "Mutation",
    fieldName: "rejectInference",
    handlerId: "relationships",
  },

  // Mutations — Media
  {
    typeName: "Mutation",
    fieldName: "generateUploadUrl",
    handlerId: "media",
  },
  {
    typeName: "Mutation",
    fieldName: "confirmMediaUpload",
    handlerId: "media",
  },

  // Mutations — Notifications
  {
    typeName: "Mutation",
    fieldName: "updateNotificationPreference",
    handlerId: "notifications",
  },
  {
    typeName: "Mutation",
    fieldName: "registerDeviceToken",
    handlerId: "notifications",
  },
];

export class ApiStack extends cdk.Stack {
  public readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // ── AppSync API ──

    this.api = new appsync.GraphqlApi(this, "FamilyApi", {
      name: `family-${props.stage}-api`,
      definition: appsync.Definition.fromFile(
        new URL("../graphql/schema.graphql", import.meta.url).pathname,
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.IAM,
          },
        ],
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR,
      },
      xrayEnabled: props.stage !== "prod",
    });

    // ── Lambda Functions ──

    const mediaBucketName = `family-${props.stage}-media`;

    const lambdaFns = new Map<string, NodejsFunction>();

    for (const def of lambdaDefs) {
      const isMedia = def.id === "media";

      const fn = new NodejsFunction(this, `${def.id}-handler`, {
        entry: join(currentDir, `../../backend/src/handlers/${def.domain}/handler.ts`),
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: "handler",
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
        environment: {
          TABLE_NAME: props.table.tableName,
          STAGE: props.stage,
          ...(isMedia ? { S3_BUCKET: mediaBucketName } : {}),
        },
      });

      props.table.grantReadWriteData(fn);

      if (isMedia) {
        fn.addToRolePolicy(
          new iam.PolicyStatement({
            actions: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
            resources: [`arn:aws:s3:::${mediaBucketName}/*`],
          }),
        );
      }

      lambdaFns.set(def.id, fn);
    }

    // ── AppSync Data Sources ──

    const dataSources = new Map<string, appsync.LambdaDataSource>();

    for (const def of lambdaDefs) {
      const fn = lambdaFns.get(def.id);
      if (fn === undefined) {
        throw new Error(`Lambda function not found: ${def.id}`);
      }
      const ds = this.api.addLambdaDataSource(`${def.id}LambdaDs`, fn);
      dataSources.set(def.id, ds);
    }

    // ── Resolvers ──

    for (const mapping of resolverMappings) {
      const ds = dataSources.get(mapping.handlerId);
      if (ds === undefined) {
        throw new Error(`Data source not found: ${mapping.handlerId}`);
      }
      new appsync.Resolver(this, `${mapping.typeName}${mapping.fieldName}Resolver`, {
        api: this.api,
        dataSource: ds,
        typeName: mapping.typeName,
        fieldName: mapping.fieldName,
      });
    }

    // ── Outputs ──

    new cdk.CfnOutput(this, "GraphqlApiUrl", {
      value: this.api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "GraphqlApiId", {
      value: this.api.apiId,
    });
  }
}
