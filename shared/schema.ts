import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game stats table schema
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  username: varchar("username", { length: 255 }),
  score: integer("score").notNull(),
  categoryId: integer("category_id").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  incorrectAnswers: integer("incorrect_answers").notNull(),
  datePlayed: timestamp("date_played").notNull(),
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
});

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;

// Leaderboard view
export const leaderboard = pgTable("leaderboard_view", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }),
  score: integer("score").notNull(),
  categoryId: integer("category_id").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  datePlayed: timestamp("date_played").notNull(),
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
