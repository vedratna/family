import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import type { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  stage: string;
  userPool: cognito.UserPool;
  table: dynamodb.ITable;
}

export class ApiStack extends cdk.Stack {
  public readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

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

    // DynamoDB data source for direct resolvers
    this.api.addDynamoDbDataSource("FamilyTableSource", props.table);

    new cdk.CfnOutput(this, "GraphqlApiUrl", {
      value: this.api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "GraphqlApiId", {
      value: this.api.apiId,
    });
  }
}
