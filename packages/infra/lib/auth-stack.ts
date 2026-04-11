import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";

interface AuthStackProps extends cdk.StackProps {
  stage: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "FamilyUserPool", {
      userPoolName: `family-${props.stage}-user-pool`,
      selfSignUpEnabled: true,
      signInAliases: {
        phone: true,
        email: false,
      },
      autoVerify: {
        phone: true,
      },
      standardAttributes: {
        phoneNumber: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.PHONE_ONLY_WITHOUT_MFA,
      removalPolicy: props.stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Social identity providers — only added when credentials are configured
    const googleClientId = String(this.node.tryGetContext("googleClientId") ?? "");
    if (googleClientId !== "") {
      new cognito.UserPoolIdentityProviderGoogle(this, "GoogleProvider", {
        userPool: this.userPool,
        clientId: googleClientId,
        clientSecretValue: cdk.SecretValue.ssmSecure(`/family/${props.stage}/google-client-secret`),
        scopes: ["openid", "profile", "email"],
        attributeMapping: {
          fullname: cognito.ProviderAttribute.GOOGLE_NAME,
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        },
      });
    }

    const appleClientId = String(this.node.tryGetContext("appleClientId") ?? "");
    if (appleClientId !== "") {
      new cognito.UserPoolIdentityProviderApple(this, "AppleProvider", {
        userPool: this.userPool,
        clientId: appleClientId,
        teamId: String(this.node.tryGetContext("appleTeamId") ?? ""),
        keyId: String(this.node.tryGetContext("appleKeyId") ?? ""),
        privateKey: String(this.node.tryGetContext("applePrivateKey") ?? ""),
        scopes: ["name", "email"],
        attributeMapping: {
          fullname: cognito.ProviderAttribute.APPLE_NAME,
          email: cognito.ProviderAttribute.APPLE_EMAIL,
        },
      });
    }

    this.userPoolClient = this.userPool.addClient("FamilyAppClient", {
      userPoolClientName: `family-${props.stage}-app-client`,
      authFlows: {
        custom: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
      },
      preventUserExistenceErrors: true,
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }
}
