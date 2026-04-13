import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useClient, useMutation } from "urql";

import { isCognitoMode, getCognitoConfig } from "../lib/auth/auth-mode";
import {
  cognitoSignUp,
  cognitoConfirmSignUp,
  cognitoSignIn,
  formatCognitoError,
} from "../lib/auth/cognito-client";
import type { AuthTokens } from "../lib/auth/cognito-client";
import { USER_BY_PHONE_QUERY, REGISTER_MUTATION } from "../lib/graphql-operations";
import { isApiMode } from "../lib/mode";
import { useAuth, type CurrentUser } from "../providers/AuthProvider";

type Tab = "login" | "signup";

interface DemoUser {
  id: string;
  displayName: string;
  phone: string;
  label: string;
}

const DEMO_USERS: DemoUser[] = [
  { id: "user-1", displayName: "Mickey Mouse", phone: "+919876543210", label: "Mickey Mouse" },
  { id: "user-2", displayName: "Bart Simpson", phone: "+919876543211", label: "Bart Simpson" },
];

interface UserByPhoneData {
  userByPhone: { id: string; phone: string; displayName: string } | null;
}

interface RegisterData {
  register: { id: string; phone: string; displayName: string };
}

const INPUT_CLASS =
  "w-full px-3 py-2 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors";
const PRIMARY_BTN_CLASS =
  "w-full py-2.5 rounded-lg bg-[var(--color-accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50";

// ─── Cognito Sign Up Flow ───

function CognitoSignUpFlow() {
  const { loginCognito } = useAuth();
  const navigate = useNavigate();
  const [, executeRegister] = useMutation(REGISTER_MUTATION);

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStep1() {
    setError("");
    const trimmedPhone = phone.trim();
    const trimmedName = displayName.trim();
    if (!trimmedPhone) {
      setError("Phone number is required.");
      return;
    }
    if (!trimmedName) {
      setError("Display name is required.");
      return;
    }

    const config = getCognitoConfig();
    if (!config) {
      setError("Cognito is not configured.");
      return;
    }

    setLoading(true);
    try {
      await cognitoSignUp(config, trimmedPhone, trimmedName);
      setStep(2);
    } catch (err: unknown) {
      setError(formatCognitoError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    setError("");
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError("Verification code is required.");
      return;
    }

    const config = getCognitoConfig();
    if (!config) {
      setError("Cognito is not configured.");
      return;
    }

    setLoading(true);
    try {
      await cognitoConfirmSignUp(config, phone.trim(), trimmedOtp);
      const tokens: AuthTokens = await cognitoSignIn(config, phone.trim());

      // Register on backend
      const result = await executeRegister({
        phone: phone.trim(),
        cognitoSub: tokens.cognitoSub,
        displayName: displayName.trim(),
      });

      if (result.error) {
        setError(result.error.message || "Registration failed.");
        return;
      }

      const registered = result.data as RegisterData | undefined;
      if (registered?.register) {
        const user: CurrentUser = {
          id: registered.register.id,
          displayName: registered.register.displayName,
          phone: registered.register.phone,
        };
        loginCognito(tokens, user);
        void navigate("/feed");
      }
    } catch (err: unknown) {
      setError(formatCognitoError(err));
    } finally {
      setLoading(false);
    }
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Enter the verification code sent to {phone}.
        </p>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            className={INPUT_CLASS}
            placeholder="123456"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleStep2();
            }}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button className={PRIMARY_BTN_CLASS} disabled={loading} onClick={() => void handleStep2()}>
          {loading ? "Verifying..." : "Verify & Sign Up"}
        </button>
        <button
          type="button"
          className="text-xs text-[var(--color-text-tertiary)] underline"
          onClick={() => {
            setStep(1);
            setOtp("");
            setError("");
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Phone
        </label>
        <input
          type="tel"
          className={INPUT_CLASS}
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Display Name
        </label>
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="Your name"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleStep1();
          }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button className={PRIMARY_BTN_CLASS} disabled={loading} onClick={() => void handleStep1()}>
        {loading ? "Sending code..." : "Sign Up"}
      </button>
    </div>
  );
}

// ─── Cognito Sign In Flow ───

function CognitoSignInFlow() {
  const { loginCognito } = useAuth();
  const navigate = useNavigate();
  const urqlClient = useClient();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError("");
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Phone number is required.");
      return;
    }

    const config = getCognitoConfig();
    if (!config) {
      setError("Cognito is not configured.");
      return;
    }

    setLoading(true);
    try {
      const tokens: AuthTokens = await cognitoSignIn(config, trimmedPhone);

      // Look up user from backend
      const result = await urqlClient
        .query(USER_BY_PHONE_QUERY, { phone: trimmedPhone }, { requestPolicy: "network-only" })
        .toPromise();
      const userData = result.data as UserByPhoneData | undefined;
      const backendUser = userData?.userByPhone;

      if (backendUser) {
        const user: CurrentUser = {
          id: backendUser.id,
          displayName: backendUser.displayName,
          phone: backendUser.phone,
        };
        loginCognito(tokens, user);
        void navigate("/feed");
      } else {
        setError("No account found for this phone number. Please sign up first.");
      }
    } catch (err: unknown) {
      setError(formatCognitoError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Phone
        </label>
        <input
          type="tel"
          className={INPUT_CLASS}
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSignIn();
          }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button className={PRIMARY_BTN_CLASS} disabled={loading} onClick={() => void handleSignIn()}>
        {loading ? "Logging in..." : "Log In"}
      </button>
    </div>
  );
}

