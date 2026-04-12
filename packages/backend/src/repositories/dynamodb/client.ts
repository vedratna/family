import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env["DYNAMODB_ENDPOINT"];

const config: DynamoDBClientConfig =
  endpoint !== undefined
    ? {
        endpoint,
        region: "local",
        credentials: { accessKeyId: "local", secretAccessKey: "local" },
      }
    : {};

const baseClient = new DynamoDBClient(config);

export const docClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export function getTableName(): string {
  return process.env["TABLE_NAME"] ?? "family-dev";
}
