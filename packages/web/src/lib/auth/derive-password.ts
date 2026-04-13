/**
 * Deterministic password derivation from phone number for Cognito.
 *
 * v1 simplification: Cognito requires a password but our auth model is
 * phone-only with OTP for identity verification. We derive a stable password
 * from the phone so users never see/manage one. The SECRET prevents trivial
 * guessing if someone knows a phone number — they'd also need the secret +
 * OTP delivered to the actual phone.
 *
 * For higher security, replace with Cognito custom auth challenge Lambda
 * triggers (separate change).
 */

const SECRET = "family-app-v1-cognito-pwd-derivation-do-not-share";

export async function derivePassword(phone: string): Promise<string> {
  const data = new TextEncoder().encode(`${phone}:${SECRET}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  // Base64-url + uppercase first char + digits to satisfy Cognito password policy
  // (min 8, lowercase, uppercase, digit; symbols not required per current pool config)
  const bytes = new Uint8Array(hash);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "A")
    .replace(/\//g, "B")
    .replace(/=/g, "C");
  // Ensure complexity: prepend 'A1' to guarantee uppercase + digit even if base64 lacks them
  return `A1${b64}`;
}