// ─── Local Sign In (original) ───

function LocalLoginForm() {
  const { loginLocal } = useAuth();
  const navigate = useNavigate();
  const urqlClient = useClient();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Phone number is required.");
      return;
    }

    if (!isApiMode()) {
      const demo = DEMO_USERS.find((u) => u.phone === trimmedPhone);
      if (demo) {
        loginLocal({ id: demo.id, displayName: demo.displayName, phone: demo.phone });
        void navigate("/feed");
      } else {
        setError("User not found. Try a demo account or sign up.");
      }
      return;
    }

    setLoading(true);
    try {
      const result = await urqlClient
        .query(USER_BY_PHONE_QUERY, { phone: trimmedPhone }, { requestPolicy: "network-only" })
        .toPromise();
      const userData = result.data as UserByPhoneData | undefined;
      const user = userData?.userByPhone;
      if (user) {
        loginLocal({ id: user.id, displayName: user.displayName, phone: user.phone });
        void navigate("/feed");
      } else {
        setError("No account found for this phone number.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Phone
        </label>
        <input
          type="tel"
          className={INPUT_CLASS}
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleLogin();
          }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button className={PRIMARY_BTN_CLASS} disabled={loading} onClick={() => void handleLogin()}>
        {loading ? "Logging in..." : "Log In"}
      </button>
    </div>
  );
}

// ─── Local Sign Up (original) ───

function LocalSignupForm() {
  const { loginLocal } = useAuth();
  const navigate = useNavigate();
  const [, executeRegister] = useMutation(REGISTER_MUTATION);

  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");
    const trimmedPhone = phone.trim();
    const trimmedName = displayName.trim();
    if (!trimmedPhone) {
      setError("Phone number is required.");
      return;
    }
    if (!trimmedName) {
      setError("Display name is required.");
      return;
    }

    if (!isApiMode()) {
      const mockUser: CurrentUser = {
        id: `user-${crypto.randomUUID().slice(0, 8)}`,
        displayName: trimmedName,
        phone: trimmedPhone,
      };
      loginLocal(mockUser);
      void navigate("/feed");
      return;
    }

    setLoading(true);
    try {
      const cognitoSub = crypto.randomUUID();
      const result = await executeRegister({
        phone: trimmedPhone,
        cognitoSub,
        displayName: trimmedName,
      });
      if (result.error) {
        setError(result.error.message || "Registration failed.");
        return;
      }
      const registered = result.data as RegisterData | undefined;
      if (registered?.register) {
        loginLocal({
          id: registered.register.id,
          displayName: registered.register.displayName,
          phone: registered.register.phone,
        });
        void navigate("/feed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Phone
        </label>
        <input
          type="tel"
          className={INPUT_CLASS}
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Display Name
        </label>
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="Your name"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSignup();
          }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button className={PRIMARY_BTN_CLASS} disabled={loading} onClick={() => void handleSignup()}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </div>
  );
}

// ─── Main Login Page ───

export function LoginPage() {
  const { loginLocal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const cognitoMode = isCognitoMode();

  const handleDemoLogin = useCallback(
    (demo: DemoUser) => {
      const user: CurrentUser = { id: demo.id, displayName: demo.displayName, phone: demo.phone };
      loginLocal(user);
      void navigate("/feed");
    },
    [loginLocal, navigate],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
          Welcome to FamilyApp
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
          Stay connected with your family
        </p>

        {/* Tab toggle */}
        <div className="flex mb-6 border border-[var(--color-border-secondary)] rounded-lg overflow-hidden">
          <button
            onClick={() => {
              setActiveTab("login");
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === "login"
                ? "bg-[var(--color-accent-primary)] text-white"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === "signup"
                ? "bg-[var(--color-accent-primary)] text-white"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" && (cognitoMode ? <CognitoSignInFlow /> : <LocalLoginForm />)}

        {activeTab === "signup" && (cognitoMode ? <CognitoSignUpFlow /> : <LocalSignupForm />)}

        {/* Demo login buttons — only in local mode */}
        {!cognitoMode && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[var(--color-border-secondary)]" />
              <span className="text-xs text-[var(--color-text-tertiary)]">or</span>
              <div className="flex-1 h-px bg-[var(--color-border-secondary)]" />
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-3 text-center">
              Quick demo login (pre-seeded users)
            </p>
            <div className="flex flex-col gap-3">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => {
                    handleDemoLogin(demo);
                  }}
                  className="p-4 rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent-primary)] transition-colors text-left"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {demo.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{demo.id}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
