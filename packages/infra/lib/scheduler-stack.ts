import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

interface SchedulerStackProps extends cdk.StackProps {
  stage: string;
}

export class SchedulerStack extends cdk.Stack {
  public readonly eventBus: events.EventBus;
  public readonly schedulerRole: iam.Role;

  constructor(scope: Construct, id: string, props: SchedulerStackProps) {
    super(scope, id, props);

    // Custom event bus for family app events
    this.eventBus = new events.EventBus(this, "FamilyEventBus", {
      eventBusName: `family-${props.stage}-events`,
    });

    // IAM role for EventBridge Scheduler to invoke Lambda targets
    this.schedulerRole = new iam.Role(this, "SchedulerRole", {
      roleName: `family-${props.stage}-scheduler-role`,
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
      description: "Role for EventBridge Scheduler to invoke Lambda functions for reminders",
    });

    // Archive events for debugging (7-day retention in non-prod)
    if (props.stage !== "prod") {
      new events.Archive(this, "EventArchive", {
        sourceEventBus: this.eventBus,
        archiveName: `family-${props.stage}-event-archive`,
        retention: cdk.Duration.days(7),
        eventPattern: {
          source: ["family-app"],
        },
      });
    }

    new cdk.CfnOutput(this, "EventBusName", {
      value: this.eventBus.eventBusName,
    });

    new cdk.CfnOutput(this, "EventBusArn", {
      value: this.eventBus.eventBusArn,
    });

    new cdk.CfnOutput(this, "SchedulerRoleArn", {
      value: this.schedulerRole.roleArn,
    });
  }
}
