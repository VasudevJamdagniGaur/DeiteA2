import express from "express";
import cors from "cors";
import axios from "axios"; // Import axios at the top
import { registerRoutes } from "./routes";
import { getRunPodConfig } from "./config";

const app = express();
const PORT = process.env.PORT || 3000;

// Extend Express Request interface for mobile app detection
declare global {
  namespace Express {
    interface Request {
      isMobileApp?: boolean;
    }
  }
}

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enhanced CORS for mobile apps
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "User-Agent",
    ],
  }),
);

// Handle preflight requests
app.options("*", (req, res) => {
  res.status(200).end();
  return;
});

// Mobile app detection middleware
app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase(),
    );

  if (isMobile) {
    req.isMobileApp = true;
    console.log("=== MOBILE APP DETECTED ===");
    console.log("User-Agent:", userAgent);
    console.log("Remote IP:", req.ip);
  }

  next();
});

// Override res.json to log responses
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (bodyJson: any) {
    console.log(
      `Response sent to ${req.isMobileApp ? "MOBILE APP" : "WEB"}:`,
      JSON.stringify(bodyJson, null, 2),
    );
    return originalJson.call(this, bodyJson);
  };
  next();
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    console.log("=== HEALTH CHECK REQUESTED ===");
    console.log("From:", req.isMobileApp ? "MOBILE APP" : "WEB");
    console.log("User-Agent:", req.headers["user-agent"]);
    console.log("Remote IP:", req.ip);

    // Test RunPod connectivity
    const runpodConfig = getRunPodConfig();
    console.log("Testing RunPod URL:", runpodConfig.url);

    const response = await axios.post(
      runpodConfig.url,
      {
        model: runpodConfig.model,
        prompt: "Health check - respond with 'OK'",
        stream: false,
        options: {
          keep_alive: -1,
          num_predict: 50,
        },
      },
      {
        timeout: runpodConfig.timeout,
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.data && response.data.response) {
      console.log("✅ RunPod is responding");
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        runpod: "connected",
        runpod_response: response.data.response,
        isMobileApp: req.isMobileApp || false,
      });
    } else {
      throw new Error("Invalid response from RunPod");
    }
  } catch (error: any) {
    console.error("❌ Health check failed:", error.message);
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      runpod: "disconnected",
      error: error.message,
      isMobileApp: req.isMobileApp || false,
    });
  }
});

// Test RunPod endpoint
app.get("/api/test-runpod", async (req, res) => {
  try {
    console.log("=== TEST RUNPOD ENDPOINT ===");

    console.log("From:", req.isMobileApp ? "MOBILE APP" : "WEB");

    const runpodConfig = getRunPodConfig();
    console.log("Testing RunPod URL:", runpodConfig.url);

    const response = await axios.post(
      runpodConfig.url,
      {
        model: runpodConfig.model,
        prompt:
          "This is a test message. Please respond with 'Hello from RunPod!'",
        stream: false,
        options: {
          keep_alive: -1,
          num_predict: 50,
        },
      },
      {
        timeout: runpodConfig.timeout,
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("✅ RunPod test successful");
    res.json({
      status: "success",
      message: "RunPod is working correctly",
      runpod_url: runpodConfig.url,
      response: response.data.response,
      timestamp: new Date().toISOString(),
      isMobileApp: req.isMobileApp || false,
    });
  } catch (error: any) {
    console.error("❌ RunPod test failed:", error.message);
    res.status(500).json({
      status: "failed",
      message: "RunPod test failed",
      error: error.message,
      details: {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
      timestamp: new Date().toISOString(),
      isMobileApp: req.isMobileApp || false,
    });
  }
});

// Setup server function
async function startServer() {
  // Register all routes
  const httpServer = await registerRoutes(app);

  // Setup Vite for development or serve static files for production
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, httpServer);
  } else {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  }

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error handler:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      timestamp: new Date().toISOString(),
      isMobileApp: req.isMobileApp || false,
    });
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Mobile app detection: ENABLED`);
    console.log(`🔗 RunPod URL: ${getRunPodConfig().url}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test RunPod: http://localhost:${PORT}/api/test-runpod`);
  });
}

// Start the server
startServer().catch(console.error);