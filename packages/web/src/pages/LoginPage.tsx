import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useClient, useMutation } from "urql";

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

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("login");

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [signupPhone, setSignupPhone] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupError, setSignupError] = useState("");

  // urql hooks
  const urqlClient = useClient();
  const [registerResult, executeRegister] = useMutation(REGISTER_MUTATION);

  const handleDemoLogin = useCallback(
    (demo: DemoUser) => {
      const user: CurrentUser = { id: demo.id, displayName: demo.displayName, phone: demo.phone };
      login(user);
      void navigate("/feed");
    },
    [login, navigate],
  );

  async function handleLogin() {
    setLoginError("");
    const phone = loginPhone.trim();
    if (!phone) {
      setLoginError("Phone number is required.");
      return;
    }

    if (!isApiMode()) {
      // Mock mode: look up demo user by phone
      const demo = DEMO_USERS.find((u) => u.phone === phone);
      if (demo) {
        handleDemoLogin(demo);
      } else {
        setLoginError("User not found. Try a demo account or sign up.");
      }
      return;
    }

    // API mode: query userByPhone
    setLoginLoading(true);
    try {
      const result = await urqlClient
        .query(USER_BY_PHONE_QUERY, { phone }, { requestPolicy: "network-only" })
        .toPromise();
      const userData = result.data as UserByPhoneData | undefined;
      const user = userData?.userByPhone;
      if (user) {
        login({ id: user.id, displayName: user.displayName, phone: user.phone });
        void navigate("/feed");
      } else {
        setLoginError("No account found for this phone number.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSignup() {
    setSignupError("");
    const phone = signupPhone.trim();
    const displayName = signupName.trim();
    if (!phone) {
      setSignupError("Phone number is required.");
      return;
    }
    if (!displayName) {
      setSignupError("Display name is required.");
      return;
    }

    if (!isApiMode()) {
      // Mock mode: just set user in auth context
      const mockUser: CurrentUser = {
        id: `user-${crypto.randomUUID().slice(0, 8)}`,
        displayName,
        phone,
      };
      login(mockUser);
      void navigate("/feed");
      return;
    }

    // API mode: call register mutation
    const cognitoSub = crypto.randomUUID();
    const result = await executeRegister({ phone, cognitoSub, displayName });
    if (result.error) {
      setSignupError(result.error.message || "Registration failed.");
      return;
    }
    const registered = result.data as RegisterData | undefined;
    if (registered?.register) {
      login({
        id: registered.register.id,
        displayName: registered.register.displayName,
        phone: registered.register.phone,
      });
      void navigate("/feed");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors";
  const primaryBtnClass =
    "w-full py-2.5 rounded-lg bg-[var(--color-accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50";

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

        {activeTab === "login" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Phone
              </label>
              <input
                type="tel"
                className={inputClass}
                placeholder="+1 555 000 0000"
                value={loginPhone}
                onChange={(e) => {
                  setLoginPhone(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleLogin();
                }}
              />
            </div>
            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
            <button
              className={primaryBtnClass}
              disabled={loginLoading}
              onClick={() => void handleLogin()}
            >
              {loginLoading ? "Logging in..." : "Log In"}
            </button>
          </div>
        )}

        {activeTab === "signup" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Phone
              </label>
              <input
                type="tel"
                className={inputClass}
                placeholder="+1 555 000 0000"
                value={signupPhone}
                onChange={(e) => {
                  setSignupPhone(e.target.value);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Display Name
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Your name"
                value={signupName}
                onChange={(e) => {
                  setSignupName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSignup();
                }}
              />
            </div>
            {signupError && <p className="text-xs text-red-500">{signupError}</p>}
            <button
              className={primaryBtnClass}
              disabled={registerResult.fetching}
              onClick={() => void handleSignup()}
            >
              {registerResult.fetching ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--color-border-secondary)]" />
          <span className="text-xs text-[var(--color-text-tertiary)]">or</span>
          <div className="flex-1 h-px bg-[var(--color-border-secondary)]" />
        </div>

        {/* Demo login buttons */}
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
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{demo.label}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{demo.id}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
