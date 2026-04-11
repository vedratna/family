import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ENDPOINT = process.env["DYNAMODB_ENDPOINT"] ?? "http://localhost:8000";
const TABLE_NAME = process.env["TABLE_NAME"] ?? "family-dev";

const client = new DynamoDBClient({
  endpoint: ENDPOINT,
  region: "local",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

async function createTable(): Promise<void> {
  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
        { AttributeName: "GSI1PK", AttributeType: "S" },
        { AttributeName: "GSI1SK", AttributeType: "S" },
        { AttributeName: "GSI2PK", AttributeType: "S" },
        { AttributeName: "GSI2SK", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "GSI1",
          KeySchema: [
            { AttributeName: "GSI1PK", KeyType: "HASH" },
            { AttributeName: "GSI1SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "GSI2",
          KeySchema: [
            { AttributeName: "GSI2PK", KeyType: "HASH" },
            { AttributeName: "GSI2SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );

  console.log(`Table "${TABLE_NAME}" created successfully.`);
}

createTable().catch((error: unknown) => {
  if (error instanceof Error && error.name === "ResourceInUseException") {
    console.log(`Table "${TABLE_NAME}" already exists.`);
    return;
  }
  console.error("Failed to create table:", error);
  process.exit(1);
});
