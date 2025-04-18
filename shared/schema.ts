import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  displayName: text("display_name"),
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
