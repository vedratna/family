import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

import { derivePassword } from "./derive-password";

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch
  cognitoSub: string;
}

function createPool(config: CognitoConfig): CognitoUserPool {
  return new CognitoUserPool({ UserPoolId: config.userPoolId, ClientId: config.clientId });
}

/**
 * Sign up: creates Cognito account, triggers SMS OTP automatically.
 */
export async function cognitoSignUp(
  config: CognitoConfig,
  phone: string,
  displayName: string,
): Promise<void> {
  const pool = createPool(config);
  const password = await derivePassword(phone);
  const attributes: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: "phone_number", Value: phone }),
    new CognitoUserAttribute({ Name: "name", Value: displayName }),
  ];
  await new Promise<void>((resolve, reject) => {
    pool.signUp(phone, password, attributes, [], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Confirm signup with OTP code from SMS.
 */
export async function cognitoConfirmSignUp(
  config: CognitoConfig,
  phone: string,
  code: string,
): Promise<void> {
  const pool = createPool(config);
  const user = new CognitoUser({ Username: phone, Pool: pool });
  await new Promise<void>((resolve, reject) => {
    user.confirmRegistration(code, true, (err: unknown) => {
      if (err !== undefined && err !== null) {
        reject(err instanceof Error ? err : new Error(JSON.stringify(err)));
        return;
      }
      resolve();
    });
  });
}

/**
 * Sign in with derived password. Returns tokens.
 */
export async function cognitoSignIn(config: CognitoConfig, phone: string): Promise<AuthTokens> {
  const pool = createPool(config);
  const password = await derivePassword(phone);
  const user = new CognitoUser({ Username: phone, Pool: pool });
  const auth = new AuthenticationDetails({ Username: phone, Password: password });

  const session = await new Promise<CognitoUserSession>((resolve, reject) => {
    user.authenticateUser(auth, {
      onSuccess: (s) => {
        resolve(s);
      },
      onFailure: (err) => {
        reject(err as unknown as Error);
      },
    });
  });

  return sessionToTokens(session);
}

/**
 * Refresh tokens using a refresh token.
 */
export async function cognitoRefresh(
  config: CognitoConfig,
  phone: string,
  refreshToken: string,
): Promise<AuthTokens> {
  const pool = createPool(config);
  const user = new CognitoUser({ Username: phone, Pool: pool });
  const { CognitoRefreshToken } = await import("amazon-cognito-identity-js");
  const token = new CognitoRefreshToken({ RefreshToken: refreshToken });

  const session = await new Promise<CognitoUserSession>((resolve, reject) => {
    user.refreshSession(token, (err: unknown, s: CognitoUserSession) => {
      if (err !== undefined && err !== null) {
        reject(err instanceof Error ? err : new Error(JSON.stringify(err)));
        return;
      }
      resolve(s);
    });
  });

  return sessionToTokens(session);
}

/**
 * Sign out the current Cognito user (clears local SDK state).
 */
export function cognitoSignOut(config: CognitoConfig): void {
  const pool = createPool(config);
  const current = pool.getCurrentUser();
  if (current !== null) {
    current.signOut();
  }
}

function sessionToTokens(session: CognitoUserSession): AuthTokens {
  const idToken = session.getIdToken();
  const payload = idToken.decodePayload();
  const sub = typeof payload["sub"] === "string" ? payload["sub"] : "";
  return {
    accessToken: session.getAccessToken().getJwtToken(),
    idToken: idToken.getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
    expiresAt: idToken.getExpiration() * 1000,
    cognitoSub: sub,
  };
}

/**
 * Map Cognito error codes to friendly messages.
 */
export function formatCognitoError(error: unknown): string {
  if (!(error instanceof Error)) return "Authentication failed.";
  const code = (error as { code?: string }).code ?? "";
  switch (code) {
    case "UserNotFoundException":
      return "An account with this phone does not exist.";
    case "UsernameExistsException":
      return "An account with this phone number already exists.";
    case "CodeMismatchException":
      return "The verification code is incorrect.";
    case "ExpiredCodeException":
      return "The verification code has expired. Please request a new one.";
    case "NotAuthorizedException":
      return "Authentication failed. The account may not be verified yet.";
    case "InvalidParameterException":
      return error.message;
    case "LimitExceededException":
      return "Too many attempts. Please try again later.";
    default:
      return error.message || "Authentication failed.";
  }
}
