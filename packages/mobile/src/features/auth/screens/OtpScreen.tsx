import { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { useTheme } from "../../../shared/theme";

const OTP_LENGTH = 6;

interface OtpScreenProps {
  phone: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export function OtpScreen({ phone, onVerify, onResend }: OtpScreenProps) {
  const theme = useTheme();
  const [digits, setDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value !== "" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = newDigits.join("");
    if (otp.length === OTP_LENGTH) {
      onVerify(otp);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Enter the code we sent to
      </Text>
      <Text style={[styles.phone, { color: theme.colors.text.primary }]}>{phone}</Text>

      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              {
                color: theme.colors.text.primary,
                borderColor:
                  digit !== "" ? theme.colors.accent.primary : theme.colors.border.primary,
                backgroundColor: theme.colors.background.card,
              },
            ]}
            value={digit}
            onChangeText={(value) => {
              handleDigitChange(index, value);
            }}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            testID={`otp-digit-${String(index)}`}
          />
        ))}
      </View>

      <Text
        style={[styles.resend, { color: theme.colors.accent.primary }]}
        onPress={onResend}
        testID="resend-button"
      >
        Didn't receive it? Resend
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 30,
  },
  phone: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: 32,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    fontSize: 24,
    fontWeight: "600",
    borderWidth: 1.5,
    borderRadius: 12,
  },
  resend: {
    fontSize: 14,
    textAlign: "center",
  },
});
