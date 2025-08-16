
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.Deite.app",
  appName: "Deite - AI Companion",
  webDir: "dist",
  server: {
    androidScheme: "https",
    allowNavigation: [
      "deite-a2-vasudevjamdagnigaur.repl.co",
      "*.repl.co",
      "g0r8vprssr0m80-11434.proxy.runpod.net",
      "*.runpod.net"
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e293b",
      showSpinner: false
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
