/**
 * Server-specific schema definitions
 * 
 * This file re-exports all tables from the shared schema and adds additional tables
 * that are only used by the server.
 */

// Re-export all tables from shared schema
export * from '@shared/schema';

// Import necessary dependencies
import { pgTable, text, uuid, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from '@shared/schema';

// Notification table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  link: text("link"),
  data: jsonb("data"),
});

// Device table for push notifications
export const devices = pgTable("devices", {
  id: uuid("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  platform: text("platform").notNull(), // ios, android, web
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
  pushEnabled: boolean("push_enabled").notNull().default(true),
});

// Audit log table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
});

// API metrics table
export const apiMetrics = pgTable("api_metrics", {
  id: uuid("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// System metrics table
export const systemMetrics = pgTable("system_metrics", {
  id: uuid("id").primaryKey(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(),
  activeConnections: integer("active_connections").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
