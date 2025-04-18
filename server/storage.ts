import { users, type User, type InsertUser, conclusions, type Conclusion, type InsertConclusion, biasTestResults, type BiasTestResult, type InsertBiasTestResult } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conclusion operations
  saveConclusion(conclusion: InsertConclusion): Promise<Conclusion>;
  getConclusionByUserId(userId: number): Promise<Conclusion | undefined>;
  
  // Bias test results operations
  saveBiasTestResult(result: InsertBiasTestResult): Promise<BiasTestResult>;
  getBiasTestResultsByUserId(userId: number): Promise<BiasTestResult[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async saveConclusion(conclusion: InsertConclusion): Promise<Conclusion> {
    const [savedConclusion] = await db
      .insert(conclusions)
      .values(conclusion)
      .returning();
    return savedConclusion;
  }
  
  async getConclusionByUserId(userId: number): Promise<Conclusion | undefined> {
    const [conclusion] = await db
      .select()
      .from(conclusions)
      .where(eq(conclusions.userId, userId))
      .orderBy(conclusions.createdAt);
    return conclusion || undefined;
  }
  
  async saveBiasTestResult(result: InsertBiasTestResult): Promise<BiasTestResult> {
    const [savedResult] = await db
      .insert(biasTestResults)
      .values(result)
      .returning();
    return savedResult;
  }
  
  async getBiasTestResultsByUserId(userId: number): Promise<BiasTestResult[]> {
    return db
      .select()
      .from(biasTestResults)
      .where(eq(biasTestResults.userId, userId));
  }
}

export const storage = new DatabaseStorage();
