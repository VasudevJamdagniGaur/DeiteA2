import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.Deite.app",
  appName: "Deite",
  webDir: "dist/public",
  server: {
    androidScheme: "https"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
