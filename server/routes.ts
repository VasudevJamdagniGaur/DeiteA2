import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import chatRouter from './routes/chat';
import memoryRouter from './routes/memory';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register routes
  app.use('/api', chatRouter);
  app.use('/api/memory', memoryRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
