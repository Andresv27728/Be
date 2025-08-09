import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  role: text("role").default("member"), // member, admin, owner, premium
  isActive: boolean("is_active").default(true),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  memberCount: integer("member_count").default(0),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").$type<{
    allowCommands: boolean;
    autoWelcome: boolean;
    antiSpam: boolean;
  }>().default({
    allowCommands: true,
    autoWelcome: true,
    antiSpam: false,
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").references(() => groups.id),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, sticker, audio, command
  isFromBot: boolean("is_from_bot").default(false),
  metadata: jsonb("metadata").$type<{
    command?: string;
    stickerId?: string;
    gameData?: any;
  }>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const commands = pgTable("commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  usage: text("usage").notNull(),
  category: text("category").default("general"), // general, admin, fun, games
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  response: text("response").notNull(),
  requiredRole: text("required_role").default("member"),
  cooldown: integer("cooldown").default(0), // seconds
});

export const statistics = pgTable("statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  totalMessages: integer("total_messages").default(0),
  totalCommands: integer("total_commands").default(0),
  activeUsers: integer("active_users").default(0),
  activeGroups: integer("active_groups").default(0),
  hourlyData: jsonb("hourly_data").$type<{
    [hour: string]: {
      messages: number;
      commands: number;
      users: number;
    };
  }>().default({}),
});

export const botStatus = pgTable("bot_status", {
  id: varchar("id").primaryKey().default("bot_status"),
  isConnected: boolean("is_connected").default(false),
  connectionMethod: text("connection_method"), // qr, pin
  lastConnection: timestamp("last_connection"),
  uptime: integer("uptime").default(0), // seconds
  memoryUsage: integer("memory_usage").default(0), // MB
  cpuUsage: integer("cpu_usage").default(0), // percentage
  version: text("version").default("2.0.1"),
  qrCode: text("qr_code"),
  pinCode: text("pin_code"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastSeen: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
  usageCount: true,
  lastUsed: true,
});

export const insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).omit({
  id: true,
  lastConnection: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Command = typeof commands.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;

export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
