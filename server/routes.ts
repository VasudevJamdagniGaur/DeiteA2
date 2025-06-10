import { Express } from "express";
import { storage } from "./storage";
import { insertUserSchema, insertReflectionSchema } from "@shared/schema";
import { Request, Response } from "express";

export async function registerRoutes(app: Express): Promise<void> {
  // Get user by Firebase UID
  app.get("/api/users/:uid", async (req: Request, res: Response) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Get reflection by UID and date
  app.get("/api/reflections/:uid/:date", async (req: Request, res: Response) => {
    try {
      const { uid, date } = req.params;
      const reflection = await storage.getReflection(uid, date);
      
      if (!reflection) {
        return res.status(404).json({ error: "Reflection not found" });
      }
      
      res.json(reflection);
    } catch (error) {
      console.error("Error getting reflection:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create or update reflection
  app.post("/api/reflections", async (req: Request, res: Response) => {
    try {
      const reflectionData = insertReflectionSchema.parse(req.body);
      const reflection = await storage.createOrUpdateReflection(reflectionData);
      res.json(reflection);
    } catch (error) {
      console.error("Error saving reflection:", error);
      res.status(400).json({ error: "Invalid reflection data" });
    }
  });


}