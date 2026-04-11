import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import type { Construct } from "constructs";

interface NotificationStackProps extends cdk.StackProps {
  stage: string;
}

export class NotificationStack extends cdk.Stack {
  public readonly notificationTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: NotificationStackProps) {
    super(scope, id, props);

    this.notificationTopic = new sns.Topic(this, "NotificationTopic", {
      topicName: `family-${props.stage}-notifications`,
      displayName: "Family App Notifications",
    });

    // SNS Platform Applications for push notifications are created via
    // the AWS Console or CLI, as they require platform-specific credentials
    // (APNs certificate for iOS, FCM API key for Android) that are best
    // managed outside of CDK. The ARNs are stored in SSM Parameter Store
    // and referenced by the notification Lambda at runtime.

    new cdk.CfnOutput(this, "NotificationTopicArn", {
      value: this.notificationTopic.topicArn,
    });
  }
}
