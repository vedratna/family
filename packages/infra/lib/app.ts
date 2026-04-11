#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { ApiStack } from "./api-stack";
import { AuthStack } from "./auth-stack";
import { DatabaseStack } from "./database-stack";
import { NotificationStack } from "./notification-stack";
import { SchedulerStack } from "./scheduler-stack";
import { StorageStack } from "./storage-stack";

const app = new cdk.App();
const stage = String(app.node.tryGetContext("stage") ?? "dev");

const env: cdk.Environment = {
  account: process.env["CDK_DEFAULT_ACCOUNT"] ?? "",
  region: process.env["CDK_DEFAULT_REGION"] ?? "ap-south-1",
};

const authStack = new AuthStack(app, `Family-${stage}-Auth`, { stage, env });
const databaseStack = new DatabaseStack(app, `Family-${stage}-Database`, { stage, env });
const storageStack = new StorageStack(app, `Family-${stage}-Storage`, { stage, env });

new ApiStack(app, `Family-${stage}-Api`, {
  stage,
  env,
  userPool: authStack.userPool,
  table: databaseStack.table,
});

new NotificationStack(app, `Family-${stage}-Notification`, { stage, env });
new SchedulerStack(app, `Family-${stage}-Scheduler`, { stage, env });

// Suppress unused variable warnings for stacks that are only referenced by CDK
void storageStack;

app.synth();
