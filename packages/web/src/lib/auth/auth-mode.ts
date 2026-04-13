import type { CognitoConfig } from "./cognito-client";

export type AuthMode = "local" | "cognito";

export function getAuthMode(): AuthMode {
  const mode = import.meta.env.VITE_AUTH_MODE ?? "local";
  return mode === "cognito" ? "cognito" : "local";
}

export function getCognitoConfig(): CognitoConfig | null {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  if (
    typeof userPoolId !== "string" ||
    userPoolId === "" ||
    typeof clientId !== "string" ||
    clientId === ""
  ) {
    return null;
  }
  return { userPoolId, clientId };
}

export function isCognitoMode(): boolean {
  return getAuthMode() === "cognito" && getCognitoConfig() !== null;
}
