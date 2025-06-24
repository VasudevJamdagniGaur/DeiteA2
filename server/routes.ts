import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import chatRouter from './routes/chat';
import memoryRouter from './routes/memory';
import testRouter from './routes/test';
import demoRouter from './routes/demo';
import simpleDemoRouter from './routes/simple-demo';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register routes
  app.use('/api', chatRouter);
  app.use('/api/memory', memoryRouter);
  app.use('/api/test', testRouter);
  app.use('/api/demo', demoRouter);
  app.use('/api/simple', simpleDemoRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
