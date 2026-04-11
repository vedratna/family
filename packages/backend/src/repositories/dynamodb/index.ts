export { docClient, TABLE_NAME } from "./client";
export { keys } from "./keys";
export {
  putItem,
  getItem,
  deleteItem,
  queryItems,
  queryBetween,
  updateItem,
  batchWriteItems,
} from "./operations";
export type { DynamoItem, QueryOptions, QueryResult } from "./operations";
