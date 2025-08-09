"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertBotStatusSchema = exports.insertStatisticsSchema = exports.insertCommandSchema = exports.insertMessageSchema = exports.insertGroupSchema = exports.insertUserSchema = exports.botStatus = exports.statistics = exports.commands = exports.messages = exports.groups = exports.users = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    phone: (0, pg_core_1.text)("phone"),
    level: (0, pg_core_1.integer)("level").default(1),
    experience: (0, pg_core_1.integer)("experience").default(0),
    role: (0, pg_core_1.text)("role").default("member"), // member, admin, owner, premium
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastSeen: (0, pg_core_1.timestamp)("last_seen").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.groups = (0, pg_core_1.pgTable)("groups", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    avatar: (0, pg_core_1.text)("avatar"),
    memberCount: (0, pg_core_1.integer)("member_count").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    settings: (0, pg_core_1.jsonb)("settings").$type().default({
        allowCommands: true,
        autoWelcome: true,
        antiSpam: false,
    }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    groupId: (0, pg_core_1.varchar)("group_id").references(function () { return exports.groups.id; }),
    userId: (0, pg_core_1.varchar)("user_id").references(function () { return exports.users.id; }),
    content: (0, pg_core_1.text)("content").notNull(),
    messageType: (0, pg_core_1.text)("message_type").default("text"), // text, sticker, audio, command
    isFromBot: (0, pg_core_1.boolean)("is_from_bot").default(false),
    metadata: (0, pg_core_1.jsonb)("metadata").$type(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
exports.commands = (0, pg_core_1.pgTable)("commands", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description").notNull(),
    usage: (0, pg_core_1.text)("usage").notNull(),
    category: (0, pg_core_1.text)("category").default("general"), // general, admin, fun, games
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    lastUsed: (0, pg_core_1.timestamp)("last_used"),
    response: (0, pg_core_1.text)("response").notNull(),
    requiredRole: (0, pg_core_1.text)("required_role").default("member"),
    cooldown: (0, pg_core_1.integer)("cooldown").default(0), // seconds
});
exports.statistics = (0, pg_core_1.pgTable)("statistics", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    date: (0, pg_core_1.text)("date").notNull(), // YYYY-MM-DD format
    totalMessages: (0, pg_core_1.integer)("total_messages").default(0),
    totalCommands: (0, pg_core_1.integer)("total_commands").default(0),
    activeUsers: (0, pg_core_1.integer)("active_users").default(0),
    activeGroups: (0, pg_core_1.integer)("active_groups").default(0),
    hourlyData: (0, pg_core_1.jsonb)("hourly_data").$type().default({}),
});
exports.botStatus = (0, pg_core_1.pgTable)("bot_status", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default("bot_status"),
    isConnected: (0, pg_core_1.boolean)("is_connected").default(false),
    connectionMethod: (0, pg_core_1.text)("connection_method"), // qr, pin
    lastConnection: (0, pg_core_1.timestamp)("last_connection"),
    uptime: (0, pg_core_1.integer)("uptime").default(0), // seconds
    memoryUsage: (0, pg_core_1.integer)("memory_usage").default(0), // MB
    cpuUsage: (0, pg_core_1.integer)("cpu_usage").default(0), // percentage
    version: (0, pg_core_1.text)("version").default("2.0.1"),
    qrCode: (0, pg_core_1.text)("qr_code"),
    pinCode: (0, pg_core_1.text)("pin_code"),
});
// Insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    lastSeen: true,
});
exports.insertGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.groups).omit({
    id: true,
    createdAt: true,
});
exports.insertMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.messages).omit({
    id: true,
    timestamp: true,
});
exports.insertCommandSchema = (0, drizzle_zod_1.createInsertSchema)(exports.commands).omit({
    id: true,
    usageCount: true,
    lastUsed: true,
});
exports.insertStatisticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.statistics).omit({
    id: true,
});
exports.insertBotStatusSchema = (0, drizzle_zod_1.createInsertSchema)(exports.botStatus).omit({
    id: true,
    lastConnection: true,
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
