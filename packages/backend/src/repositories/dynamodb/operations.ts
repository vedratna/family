import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { docClient, TABLE_NAME } from "./client";

export interface DynamoItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  [key: string]: NativeAttributeValue;
}

export async function putItem(item: DynamoItem): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );
}

export async function getItem(pk: string, sk: string): Promise<DynamoItem | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    }),
  );
  return result.Item as DynamoItem | undefined;
}

export async function deleteItem(pk: string, sk: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    }),
  );
}

export interface QueryOptions {
  indexName?: string;
  scanIndexForward?: boolean;
  limit?: number;
  exclusiveStartKey?: Record<string, NativeAttributeValue>;
  filterExpression?: string;
  expressionAttributeValues?: Record<string, NativeAttributeValue>;
  expressionAttributeNames?: Record<string, string>;
}

export interface QueryResult {
  items: DynamoItem[];
  lastEvaluatedKey: Record<string, NativeAttributeValue> | undefined;
}

export async function queryItems(
  pkName: string,
  pkValue: string,
  skPrefix: string | undefined,
  options: QueryOptions = {},
): Promise<QueryResult> {
  let keyCondition = `#pk = :pk`;
  const expressionValues: Record<string, NativeAttributeValue> = {
    ":pk": pkValue,
    ...options.expressionAttributeValues,
  };
  const expressionNames: Record<string, string> = {
    "#pk": pkName,
    ...options.expressionAttributeNames,
  };

  if (skPrefix !== undefined) {
    const skName = pkName === "PK" ? "SK" : pkName === "GSI1PK" ? "GSI1SK" : "GSI2SK";
    keyCondition += ` AND begins_with(#sk, :skPrefix)`;
    expressionValues[":skPrefix"] = skPrefix;
    expressionNames["#sk"] = skName;
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: options.indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
      ExpressionAttributeNames: expressionNames,
      ScanIndexForward: options.scanIndexForward,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
      FilterExpression: options.filterExpression,
    }),
  );

  return {
    items: (result.Items ?? []) as DynamoItem[],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

export async function queryBetween(
  pk: string,
  skStart: string,
  skEnd: string,
  options: QueryOptions = {},
): Promise<QueryResult> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: options.indexName,
      KeyConditionExpression: "#pk = :pk AND #sk BETWEEN :start AND :end",
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#sk": "SK",
        ...options.expressionAttributeNames,
      },
      ExpressionAttributeValues: {
        ":pk": pk,
        ":start": skStart,
        ":end": skEnd,
        ...options.expressionAttributeValues,
      },
      ScanIndexForward: options.scanIndexForward,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
      FilterExpression: options.filterExpression,
    }),
  );

  return {
    items: (result.Items ?? []) as DynamoItem[],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

export async function updateItem(
  pk: string,
  sk: string,
  updates: Record<string, NativeAttributeValue>,
): Promise<void> {
  const entries = Object.entries(updates);
  const updateExpression =
    "SET " + entries.map(([_key], i) => `#attr${String(i)} = :val${String(i)}`).join(", ");
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, NativeAttributeValue> = {};

  entries.forEach(([key, value]: [string, NativeAttributeValue], i) => {
    expressionNames[`#attr${String(i)}`] = key;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NativeAttributeValue includes any
    expressionValues[`:val${String(i)}`] = value;
  });

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
    }),
  );
}

export async function batchWriteItems(items: DynamoItem[]): Promise<void> {
  // DynamoDB batch write limit is 25 items
  const BATCH_SIZE = 25;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: batch.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      }),
    );
  }
}
