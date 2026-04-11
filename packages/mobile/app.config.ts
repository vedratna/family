import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "FamilyApp",
  slug: "family-app",
  version: "1.0.0",
  scheme: "familyapp",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    backgroundColor: "#FAFAF8",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.familyapp.mobile",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FAFAF8",
    },
    package: "com.familyapp.mobile",
  },
  extra: {
    MOCK_MODE: process.env["MOCK_MODE"] ?? "true",
    API_URL: process.env["API_URL"] ?? "http://localhost:4000/graphql",
    STAGE: process.env["STAGE"] ?? "dev",
  },
};

export default config;
