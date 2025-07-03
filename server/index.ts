import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import chatRoutes from "./routes/chat";
import memoryRoutes from "./routes/memory";
import testRoutes from "./routes/test";

const app = express();

// Middleware for parsing JSON and URL-encoded bodies
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // API Routes
  app.use("/api/chat", chatRoutes);
  app.use("/api/memory", memoryRoutes);
  app.use("/api/test", testRoutes);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Ensure we're sending JSON response
    res.status(status).json({ 
      error: message,
      details: err.details || undefined
    });
  });

  // Basic health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Test RunPod connection
  app.get("/api/test-connection", async (req, res) => {
    try {
      const axios = require('axios');
      const response = await axios.post(
        "https://3rmrq1jedsycggoi31zb:vptvj3af97gmus2h9i54@5izso1r2m2isue-19123-3rmrq1jedsycggoi31zb.proxy.runpod.net/api/generate",
        {
          model: "llama3:70",
          prompt: "Say hello",
          stream: false,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      res.json({
        status: "RunPod connection successful",
        response: response.data.response
      });
    } catch (error: any) {
      res.status(500).json({
        status: "RunPod connection failed",
        error: error.message
      });
    }
  });

  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    console.log(`404 - API endpoint not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'API endpoint not found', path: req.url });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    console.log(`Available routes:`);
    console.log(`- POST /api/chat/chat`);
    console.log(`- POST /api/chat/reflection`);
    console.log(`- GET /api/chat/test`);
    console.log(`- GET /api/health`);
    console.log(`- GET /api/test-connection`);
  });
})();