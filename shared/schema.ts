import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["teacher", "admin", "student"] }).notNull().default("student"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  displayName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conclusions = pgTable("conclusions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConclusionSchema = createInsertSchema(conclusions).pick({
  userId: true,
  content: true,
});

export type InsertConclusion = z.infer<typeof insertConclusionSchema>;
export type Conclusion = typeof conclusions.$inferSelect;

export const biasTestResults = pgTable("bias_test_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  template: text("template").notNull(),
  substitution: text("substitution").notNull(),
  result: text("result").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBiasTestResultSchema = createInsertSchema(biasTestResults).pick({
  userId: true,
  template: true,
  substitution: true,
  result: true,
});

export type InsertBiasTestResult = z.infer<typeof insertBiasTestResultSchema>;
export type BiasTestResult = typeof biasTestResults.$inferSelect;

// Define message types
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'user', 'assistant', or 'system'
  content: text("content").notNull(),
  phase: integer("phase").notNull(), // 1, 2, or 3 - the learning phase
  paragraph: integer("paragraph"), // For phase 1, which paragraph is being discussed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  role: true,
  content: true,
  phase: true,
  paragraph: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Define engagement scores table
export const engagementScores = pgTable("engagement_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  paragraph: integer("paragraph").notNull(),
  score: integer("score").notNull(),
  engaged: boolean("engaged").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEngagementScoreSchema = createInsertSchema(engagementScores).pick({
  userId: true,
  paragraph: true,
  score: true,
  engaged: true,
  reason: true,
});

export type InsertEngagementScore = z.infer<typeof insertEngagementScoreSchema>;
export type EngagementScore = typeof engagementScores.$inferSelect;
