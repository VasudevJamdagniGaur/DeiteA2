import { users, reflections, type User, type InsertUser, type Reflection, type InsertReflection } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getReflection(uid: string, date: string): Promise<Reflection | undefined>;
  createOrUpdateReflection(reflection: InsertReflection): Promise<Reflection>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getReflection(uid: string, date: string): Promise<Reflection | undefined> {
    const [reflection] = await db
      .select()
      .from(reflections)
      .where(and(eq(reflections.uid, uid), eq(reflections.date, date)));
    return reflection || undefined;
  }

  async createOrUpdateReflection(reflection: InsertReflection): Promise<Reflection> {
    const existing = await this.getReflection(reflection.uid, reflection.date);
    
    if (existing) {
      const [updated] = await db
        .update(reflections)
        .set({ content: reflection.content, updatedAt: new Date() })
        .where(and(eq(reflections.uid, reflection.uid), eq(reflections.date, reflection.date)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(reflections)
        .values(reflection)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
