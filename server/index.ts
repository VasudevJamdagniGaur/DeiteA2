import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for development and mobile app
app.use((req, res, next) => {
  // Allow all origins for mobile apps
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, User-Agent');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Add mobile-specific headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

// Add mobile app detection middleware
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobileApp = userAgent.includes('Capacitor') || 
                     userAgent.includes('ionic') || 
                     userAgent.includes('Android') || 
                     userAgent.includes('iPhone') ||
                     userAgent.includes('iPad');
  
  // Add mobile app info to request
  req.isMobileApp = isMobileApp;
  
  if (isMobileApp) {
    console.log('=== MOBILE APP DETECTED ===');
    console.log('User-Agent:', userAgent);
    console.log('Request from:', req.ip);
  }
  
  next();
});

/* -------------------
   TEMP DEBUG MIDDLEWARES
   -------------------
   - Incoming request logger: shows exactly what the APK hits (method, url, ip, user-agent)
   - /ping: simple JSON endpoint to confirm device reachability
   - POST body logger: logs JSON bodies for POST requests (remove in production)
*/
app.use((req, res, next) => {
  console.log(">>> INCOMING REQUEST:", {
    method: req.method,
    originalUrl: req.originalUrl,
    path: req.path,
    hostname: req.hostname,
    ip: req.ip,
    ua: req.headers['user-agent'],
  });
  next();
});

app.get('/ping', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    originalUrl: req.originalUrl,
    hostname: req.hostname,
  });
});

// TEMP: log JSON bodies for debugging (remove after diagnosing)
app.use((req, res, next) => {
  if (req.method === 'POST') {
    try {
      // limit length to avoid huge logs
      const bodyPreview = req.body ? JSON.stringify(req.body).slice(0, 2000) : '[empty]';
      console.log(">>> REQ BODY:", req.originalUrl, bodyPreview);
    } catch (e) {
      // ignore circular structure errors
    }
  }
  next();
});

/* -------------------
   Existing logging middleware (keeps your previous behavior)
   ------------------- */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-ignore - we intentionally override for logging
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

// Health check specifically for APK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
    backend: 'replit',
    runpodUrl: 'https://kn8ufll4a3omqi-11434.proxy.runpod.net:11434/',
    deploymentUrl: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
    userAgent: req.headers['user-agent'],
    fromAPK: req.headers['user-agent']?.includes('Capacitor') || false
  });
});

// Test endpoint specifically for APK
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log("=== APK CONNECTION TEST ===");
    console.log("Headers:", req.headers);

    res.json({
      success: true,
      message: "APK successfully connected to Replit backend",
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test RunPod connectivity directly
app.get('/api/test-runpod', async (req, res) => {
  try {
    console.log("=== TESTING RUNPOD CONNECTIVITY ===");
    
    const axios = require('axios');
    const response = await axios.post(
      "https://kn8ufll4a3omqi-11434.proxy.runpod.net:11434/api/generate",
      {
        model: "llama3:70b",
        prompt: "Hello, this is a test. Please respond with 'RunPod is working!'",
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("RunPod test successful:", response.data);
    
    res.json({
      success: true,
      message: "RunPod is working!",
      runpodResponse: response.data.response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("RunPod test failed:", error);
    res.status(500).json({
      success: false,
      error: "RunPod test failed",
      details: error.message,
      code: error.code,
      status: error.response?.status
    });
  }
});

(async () => {
  const server = await registerRoutes(app);

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

  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
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
  const port = process.env.PORT || 5000;;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();