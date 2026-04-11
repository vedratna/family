import { useState, useCallback } from "react";

type AuthStep = "phone" | "otp" | "profile" | "authenticated";

interface AuthState {
  step: AuthStep;
  phone: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    step: "phone",
    phone: "",
  });

  const submitPhone = useCallback((phone: string) => {
    setState({ step: "otp", phone });
    // TODO: trigger Cognito OTP via API
  }, []);

  const verifyOtp = useCallback((_otp: string) => {
    setState((prev) => ({ ...prev, step: "profile" }));
    // TODO: verify OTP with Cognito, get tokens
  }, []);

  const resendOtp = useCallback(() => {
    // TODO: resend OTP via Cognito
  }, []);

  const completeProfile = useCallback(() => {
    setState((prev) => ({ ...prev, step: "authenticated" }));
    // TODO: create/update user profile via API
  }, []);

  return {
    step: state.step,
    phone: state.phone,
    submitPhone,
    verifyOtp,
    resendOtp,
    completeProfile,
  };
}
