import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import chatRouter from './routes/chat';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register chat route first to ensure it takes precedence
  app.use('/api', chatRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
